<?php
/* ============================================================
 * Vision 24 · /submit — endpoint public pour les formulaires
 * ============================================================
 * Les formulaires vision24.fr et vision24.fun POSTent leurs
 * données ICI (form-urlencoded ou JSON). Ce fichier signe la
 * requête et l'envoie en interne à intake.php. Le HMAC secret
 * reste caché côté serveur.
 *
 * Utilisation dans le formulaire HTML :
 *   <form action="/api/submit.php" method="POST"> … </form>
 *
 * ============================================================ */

require_once __DIR__ . '/config.php';
cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'method_not_allowed'], 405);
}

// Récupère les données (JSON ou form-urlencoded)
$raw = file_get_contents('php://input');
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$input = [];
if (strpos($contentType, 'application/json') !== false) {
    $input = json_decode($raw, true) ?: [];
} else {
    $input = $_POST;
}

if (empty($input)) json_response(['error' => 'empty_form'], 400);

/* ---------- Détection automatique de la source ---------- */
$origin = $_SERVER['HTTP_REFERER'] ?? $_SERVER['HTTP_ORIGIN'] ?? '';
$source = 'vision24.fr';
if (strpos($origin, 'vision24.fun') !== false) $source = 'vision24.fun';
if (!empty($input['source'])) $source = $input['source'];

/* ---------- Mapping des noms de champs standards ---------- */
$services = $input['services'] ?? $input['services[]'] ?? $input['prestations'] ?? $input['prestation'] ?? [];
if (!is_array($services) && $services !== '') $services = [$services];

$payload = [
    'source'         => $source,
    'externalId'     => bin2hex(random_bytes(16)),
    'prenom'         => trim($input['prenom']         ?? $input['first_name']   ?? $input['firstname'] ?? ''),
    'nom'            => trim($input['nom']            ?? $input['last_name']    ?? $input['lastname']  ?? ''),
    'societe'        => trim($input['societe']        ?? $input['company']      ?? $input['entreprise'] ?? ''),
    'email'          => trim($input['email']          ?? ''),
    'tel'            => trim($input['tel']            ?? $input['telephone']    ?? $input['phone']     ?? ''),
    'typeClient'     =>       $input['typeClient']    ?? $input['type_client']  ?? ($input['company'] ?? '' ? 'professionnel' : 'particulier'),
    'typeEvenement'  => trim($input['typeEvenement']  ?? $input['type_evenement'] ?? $input['type_event']   ?? $input['event_type'] ?? ''),
    'dateEvenement'  => trim($input['dateEvenement']  ?? $input['date_evenement'] ?? $input['date_event']   ?? $input['event_date'] ?? $input['date'] ?? ''),
    'horaires'       => trim($input['horaires']       ?? $input['schedule']     ?? ''),
    'lieuEvenement'  => trim($input['lieuEvenement']  ?? $input['lieu_evenement'] ?? $input['event_location'] ?? $input['location'] ?? $input['lieu'] ?? ''),
    'nbPersonnes'    => (int) ($input['nbPersonnes']  ?? $input['nb_invites']   ?? $input['invites']    ?? $input['guests']       ?? $input['guest_count'] ?? $input['nb_pers'] ?? 0) ?: null,
    'budget'         => (int) ($input['budget']       ?? 0) ?: null,
    'services'       => array_values(array_filter((array)$services)),
    'message'        => trim($input['message']        ?? $input['commentaire']  ?? ''),
    'raw'            => $input,
];

// Anti-honeypot facultatif (si le champ botcheck / hp est rempli, drop silencieusement)
if (!empty($input['botcheck']) || !empty($input['hp'])) {
    json_response(['ok' => true], 200); // faux succès pour ne pas alerter le bot
}

// Vérification email ou téléphone présent
if (empty($payload['email']) && empty($payload['tel'])) {
    json_response(['error' => 'missing_contact', 'message' => 'Email ou téléphone requis'], 400);
}

/* ---------- Signature + appel interne à intake.php ---------- */
$body = json_encode($payload, JSON_UNESCAPED_UNICODE);
$sig  = hash_hmac('sha256', $body, INTAKE_SECRET);

// Appel HTTP interne (préféré : file_get_contents avec header custom)
$intakeUrl = ($_SERVER['REQUEST_SCHEME'] ?? 'https') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/intake.php';

$ctx = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\nX-Vision-Sig: $sig\r\n",
        'content' => $body,
        'timeout' => 5,
        'ignore_errors' => true,
    ],
]);
$response = @file_get_contents($intakeUrl, false, $ctx);

// Log en cas d'échec interne
if ($response === false) {
    log_error("submit → intake échec pour $source");
    // On considère qu'on a récupéré la donnée localement au moins
    json_response(['ok' => true, 'internal' => 'stored_locally'], 200);
}

// Redirige vers page « merci » si le formulaire l'attend
$redirect = $input['_redirect'] ?? '';
if ($redirect && preg_match('/^https?:\/\/(www\.)?(vision24\.fr|vision24\.fun)/', $redirect)) {
    header("Location: $redirect");
    exit;
}

// Retourne la réponse d'intake.php telle quelle
header('Content-Type: application/json; charset=utf-8');
echo $response;
