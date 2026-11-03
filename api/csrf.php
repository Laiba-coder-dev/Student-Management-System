<?php
require_once __DIR__.'/../includes/bootstrap.php';
$user=current_user()?require_login():null;
json_response(['ok'=>true,'csrf'=>csrf_token(),'user'=>$user]);
