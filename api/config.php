<?php
/* ============================================================
 * Vision 24 · Intake API — Configuration
 * ============================================================
 * ⚠️ Modifie ces valeurs AVANT d'uploader sur Hostinger.
 * ============================================================ */

// Token secret partagé entre le CRM et cette API.
// Génère-le une fois : dans un terminal → openssl rand -hex 32
// (ou utilise un mot de passe très long, > 40 caractères aléatoires)
const SHARED_SECRET = '44e88bb1e37c6f2af734631facb5ea95440ab9468dacf22a176117471a677de0';

// Signature HMAC utilisée par tes formulaires vision24.fr / vision24.fun
// (peut être identique à SHARED_SECRET si tu veux, mais idéalement différent)
const INTAKE_SECRET = 'd98f7b04e2cde7c9c25ba7c22cb68e72434e2b93ea208e010b6477f8ba9981b6';

// Origines autorisées pour CORS (les 2 sites + le CRM)
const ALLOWED_ORIGINS = [
    'https://vision24.fr',
    'https://www.vision24.fr',
    'https://vision24.fun',
    'https://www.vision24.fun',
    'https://crm.vision24.fr',   // adapte au sous-domaine où tu déploies le CRM
    'http://localhost:4321',      // test local Astro/dev
    'http://localhost:8765',      // test local Python http.server (CRM Anthony)
    'http://localhost:8000',      // test local générique
    'http://localhost:3000',      // test local Node
    'http://localhost:5173',      // test local Vite
    'http://127.0.0.1:8765',     // équivalent 127.0.0.1
    'null',                       // origine null (fichier file:// ouvert directement)
];

// Où stocker les demandes (chemin absolu recommandé, hors du dossier public)
// Sur Hostinger : /home/uXXXXXXXX/domains/vision24.fr/data/ par exemple
// À défaut, ce dossier local est utilisé (mais moins sécurisé)
define('STORAGE_DIR', __DIR__ . '/data');

// TTL des demandes dans l'index queue (30 jours par défaut)
const DEMANDE_TTL_SECONDS = 60 * 60 * 24 * 30;

// Rate limiting : max requêtes /intake par IP dans la fenêtre
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SECONDS = 10;

/* ============================================================
 * SMTP OUTLOOK — pour envoyer les devis depuis ap.vision24@outlook.fr
 * ============================================================
 * ⚠️ Utilise un MOT DE PASSE D'APPLICATION Microsoft, PAS ton mot de passe habituel.
 *
 * Comment obtenir le mot de passe d'application :
 *   1. Va sur https://account.microsoft.com/security
 *   2. Active la vérification en 2 étapes si ce n'est pas fait
 *   3. Options de sécurité avancées → Mots de passe d'application
 *   4. Créer un nouveau → nom "Vision 24 CRM"
 *   5. Copie le mot de passe généré (16 caractères) et colle-le dans SMTP_PASS
 * ============================================================ */
const SMTP_HOST      = 'smtp-mail.outlook.com';
const SMTP_PORT      = 587;
const SMTP_USER      = 'ap.vision24@outlook.fr';
const SMTP_PASS      = 'REMPLACE_MOI_PAR_LE_MOT_DE_PASSE_APPLICATION';
const SMTP_FROM      = 'ap.vision24@outlook.fr';
const SMTP_FROM_NAME = 'Vision 24';

/* ---------- Helpers communs ---------- */

/** JSON response avec headers propres */
function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Envoie les headers CORS pour l'origine si autorisée */
function cors_headers(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, ALLOWED_ORIGINS, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGINS[0]);
    }
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Vision-Sig, X-Vision-Token');
    header('Access-Control-Max-Age: 86400');
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/** Vérifie signature HMAC-SHA256 du corps du POST */
function verify_hmac_signature(string $body): bool {
    $sig = $_SERVER['HTTP_X_VISION_SIG'] ?? '';
    if (!$sig) return false;
    $expected = hash_hmac('sha256', $body, INTAKE_SECRET);
    return hash_equals($expected, $sig);
}

/** Vérifie le token partagé (pour /pull et /ack) */
function verify_shared_token(): bool {
    $token = $_SERVER['HTTP_X_VISION_TOKEN'] ?? '';
    return $token !== '' && hash_equals(SHARED_SECRET, $token);
}

/** Crée le dossier de stockage si nécessaire */
function ensure_storage(): void {
    if (!is_dir(STORAGE_DIR)) {
        mkdir(STORAGE_DIR, 0700, true);
    }
    // Sécurise : bloque l'accès direct via web
    $htaccess = STORAGE_DIR . '/.htaccess';
    if (!file_exists($htaccess)) {
        file_put_contents($htaccess, "Order deny,allow\nDeny from all\n");
    }
}

/** Chemin de fichier queue.json (index des IDs) */
function queue_path(): string { return STORAGE_DIR . '/queue.json'; }

/** Chemin d'une demande individuelle */
function demande_path(string $id): string {
    // Isole par sous-dossier pour éviter des milliers de fichiers plats
    $subdir = STORAGE_DIR . '/demandes';
    if (!is_dir($subdir)) mkdir($subdir, 0700, true);
    return $subdir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $id) . '.json';
}

/** Charge la queue (liste des IDs non ackés) */
function load_queue(): array {
    $p = queue_path();
    if (!file_exists($p)) return [];
    $json = @file_get_contents($p);
    return $json ? (json_decode($json, true) ?: []) : [];
}

/** Sauvegarde atomique de la queue */
function save_queue(array $queue): void {
    $tmp = queue_path() . '.tmp';
    file_put_contents($tmp, json_encode($queue, JSON_UNESCAPED_UNICODE), LOCK_EX);
    rename($tmp, queue_path());
}

/** UUID v4 pur PHP */
function uuidv4(): string {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

/** Rate limit par IP via fichier temp */
function rate_limit_check(string $ip): bool {
    $file = STORAGE_DIR . '/rl_' . md5($ip) . '.json';
    $now = time();
    $list = file_exists($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
    $list = array_values(array_filter($list, fn($t) => $now - $t < RATE_LIMIT_WINDOW_SECONDS));
    if (count($list) >= RATE_LIMIT_MAX) return false;
    $list[] = $now;
    file_put_contents($file, json_encode($list));
    return true;
}

/** Log basique d'erreur */
function log_error(string $msg): void {
    $line = date('c') . ' ' . $msg . "\n";
    file_put_contents(STORAGE_DIR . '/error.log', $line, FILE_APPEND | LOCK_EX);
}
