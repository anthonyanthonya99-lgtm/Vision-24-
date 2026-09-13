<?php
/* ============================================================
 * Vision 24 · Intake API — /ack
 * ============================================================
 * Le CRM POST la liste des IDs qu'il a bien intégrés pour
 * qu'ils soient retirés de la queue.
 * URL : https://vision24.fr/api/ack.php
 * Auth : header X-Vision-Token = SHARED_SECRET
 * ============================================================ */

require_once __DIR__ . '/config.php';
cors_headers();
ensure_storage();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'method_not_allowed'], 405);
}

if (!verify_shared_token()) {
    json_response(['error' => 'unauthorized'], 401);
}

$body = file_get_contents('php://input');
$data = json_decode($body, true);
$ids = $data['ids'] ?? [];
if (!is_array($ids)) json_response(['error' => 'invalid_ids'], 400);

$queue = load_queue();
$queue = array_values(array_filter($queue, fn($id) => !in_array($id, $ids, true)));
save_queue($queue);

json_response([
    'ok' => true,
    'remaining' => count($queue),
    'acked' => count($ids),
]);
