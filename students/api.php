<?php
require_once __DIR__.'/../includes/bootstrap.php';
$method=$_SERVER['REQUEST_METHOD']??'GET';
function sms_student(array $r): array {
 $r['id']='s'.$r['id']; $r['regNo']=$r['registration_number'];$r['name']=$r['full_name'];$r['dob']=$r['date_of_birth'];$r['joined']=$r['created_at'];$r['gpa']=$r['gpa']===null?null:(float)$r['gpa'];$r['attendance']=$r['attendance']===null?null:(int)$r['attendance'];$r['initials']=implode('',array_map(fn($p)=>mb_substr($p,0,1),array_slice(preg_split('/\s+/',trim($r['full_name'])),0,2)));$r['color']='#2451e0';unset($r['registration_number'],$r['full_name'],$r['date_of_birth']);return $r;
}
function sms_student_id(mixed $value): int {
 $value=is_string($value)||is_int($value)?(string)$value:'';
 if(!preg_match('/^s?([1-9][0-9]*)$/i',$value,$match))return 0;
 return (int)$match[1];
}
function student_payload(array $d): array {
 $r=['registration_number'=>strtoupper(clean_text($d['regNo']??$d['registration_number']??'',50)),'full_name'=>clean_text($d['name']??$d['full_name']??'',150),'email'=>strtolower(clean_text($d['email']??'',254)),'phone'=>clean_text($d['phone']??'',40),'gender'=>clean_text($d['gender']??'',40),'date_of_birth'=>clean_text($d['dob']??$d['date_of_birth']??'',10),'department'=>clean_text($d['department']??'',120),'program'=>clean_text($d['program']??'',150),'semester'=>clean_text($d['semester']??'',40),'address'=>clean_text($d['address']??'',2000),'status'=>clean_text($d['status']??'Active',20),'gpa'=>($d['gpa']??'')===''?null:(float)$d['gpa'],'attendance'=>($d['attendance']??'')===''?null:(int)$d['attendance'],'guardian'=>clean_text($d['guardian']??'',80)];
 foreach(['registration_number','full_name','department','program','semester'] as $f)if($r[$f]==='')json_response(['ok'=>false,'error'=>'Complete all required student fields.'],422);
 if(!filter_var($r['email'],FILTER_VALIDATE_EMAIL))json_response(['ok'=>false,'error'=>'Enter a valid student email address.'],422);
 if(!in_array($r['status'],['Active','Pending','Inactive','On Leave'],true))json_response(['ok'=>false,'error'=>'Choose a valid enrollment status.'],422);
 if($r['date_of_birth']!==''){ $date=DateTime::createFromFormat('!Y-m-d',$r['date_of_birth']);if(!$date||$date->format('Y-m-d')!==$r['date_of_birth'])json_response(['ok'=>false,'error'=>'Enter a valid date of birth.'],422); }else $r['date_of_birth']=null;
 if($r['gpa']!==null&&($r['gpa']<0||$r['gpa']>4))json_response(['ok'=>false,'error'=>'GPA must be between 0 and 4.'],422);
 if($r['attendance']!==null&&($r['attendance']<0||$r['attendance']>100))json_response(['ok'=>false,'error'=>'Attendance must be between 0 and 100.'],422);
 foreach(['phone','gender','address','guardian'] as $f)if($r[$f]==='')$r[$f]=null;
 return $r;
}
try{
 $db=database();
 if($method==='GET'){
  require_admin();$id=$_GET['id']??null;
  if($id!==null){$studentId=sms_student_id($id);if(!$studentId)json_response(['ok'=>false,'error'=>'Invalid student id.'],422);$q=$db->prepare('SELECT * FROM students WHERE id=:id');$q->execute(['id'=>$studentId]);$s=$q->fetch();if(!$s)json_response(['ok'=>false,'error'=>'Student not found.'],404);json_response(['ok'=>true,'student'=>sms_student($s)]);}
  $search=clean_text($_GET['search']??'',150);$dept=clean_text($_GET['department']??'',120);$program=clean_text($_GET['program']??'',150);$semester=clean_text($_GET['semester']??'',40);$status=clean_text($_GET['status']??'',20);$page=max(1,(int)($_GET['page']??1));$per=min(100,max(1,(int)($_GET['per_page']??10)));
  $sorts=['name'=>'full_name','regNo'=>'registration_number','department'=>'department','semester'=>'semester','joined'=>'created_at'];$sort=$sorts[$_GET['sort']??'joined']??'created_at';$dir=strtolower($_GET['direction']??'desc')==='asc'?'ASC':'DESC';$where=[];$params=[];
  if($search!==''){foreach(['full_name','registration_number','email','department'] as $i=>$col){$key='q'.$i;$where[]="$col LIKE :$key";$params[$key]='%'.$search.'%';}}
  foreach(['department'=>$dept,'program'=>$program,'semester'=>$semester,'status'=>$status] as $key=>$val)if($val!==''){$where[]="$key=:$key";$params[$key]=$val;}
  $clause=$where?' WHERE '.implode(' AND ',$where):'';$count=$db->prepare('SELECT COUNT(*) FROM students'.$clause);$count->execute($params);$total=(int)$count->fetchColumn();$offset=($page-1)*$per;
  $q=$db->prepare("SELECT * FROM students{$clause} ORDER BY {$sort} {$dir},id DESC LIMIT :lim OFFSET :off");foreach($params as $k=>$v)$q->bindValue(':'.$k,$v);$q->bindValue(':lim',$per,PDO::PARAM_INT);$q->bindValue(':off',$offset,PDO::PARAM_INT);$q->execute();$rows=array_map('sms_student',$q->fetchAll());
  json_response(['ok'=>true,'students'=>$rows,'pagination'=>['page'=>$page,'per_page'=>$per,'total'=>$total,'pages'=>(int)ceil($total/$per)]]);
 }
 if($method==='POST'){
  require_admin();require_csrf();$d=request_data();$r=student_payload($d);$password=is_string($d['password']??null)?$d['password']:'';if(strlen($password)<10||strlen($password)>200)json_response(['ok'=>false,'error'=>'Set a temporary student password of at least 10 characters.'],422);
  try{$db->beginTransaction();$q=$db->prepare('INSERT INTO students(registration_number,full_name,email,phone,gender,date_of_birth,department,program,semester,address,status,gpa,attendance,guardian) VALUES(:registration_number,:full_name,:email,:phone,:gender,:date_of_birth,:department,:program,:semester,:address,:status,:gpa,:attendance,:guardian)');$q->execute($r);$id=(int)$db->lastInsertId();$u=$db->prepare("INSERT INTO users(full_name,email,password,role,student_id) VALUES(:name,:email,:password,'Student',:student_id)");$u->execute(['name'=>$r['full_name'],'email'=>$r['email'],'password'=>password_hash($password,PASSWORD_DEFAULT),'student_id'=>$id]);$db->commit();}catch(PDOException $e){if($db->inTransaction())$db->rollBack();if($e->getCode()==='23000')json_response(['ok'=>false,'error'=>'Registration number or email is already in use.'],409);throw $e;}
  json_response(['ok'=>true,'message'=>'Student and login account created.','student_id'=>'s'.$id],201);
 }
 if($method==='PUT'){
  require_admin();require_csrf();$d=request_data();$id=sms_student_id($d['id']??'');if(!$id)json_response(['ok'=>false,'error'=>'Invalid student id.'],422);$r=student_payload($d);$r['id']=$id;$q=$db->prepare('UPDATE students SET registration_number=:registration_number,full_name=:full_name,email=:email,phone=:phone,gender=:gender,date_of_birth=:date_of_birth,department=:department,program=:program,semester=:semester,address=:address,status=:status,gpa=:gpa,attendance=:attendance,guardian=:guardian WHERE id=:id');
  try{$db->beginTransaction();$q->execute($r);$u=$db->prepare("UPDATE users SET full_name=:name,email=:email WHERE student_id=:id AND role='Student'");$u->execute(['name'=>$r['full_name'],'email'=>$r['email'],'id'=>$id]);$db->commit();}catch(PDOException $e){if($db->inTransaction())$db->rollBack();if($e->getCode()==='23000')json_response(['ok'=>false,'error'=>'Registration number or email is already assigned.'],409);throw $e;}
  $check=$db->prepare('SELECT 1 FROM students WHERE id=:id');$check->execute(['id'=>$id]);if(!$check->fetchColumn())json_response(['ok'=>false,'error'=>'Student not found.'],404);json_response(['ok'=>true,'message'=>'Student updated.']);
 }
 if($method==='DELETE'){
  require_admin();require_csrf();$d=request_data();$id=(int)preg_replace('/\D/','',(string)($d['id']??$_GET['id']??''));if(!$id)json_response(['ok'=>false,'error'=>'Invalid student id.'],422);$q=$db->prepare('DELETE FROM students WHERE id=:id');$q->execute(['id'=>$id]);if(!$q->rowCount())json_response(['ok'=>false,'error'=>'Student not found.'],404);json_response(['ok'=>true,'message'=>'Student deleted.']);
 }
 json_response(['ok'=>false,'error'=>'Method not allowed.'],405);
}catch(PDOException $e){error_log('EduCore student API: '.$e->getMessage());json_response(['ok'=>false,'error'=>'Student data could not be loaded or saved.'],503);}
