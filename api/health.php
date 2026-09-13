<?php
require_once __DIR__ . '/config.php';
cors_headers();
json_response(['ok' => true, 'ts' => time(), 'version' => '1.0.0']);
