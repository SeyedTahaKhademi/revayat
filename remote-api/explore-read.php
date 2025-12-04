<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

bootstrap(['GET']);

$posts = read_json_file('explore-posts.json');
json_response($posts);
