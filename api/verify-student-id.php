<?php
require_once __DIR__.'/../includes/bootstrap.php';
$token=clean_text($_GET['token']??'',64);
if(!preg_match('/^[a-f0-9]{64}$/i',$token))json_response(['ok'=>true,'verification'=>['status'=>'Invalid'],'student'=>null]);
try {
    $q=database()->prepare('SELECT s.full_name,s.registration_number,s.department,c.photo_path,c.issue_date,c.expiry_date,c.status FROM student_id_cards c INNER JOIN students s ON s.id=c.student_id WHERE c.verification_token_hash=:hash LIMIT 1');
    $q->execute(['hash'=>hash('sha256',strtolower($token))]);$row=$q->fetch();
    if(!$row)json_response(['ok'=>true,'verification'=>['status'=>'Invalid'],'student'=>null]);
    $status=$row['status']==='Revoked'?'Revoked':($row['expiry_date']<date('Y-m-d')?'Expired':'Valid');
    json_response(['ok'=>true,'verification'=>['status'=>$status,'issue_date'=>$row['issue_date'],'expiry_date'=>$row['expiry_date']],'student'=>['full_name'=>$row['full_name'],'registration_number'=>$row['registration_number'],'department'=>$row['department'],'photo_path'=>$row['photo_path']]]);
} catch(PDOException $e) {
    error_log('EduCore ID verification error: '.$e->getMessage());json_response(['ok'=>false,'error'=>'Verification is temporarily unavailable.'],503);
}
