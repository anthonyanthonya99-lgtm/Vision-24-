<?php
/* ============================================================
 * Vision 24 CRM · /send-email
 * ============================================================
 * Envoi d'email via SMTP Outlook (ap.vision24@outlook.fr).
 * URL : https://vision24.fr/api/send-email.php
 * Auth : header X-Vision-Token = SHARED_SECRET
 *
 * INPUT (JSON)
 *   { to, subject, body, replyTo?, attachments?: [{name, dataUrl}] }
 *
 * OUTPUT
 *   { ok: true, messageId }  ou  { error: '...' }
 * ============================================================ */

require_once __DIR__ . '/config.php';
cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'method_not_allowed'], 405);
}
if (!verify_shared_token()) {
    json_response(['error' => 'unauthorized'], 401);
}

// Config SMTP (défini dans config.php)
if (!defined('SMTP_HOST') || !defined('SMTP_USER') || !defined('SMTP_PASS')) {
    json_response(['error' => 'smtp_not_configured', 'message' => 'Ajoute SMTP_HOST/USER/PASS dans config.php'], 500);
}

$body = json_decode(file_get_contents('php://input'), true);
$to      = trim($body['to'] ?? '');
$subject = trim($body['subject'] ?? '');
$msg     = $body['body'] ?? '';
$replyTo = trim($body['replyTo'] ?? '');
$attachments = $body['attachments'] ?? [];

if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !$subject || !$msg) {
    json_response(['error' => 'missing_fields'], 400);
}

try {
    $messageId = smtp_send([
        'host'    => SMTP_HOST,
        'port'    => defined('SMTP_PORT') ? SMTP_PORT : 587,
        'user'    => SMTP_USER,
        'pass'    => SMTP_PASS,
        'from'    => defined('SMTP_FROM') ? SMTP_FROM : SMTP_USER,
        'fromName' => defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : 'Vision 24',
        'to'      => $to,
        'subject' => $subject,
        'body'    => $msg,
        'replyTo' => $replyTo,
        'attachments' => $attachments,
    ]);
    json_response(['ok' => true, 'messageId' => $messageId]);
} catch (Exception $e) {
    log_error("SMTP send fail: " . $e->getMessage());
    json_response(['error' => 'smtp_error', 'message' => $e->getMessage()], 500);
}


/* ============================================================
 * Client SMTP minimal (fsockopen)
 * ============================================================ */
function smtp_send(array $opts): string {
    $host = $opts['host'];
    $port = $opts['port'];
    $sock = @stream_socket_client("tcp://$host:$port", $errno, $errstr, 10);
    if (!$sock) throw new Exception("SMTP connect fail: $errstr ($errno)");
    stream_set_timeout($sock, 15);

    smtp_read($sock, 220);
    smtp_cmd($sock, "EHLO vision24.fr", 250);

    // STARTTLS
    smtp_cmd($sock, "STARTTLS", 220);
    if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        throw new Exception("SMTP STARTTLS fail");
    }
    smtp_cmd($sock, "EHLO vision24.fr", 250);

    // AUTH LOGIN
    smtp_cmd($sock, "AUTH LOGIN", 334);
    smtp_cmd($sock, base64_encode($opts['user']), 334);
    smtp_cmd($sock, base64_encode($opts['pass']), 235);

    // Enveloppe
    smtp_cmd($sock, "MAIL FROM:<{$opts['from']}>", 250);
    smtp_cmd($sock, "RCPT TO:<{$opts['to']}>", 250);
    smtp_cmd($sock, "DATA", 354);

    // Construction du message MIME
    $mime = build_mime($opts);
    // Envoi ligne par ligne (SMTP protège les lignes commençant par .)
    foreach (explode("\r\n", $mime) as $line) {
        if (strlen($line) && $line[0] === '.') $line = '.' . $line;
        fwrite($sock, $line . "\r\n");
    }
    fwrite($sock, ".\r\n");
    smtp_read($sock, 250);
    smtp_cmd($sock, "QUIT", 221);
    fclose($sock);

    return $opts['from'] . '/' . time();
}

function smtp_read($sock, int $expect): string {
    $data = '';
    while (($line = fgets($sock, 512)) !== false) {
        $data .= $line;
        if (isset($line[3]) && $line[3] === ' ') break;
    }
    $code = (int) substr($data, 0, 3);
    if ($code !== $expect) throw new Exception("SMTP expected $expect, got: " . trim($data));
    return $data;
}

function smtp_cmd($sock, string $cmd, int $expect): string {
    fwrite($sock, $cmd . "\r\n");
    return smtp_read($sock, $expect);
}

function build_mime(array $opts): string {
    $boundary = '----v24_' . bin2hex(random_bytes(8));
    $has_attachments = !empty($opts['attachments']);
    $headers = [];
    $headers[] = "From: " . encode_name($opts['fromName']) . " <{$opts['from']}>";
    $headers[] = "To: <{$opts['to']}>";
    if (!empty($opts['replyTo'])) $headers[] = "Reply-To: <{$opts['replyTo']}>";
    $headers[] = "Subject: " . encode_header($opts['subject']);
    $headers[] = "Date: " . date('r');
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Message-ID: <" . bin2hex(random_bytes(12)) . "@vision24.fr>";

    if ($has_attachments) {
        $headers[] = "Content-Type: multipart/mixed; boundary=\"$boundary\"";
    } else {
        $headers[] = "Content-Type: text/plain; charset=utf-8";
        $headers[] = "Content-Transfer-Encoding: 8bit";
    }

    $body = $opts['body'];

    if ($has_attachments) {
        $lines = [];
        $lines[] = "--$boundary";
        $lines[] = "Content-Type: text/plain; charset=utf-8";
        $lines[] = "Content-Transfer-Encoding: 8bit";
        $lines[] = "";
        $lines[] = $body;
        foreach ($opts['attachments'] as $att) {
            $name = $att['name'] ?? 'fichier.pdf';
            // dataUrl attendu : "data:application/pdf;base64,XXXXX"
            $dataUrl = $att['dataUrl'] ?? '';
            if (strpos($dataUrl, 'base64,') !== false) {
                [$type, $data] = explode('base64,', $dataUrl, 2);
                $type = trim($type, 'data:; ');
                $lines[] = "--$boundary";
                $lines[] = "Content-Type: $type; name=\"$name\"";
                $lines[] = "Content-Transfer-Encoding: base64";
                $lines[] = "Content-Disposition: attachment; filename=\"$name\"";
                $lines[] = "";
                $lines[] = chunk_split($data, 76, "\r\n");
            }
        }
        $lines[] = "--$boundary--";
        $body = implode("\r\n", $lines);
    }

    return implode("\r\n", $headers) . "\r\n\r\n" . $body;
}

function encode_header(string $s): string {
    return preg_match('/[^\x20-\x7e]/', $s) ? '=?UTF-8?B?' . base64_encode($s) . '?=' : $s;
}
function encode_name(string $s): string { return encode_header($s); }
