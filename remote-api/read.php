<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

bootstrap(['GET']);

$accounts = read_json_file('accounts.json');
json_response($accounts);
