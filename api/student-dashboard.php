<?php
require_once __DIR__.'/../includes/bootstrap.php';
$user=require_student();
try {
    $q=database()->prepare("SELECT s.registration_number,s.full_name,s.email,s.phone,s.gender,s.date_of_birth,s.department,s.program,s.semester,s.address,s.status,s.gpa,s.attendance,s.guardian,s.created_at FROM students s INNER JOIN users u ON u.student_id=s.id WHERE u.id=:user_id AND u.status='Active' LIMIT 1");
    $q->execute(['user_id'=>$user['id']]);
    $student=$q->fetch();
    if(!$student) json_response(['ok'=>false,'error'=>'Your student record is not linked to this account. Contact the administrator.'],404);
    $courses=database()->prepare('SELECT course_code,title,credits,instructor,description FROM courses WHERE department=:department AND semester=:semester AND (program IS NULL OR program=:program) ORDER BY course_code');
    $courses->execute(['department'=>$student['department'],'semester'=>$student['semester'],'program'=>$student['program']]);
    json_response(['ok'=>true,'student'=>$student,'courses'=>$courses->fetchAll()]);
} catch(PDOException $e) {
    error_log('EduCore student dashboard API: '.$e->getMessage());
    json_response(['ok'=>false,'error'=>'Your student information could not be loaded.'],503);
}
