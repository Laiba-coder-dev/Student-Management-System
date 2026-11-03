<?php
declare(strict_types=1);
if (session_status() !== PHP_SESSION_ACTIVE) {
    ini_set('session.use_strict_mode','1');
    ini_set('session.use_only_cookies','1');
    $https=isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off';
    session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>$https,'httponly'=>true,'samesite'=>'Lax']); session_start();
}
header('X-Content-Type-Options: nosniff'); header('X-Frame-Options: DENY'); header('Referrer-Policy: strict-origin-when-cross-origin');
header('Cache-Control: no-store, private'); header('Pragma: no-cache');
require_once __DIR__.'/../config/database.php';
function json_response(array $data,int $status=200): void { http_response_code($status); header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store'); echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE); exit; }
function request_data(): array { static $data=null; if($data!==null)return $data; $body=file_get_contents('php://input'); $json=json_decode($body?:'',true); $data=is_array($json)?$json:$_POST; return $data; }
function csrf_token(): string { if(empty($_SESSION['csrf_token'])) $_SESSION['csrf_token']=bin2hex(random_bytes(32)); return $_SESSION['csrf_token']; }
function require_csrf(): void { $data=request_data(); $token=$_SERVER['HTTP_X_CSRF_TOKEN']??$data['_csrf']??''; if(!is_string($token)||!hash_equals(csrf_token(),$token)) json_response(['ok'=>false,'error'=>'Your session token expired. Refresh the page and try again.'],419); }
function current_user(): ?array { return $_SESSION['user']??null; }
function require_login(): array {
    $sessionUser=current_user();
    if(!$sessionUser) json_response(['ok'=>false,'error'=>'Please sign in to continue.'],401);
    try {
        $q=database()->prepare("SELECT id,full_name,email,role FROM users WHERE id=:id AND status='Active' LIMIT 1");
        $q->execute(['id'=>$sessionUser['id']]); $fresh=$q->fetch();
    } catch(PDOException $e) { error_log('SMS session check error: '.$e->getMessage()); json_response(['ok'=>false,'error'=>'The service is temporarily unavailable. Please try again.'],503); }
    if(!$fresh) { $_SESSION=[]; session_regenerate_id(true); json_response(['ok'=>false,'error'=>'Your account is inactive. Please contact an administrator.'],401); }
    $_SESSION['user']=$fresh;
    return $fresh;
}
function require_admin(): array { $user=require_login(); if($user['role']!=='Admin') json_response(['ok'=>false,'error'=>'You do not have permission to perform this action.'],403); return $user; }
function require_student(): array { $user=require_login(); if($user['role']!=='Student') json_response(['ok'=>false,'error'=>'A student account is required.'],403); return $user; }
function api_method(array $allowed): string { $method=$_SERVER['REQUEST_METHOD']??'GET'; if(!in_array($method,$allowed,true)) json_response(['ok'=>false,'error'=>'Method not allowed.'],405); return $method; }
function clean_text(mixed $value,int $max=255): string { if(!is_string($value))return ''; $value=trim($value); return function_exists('mb_substr')?mb_substr($value,0,$max):substr($value,0,$max); }
function page_guard(bool $adminOnly=false): void {
    if(!current_user()){header('Location: ../index.php');exit;}
    try {
        $q=database()->prepare("SELECT id,full_name,email,role FROM users WHERE id=:id AND status='Active' LIMIT 1");
        $q->execute(['id'=>current_user()['id']]); $user=$q->fetch();
    } catch(PDOException $e) { error_log('SMS page session check error: '.$e->getMessage()); http_response_code(503); exit('The service is temporarily unavailable. Please try again.'); }
    if(!$user){$_SESSION=[];session_regenerate_id(true);header('Location: ../index.php');exit;}
    $_SESSION['user']=$user;
    if($adminOnly&&$user['role']!=='Admin'){header('Location: student-dashboard.php');exit;}
    if(!$adminOnly&&$user['role']==='Admin'&&basename($_SERVER['SCRIPT_NAME']??'')==='student-dashboard.php'){header('Location: dashboard.php');exit;}
}
