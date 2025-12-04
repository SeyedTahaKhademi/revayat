<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

bootstrap(['POST']);

$payload = read_json_body();
if (!is_array($payload)) {
    json_response(['error' => 'Payload must be an array.'], 400);
}

write_json_file('explore-posts.json', $payload);
json_response(['success' => true]);
