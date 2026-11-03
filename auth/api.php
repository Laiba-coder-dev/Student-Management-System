<?php
require_once __DIR__.'/../includes/bootstrap.php';
$action=$_GET['action']??'';
try{
 if($action==='register'){
  api_method(['POST']);require_csrf();json_response(['ok'=>false,'error'=>'Student accounts are created by an administrator when a student is enrolled.'],403);
 }
 if($action==='login'){
  api_method(['POST']);require_csrf();$d=request_data();$email=strtolower(clean_text($d['email']??'',254));$pass=is_string($d['password']??null)?$d['password']:'';$q=database()->prepare('SELECT id,full_name,email,password,role,status FROM users WHERE email=:email LIMIT 1');$q->execute(['email'=>$email]);$u=$q->fetch();
  if(!$u||$u['status']!=='Active'||$u['role']==='User'||!password_verify($pass,$u['password']))json_response(['ok'=>false,'error'=>'Email or password is incorrect.'],401);
  session_regenerate_id(true);unset($u['password'],$u['status']);$_SESSION['user']=$u;$_SESSION['csrf_token']=bin2hex(random_bytes(32));json_response(['ok'=>true,'user'=>$u,'redirect'=>$u['role']==='Admin'?'pages/dashboard.php':'pages/student-dashboard.php']);
 }
 if($action==='logout'){
  api_method(['POST']);require_login();require_csrf();$_SESSION=[];if(ini_get('session.use_cookies')){$p=session_get_cookie_params();setcookie(session_name(),'',['expires'=>time()-42000,'path'=>$p['path'],'domain'=>$p['domain'],'secure'=>$p['secure'],'httponly'=>$p['httponly'],'samesite'=>'Lax']);}session_destroy();json_response(['ok'=>true,'redirect'=>'index.php']);
 }
 if($action==='me'){api_method(['GET']);json_response(['ok'=>true,'user'=>require_login()]);}
 json_response(['ok'=>false,'error'=>'Unknown authentication action.'],404);
}catch(PDOException $e){error_log('EduCore authentication API: '.$e->getMessage());json_response(['ok'=>false,'error'=>'The service is temporarily unavailable.'],503);}
