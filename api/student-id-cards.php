<?php
require_once __DIR__.'/../includes/bootstrap.php';
require_once __DIR__.'/../config/id_card_security.php';
$method=$_SERVER['REQUEST_METHOD']??'GET';

function sms_card_query(PDO $db,string $regNo): ?array {
    $q=$db->prepare('SELECT c.id,c.card_number,c.verification_token_encrypted,c.issue_date,c.expiry_date,c.status,c.photo_path,s.registration_number,s.full_name,s.email,s.phone,s.department,s.program,s.semester,s.created_at AS enrolled_at FROM student_id_cards c INNER JOIN students s ON s.id=c.student_id WHERE s.registration_number=:reg LIMIT 1');
    $q->execute(['reg'=>$regNo]);$row=$q->fetch();
    if(!$row)return null;
    $row['qr_token']=sms_decrypt_id_token($row['verification_token_encrypted']);
    unset($row['verification_token_encrypted']);
    $row['card_status']=$row['status']==='Revoked'?'Revoked':($row['expiry_date']<date('Y-m-d')?'Expired':'Valid');
    return $row;
}
function sms_store_card_photo(?string $data): ?string {
    if($data===null||$data==='')return null;
    if(!preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$#',$data,$m))json_response(['ok'=>false,'error'=>'Choose a JPEG, PNG, or WebP profile photo.'],422);
    $bytes=base64_decode($m[2],true);if($bytes===false||strlen($bytes)>3*1024*1024)json_response(['ok'=>false,'error'=>'The profile photo must be 3 MB or smaller.'],422);
    $image=@getimagesizefromstring($bytes);$mime=$image['mime']??'';$extensions=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];
    if(!isset($extensions[$mime]))json_response(['ok'=>false,'error'=>'The selected file is not a supported image.'],422);
    $relative='assets/student-id-photos/id-'.bin2hex(random_bytes(16)).'.'.$extensions[$mime];$absolute=dirname(__DIR__).'/'.$relative;$directory=dirname($absolute);
    if(!is_dir($directory)&&!mkdir($directory,0755,true)&&!is_dir($directory))json_response(['ok'=>false,'error'=>'Photo storage could not be prepared.'],503);
    if(file_put_contents($absolute,$bytes,LOCK_EX)===false)json_response(['ok'=>false,'error'=>'The profile photo could not be saved.'],503);
    return $relative;
}
function sms_card_data(PDO $db,array $row): array {
    unset($row['id']);
    $row['session_year']=substr((string)$row['enrolled_at'],0,4);
    unset($row['enrolled_at']);
    return $row;
}

