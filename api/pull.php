<?php
/* ============================================================
 * Vision 24 · Intake API — /pull
 * ============================================================
 * Le CRM appelle ce endpoint toutes les 30 s pour récupérer
 * les nouvelles demandes.
 * URL : https://vision24.fr/api/pull.php
 * Auth : header X-Vision-Token = SHARED_SECRET
 * ============================================================ */

require_once __DIR__ . '/config.php';
cors_headers();
ensure_storage();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'method_not_allowed'], 405);
}

if (!verify_shared_token()) {
    json_response(['error' => 'unauthorized'], 401);
}

$queue = load_queue();
$demandes = [];
foreach ($queue as $id) {
    $path = demande_path($id);
    if (file_exists($path)) {
        $data = json_decode(file_get_contents($path), true);
        if ($data) $demandes[] = $data;
    }
}

json_response([
    'ok' => true,
    'count' => count($demandes),
    'demandes' => $demandes,
]);
