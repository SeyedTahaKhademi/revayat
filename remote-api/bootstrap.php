<?php
declare(strict_types=1);

/**
 * Shared helpers for the lightweight JSON-based API hosted on cPanel.
 */

function bootstrap(array $allowedMethods = ['GET']): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    header('Vary: Origin');
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
    header('Access-Control-Allow-Credentials: false');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');
    header(
        'Access-Control-Allow-Methods: ' .
        implode(',', array_unique(array_merge($allowedMethods, ['OPTIONS'])))
    );

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if (!in_array($_SERVER['REQUEST_METHOD'], $allowedMethods, true)) {
        json_response(['error' => 'Method not allowed'], 405);
    }
}

function json_response($data, int $status = 200): void
{
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($status);
    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
    );
    exit;
}

function data_path(string $filename): string
{
    $dir = __DIR__ . '/storage';
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    return $dir . '/' . ltrim($filename, '/');
}

function read_json_file(string $filename): array
{
    $path = data_path($filename);
    if (!file_exists($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    $decoded = json_decode($raw ?: '[]', true);
    return is_array($decoded) ? $decoded : [];
}

function write_json_file(string $filename, $data): void
{
    $path = data_path($filename);
    file_put_contents(
        $path,
        json_encode(
            $data,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        ),
        LOCK_EX
    );
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        json_response(['error' => 'Invalid JSON body.'], 400);
    }
    return is_array($data) ? $data : [];
}

function ensure_upload_dir(): string
{
    $dir = __DIR__ . '/uploads';
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    return $dir;
}

function sanitize_reference(?string $value, string $prefix = 'asset'): string
{
    $clean = preg_replace('/[^a-zA-Z0-9-_]/', '', (string) $value);
    if (!$clean) {
        $clean = $prefix . '-' . uniqid();
    }
    return strtolower($clean);
}

function current_base_url(): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
    return $scheme . '://' . $host . ($scriptDir ? $scriptDir : '');
}

function public_upload_url(string $filename): string
{
    return current_base_url() . '/uploads/' . ltrim($filename, '/');
}
