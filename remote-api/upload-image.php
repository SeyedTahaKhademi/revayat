<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

bootstrap(['POST']);

$payload = read_json_body();
$dataUri = isset($payload['data']) && is_string($payload['data']) ? $payload['data'] : '';
if ($dataUri === '') {
    json_response(['error' => 'Image data is required.'], 400);
}

if (!preg_match('#^data:image/(png|jpe?g|gif);base64,#i', $dataUri, $matches)) {
    json_response(['error' => 'Only GIF/JPEG/PNG base64 data URLs are supported.'], 400);
}

$extension = strtolower($matches[1] === 'jpeg' ? 'jpg' : $matches[1]);
$base64Payload = substr($dataUri, strlen($matches[0]));
$binary = base64_decode($base64Payload, true);
if ($binary === false) {
    json_response(['error' => 'Invalid base64 payload.'], 400);
}

$uploadsDir = ensure_upload_dir();
$reference = sanitize_reference($payload['reference'] ?? null, 'photo');
$filename = $reference . '-' . substr(sha1($binary), 0, 8) . '.' . $extension;
$path = $uploadsDir . '/' . $filename;

file_put_contents($path, $binary, LOCK_EX);
chmod($path, 0664);

$url = public_upload_url($filename);
json_response(['url' => $url]);
