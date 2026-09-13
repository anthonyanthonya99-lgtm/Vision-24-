<?php
/* ============================================================
 * Vision 24 · Intake API — /intake
 * ============================================================
 * Reçoit une demande depuis un formulaire vision24.fr / .fun
 * URL publique : https://vision24.fr/api/intake.php
 *
 * SÉCURITÉ
 *   - HMAC-SHA256 obligatoire (header X-Vision-Sig)
 *   - Rate limiting par IP
 *   - Idempotence via externalId
 *
 * INPUT (JSON) minimum
 *   { source, email OR tel, ...tout autre champ conservé }
 *
 * OUTPUT
 *   { ok: true, id: "...", duplicate: false }
 * ============================================================ */

require_once __DIR__ . '/config.php';
cors_headers();
ensure_storage();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'method_not_allowed'], 405);
}

$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!rate_limit_check($ip)) {
    json_response(['error' => 'rate_limited'], 429);
}

// Lit le corps brut
$body = file_get_contents('php://input');
if (!$body) json_response(['error' => 'empty_body'], 400);

// Vérifie la signature
if (!verify_hmac_signature($body)) {
    log_error("intake: signature invalide depuis $ip");
    json_response(['error' => 'invalid_signature'], 401);
}

$payload = json_decode($body, true);
if (!is_array($payload)) {
    json_response(['error' => 'invalid_json'], 400);
}

// Validation minimale
if (empty($payload['source']) || (empty($payload['email']) && empty($payload['tel']))) {
    json_response([
        'error' => 'missing_fields',
        'required' => ['source', 'email OR tel'],
    ], 400);
}

// Idempotence via externalId
$externalId = $payload['externalId'] ?? uuidv4();
$externalMap = STORAGE_DIR . '/ext_' . md5($externalId) . '.txt';
if (file_exists($externalMap)) {
    $existingId = trim(file_get_contents($externalMap));
    json_response(['ok' => true, 'id' => $existingId, 'duplicate' => true]);
}

$id = uuidv4();
$record = array_merge($payload, [
    'id'         => $id,
    'externalId' => $externalId,
    'receivedAt' => (int)(microtime(true) * 1000),
    'ip'         => $ip,
    'userAgent'  => $_SERVER['HTTP_USER_AGENT'] ?? '',
]);

// Sauvegarde
file_put_contents(demande_path($id), json_encode($record, JSON_UNESCAPED_UNICODE), LOCK_EX);
file_put_contents($externalMap, $id);

// Ajoute à la queue
$queue = load_queue();
array_unshift($queue, $id);
if (count($queue) > 500) $queue = array_slice($queue, 0, 500);
save_queue($queue);

json_response(['ok' => true, 'id' => $id, 'duplicate' => false]);