try {
    $db=database();$action=clean_text($_GET['action']??'',30);
    if($method==='GET'&&$action==='mine'){
        $user=require_student();
        $q=$db->prepare('SELECT s.registration_number FROM users u INNER JOIN students s ON s.id=u.student_id WHERE u.id=:user AND u.role=\'Student\' LIMIT 1');$q->execute(['user'=>$user['id']]);$regNo=$q->fetchColumn();
        if(!$regNo)json_response(['ok'=>false,'error'=>'Your student record is not linked to this account.'],404);
        $row=sms_card_query($db,(string)$regNo);if(!$row)json_response(['ok'=>false,'error'=>'Your ID card has not been generated yet. Ask the administrator to create it.'],404);
        json_response(['ok'=>true,'card'=>sms_card_data($db,$row)]);
    }
    if($method==='GET'&&$action==='list'){
        require_admin();
        $q=$db->query("SELECT s.registration_number,s.full_name,s.department,s.semester,c.card_number,c.issue_date,c.expiry_date,c.status AS stored_status,c.photo_path,CASE WHEN c.id IS NULL THEN 'Not generated' WHEN c.status='Revoked' THEN 'Revoked' WHEN c.expiry_date<CURRENT_DATE THEN 'Expired' ELSE 'Valid' END AS card_status FROM students s LEFT JOIN student_id_cards c ON c.student_id=s.id ORDER BY s.full_name,s.id");
        json_response(['ok'=>true,'students'=>$q->fetchAll()]);
    }
    if($method==='GET'&&$action==='card'){
        require_admin();$regNo=strtoupper(clean_text($_GET['registration_number']??'',50));if($regNo==='')json_response(['ok'=>false,'error'=>'A student registration number is required.'],422);
        $row=sms_card_query($db,$regNo);if(!$row)json_response(['ok'=>false,'error'=>'No ID card exists for that student.'],404);
        json_response(['ok'=>true,'card'=>sms_card_data($db,$row)]);
    }
    if($method==='POST'){
        require_admin();require_csrf();$data=request_data();$action=clean_text($data['action']??'',30);$regNo=strtoupper(clean_text($data['registration_number']??'',50));
        if(!in_array($action,['generate','regenerate','revoke'],true)||$regNo==='')json_response(['ok'=>false,'error'=>'Choose a valid card action and student.'],422);
        $find=$db->prepare('SELECT id FROM students WHERE registration_number=:reg LIMIT 1');$find->execute(['reg'=>$regNo]);$studentId=$find->fetchColumn();if(!$studentId)json_response(['ok'=>false,'error'=>'Student not found.'],404);
        $existingQ=$db->prepare('SELECT id,card_number,photo_path FROM student_id_cards WHERE student_id=:student');$existingQ->execute(['student'=>$studentId]);$existing=$existingQ->fetch();
        if($action==='revoke'){
            if(!$existing)json_response(['ok'=>false,'error'=>'No ID card exists for that student.'],404);
            $q=$db->prepare("UPDATE student_id_cards SET status='Revoked' WHERE student_id=:student");$q->execute(['student'=>$studentId]);json_response(['ok'=>true,'message'=>'Student ID card revoked.']);
        }
        if($action==='generate'&&$existing)json_response(['ok'=>false,'error'=>'An ID card already exists. Use Regenerate to replace its QR verification token.'],409);
        if($action==='regenerate'&&!$existing)json_response(['ok'=>false,'error'=>'Generate the student ID card before regenerating it.'],404);
        $expiryInput=clean_text($data['expiry_date']??'',10);$issued=new DateTimeImmutable('today');$expiry=$expiryInput!==''?DateTimeImmutable::createFromFormat('!Y-m-d',$expiryInput):$issued->modify('+4 years');
        if(!$expiry||$expiry->format('Y-m-d')<=$issued->format('Y-m-d'))json_response(['ok'=>false,'error'=>'Choose a card expiry date in the future.'],422);
        $photoPath=sms_store_card_photo(is_string($data['photo_data']??null)?$data['photo_data']:null)??($existing['photo_path']??null);
        $token=bin2hex(random_bytes(32));$tokenHash=hash('sha256',$token);$encrypted=sms_encrypt_id_token($token);$issueDate=$issued->format('Y-m-d');$expiryDate=$expiry->format('Y-m-d');
        if($existing){$q=$db->prepare("UPDATE student_id_cards SET verification_token_hash=:hash,verification_token_encrypted=:encrypted,issue_date=:issue,expiry_date=:expiry,status='Valid',photo_path=:photo WHERE student_id=:student");$q->execute(['hash'=>$tokenHash,'encrypted'=>$encrypted,'issue'=>$issueDate,'expiry'=>$expiryDate,'photo'=>$photoPath,'student'=>$studentId]);$message='Student ID card regenerated.';}
        else{$cardNumber='NU-SID-'.strtoupper(bin2hex(random_bytes(5)));$q=$db->prepare("INSERT INTO student_id_cards(student_id,card_number,verification_token_hash,verification_token_encrypted,issue_date,expiry_date,status,photo_path) VALUES(:student,:number,:hash,:encrypted,:issue,:expiry,'Valid',:photo)");$q->execute(['student'=>$studentId,'number'=>$cardNumber,'hash'=>$tokenHash,'encrypted'=>$encrypted,'issue'=>$issueDate,'expiry'=>$expiryDate,'photo'=>$photoPath]);$message='Student ID card generated.';}
        json_response(['ok'=>true,'message'=>$message,'registration_number'=>$regNo]);
    }
    json_response(['ok'=>false,'error'=>'Unknown student ID card action.'],404);
} catch(PDOException $e) {
    error_log('EduCore student ID card API: '.$e->getMessage());json_response(['ok'=>false,'error'=>'Student ID card data could not be loaded or saved.'],503);
} catch(Throwable $e) {
    error_log('EduCore student ID card security error: '.$e->getMessage());json_response(['ok'=>false,'error'=>$e instanceof RuntimeException?$e->getMessage():'Student ID card service is unavailable.'],503);
}
