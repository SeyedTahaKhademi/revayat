<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

bootstrap(['GET']);

$stories = read_json_file('stories.json');
json_response($stories);
