<?php
/* ============================================================
 * Vision 24 CRM · /auth
 * ============================================================
 * Authentification serveur — un seul compte autorisé.
 * URL : https://vision24.fr/api/auth.php
 *
 * ROUTES
 *   POST /auth.php               → { user, pass } → { ok, token, expires }
 *   POST /auth.php?verify=1      → header X-Vision-Auth → { ok, user }
 *
 * SÉCURITÉ
 *   - Rate limiting 5 tentatives / 60 s par IP
 *   - Mot de passe hashé avec password_hash (bcrypt)
 *   - Token signé HMAC (impossible à falsifier sans SHARED_SECRET)
 *   - Session 30 jours max
 * ============================================================ */

require_once __DIR__ . '/config.php';
cors_headers();
ensure_storage();

/* --------------------------------------------------------
 * ⚠️ MOT DE PASSE — À GÉNÉRER PUIS COLLER ICI
 * --------------------------------------------------------
 * Ouvre password-setup.html dans un navigateur, tape ton mot
 * de passe, copie le hash généré et colle-le entre les
 * guillemets ci-dessous.
 * Puis remplace ALLOWED_USER par ton identifiant.
 * -------------------------------------------------------- */
const ALLOWED_USER = 'ap.vision24@outlook.fr';
const PASSWORD_HASH = '$2b$10$J4LpNikLlu4B/RiSgdTe4.LgZYpC3Cm6KGiMd4FLQXoK8cm3X.57i';

/* -------------------------------------------------------- */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'method_not_allowed'], 405);
}

/* Vérification d'un token existant */
if (isset($_GET['verify'])) {
    $token = $_SERVER['HTTP_X_VISION_AUTH'] ?? '';
    $decoded = verify_auth_token($token);
    if (!$decoded) json_response(['ok' => false], 401);
    json_response(['ok' => true, 'user' => $decoded['user'], 'expires' => $decoded['expires']]);
}

/* Login */
$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!auth_rate_limit_check($ip)) {
    json_response(['error' => 'too_many_attempts', 'message' => 'Trop de tentatives. Réessaie dans 1 minute.'], 429);
}

$body = json_decode(file_get_contents('php://input'), true);
$user = trim($body['user'] ?? '');
$pass = $body['pass'] ?? '';

if (!$user || !$pass) {
    json_response(['error' => 'missing_credentials'], 400);
}

// Vérifie utilisateur autorisé
if (!hash_equals(ALLOWED_USER, $user)) {
    log_error("Tentative login refusée · user=$user · ip=$ip");
    // Réponse volontairement générique (pas d'info sur ce qui a échoué)
    sleep(1); // ralentit brute force
    json_response(['error' => 'invalid_credentials'], 401);
}

// Vérifie mot de passe
if (!password_verify($pass, PASSWORD_HASH)) {
    log_error("Tentative login refusée · mauvais mdp · user=$user · ip=$ip");
    sleep(1);
    json_response(['error' => 'invalid_credentials'], 401);
}

// Génère un token signé
$expires = time() + 30 * 24 * 3600; // 30 jours
$token = make_auth_token($user, $expires);

json_response(['ok' => true, 'user' => $user, 'token' => $token, 'expires' => $expires]);


/* ============================================================
 * Helpers
 * ============================================================ */
function make_auth_token(string $user, int $expires): string {
    $payload = base64_encode(json_encode(['user' => $user, 'expires' => $expires]));
    $sig = hash_hmac('sha256', $payload, SHARED_SECRET);
    return $payload . '.' . $sig;
}
function verify_auth_token(string $token): ?array {
    if (!$token || !str_contains($token, '.')) return null;
    [$payload, $sig] = explode('.', $token, 2);
    $expected = hash_hmac('sha256', $payload, SHARED_SECRET);
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(base64_decode($payload), true);
    if (!is_array($data) || ($data['expires'] ?? 0) < time()) return null;
    return $data;
}
function auth_rate_limit_check(string $ip): bool {
    $file = STORAGE_DIR . '/auth_rl_' . md5($ip) . '.json';
    $now = time();
    $list = file_exists($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
    $list = array_values(array_filter($list, fn($t) => $now - $t < 60));
    if (count($list) >= 5) return false;
    $list[] = $now;
    file_put_contents($file, json_encode($list));
    return true;
}
