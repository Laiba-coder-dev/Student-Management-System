<?php
declare(strict_types=1);
require_once __DIR__.'/../config/database.php';
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
$db=database();
$adminPassword='adminpass123';
$studentPassword='DemoPass123!';
$students=[
 ['STU-2026-1001','Aisha Rahman','aisha.rahman@northfield.edu','+1 202 555 0101','Female','2004-02-14','Computer Science','B.Sc Computer Science','Semester 5','120 Cedar Lane, Northfield','3.72',94,'Nadia Rahman · +1 202 555 0181'],
 ['STU-2026-1002','Daniel Kim','daniel.kim@northfield.edu','+1 202 555 0102','Male','2003-11-08','Business Administration','BBA','Semester 7','48 Harbor Street, Northfield','3.41',91,'Grace Kim · +1 202 555 0182'],
 ['STU-2026-1003','Maya Patel','maya.patel@northfield.edu','+1 202 555 0103','Female','2005-06-21','Electrical Engineering','B.Eng Electrical Engineering','Semester 3','16 Willow Court, Northfield','3.88',97,'Ravi Patel · +1 202 555 0183'],
 ['STU-2026-1004','Ethan Brooks','ethan.brooks@northfield.edu','+1 202 555 0104','Male','2004-09-30','Mechanical Engineering','B.Eng Mechanical Engineering','Semester 5','304 Lake Avenue, Northfield','3.26',89,'Olivia Brooks · +1 202 555 0184'],
 ['STU-2026-1005','Noor Hassan','noor.hassan@northfield.edu','+1 202 555 0105','Female','2003-04-17','Psychology','B.A Psychology','Semester 7','72 Pine Road, Northfield','3.67',95,'Samir Hassan · +1 202 555 0185'],
 ['STU-2026-1006','Lucas Martin','lucas.martin@northfield.edu','+1 202 555 0106','Male','2005-01-12','Mathematics','B.Sc Mathematics','Semester 3','9 Meadow Drive, Northfield','3.54',92,'Elena Martin · +1 202 555 0186'],
 ['STU-2026-1007','Sofia Alvarez','sofia.alvarez@northfield.edu','+1 202 555 0107','Female','2004-07-03','Economics','B.A Economics','Semester 5','215 Parkside Avenue, Northfield','3.79',96,'Marco Alvarez · +1 202 555 0187'],
 ['STU-2026-1008','Omar Farooq','omar.farooq@northfield.edu','+1 202 555 0108','Male','2003-12-26','Civil Engineering','B.Eng Civil Engineering','Semester 7','31 Birch Street, Northfield','3.18',87,'Hina Farooq · +1 202 555 0188'],
 ['STU-2026-1009','Chloe Bennett','chloe.bennett@northfield.edu','+1 202 555 0109','Female','2005-03-09','Nursing','B.Sc Nursing','Semester 3','88 Summit Lane, Northfield','3.93',99,'James Bennett · +1 202 555 0189'],
 ['STU-2026-1010','Zain Malik','zain.malik@northfield.edu','+1 202 555 0110','Male','2004-05-28','Media Studies','B.A Media Studies','Semester 5','142 Orchard Way, Northfield','3.36',90,'Sara Malik · +1 202 555 0190'],
 ['STU-2026-1011','Priya Nair','priya.nair@northfield.edu','+1 202 555 0111','Female','2003-08-15','Computer Science','B.Sc Computer Science','Semester 7','56 University Boulevard, Northfield','3.84',98,'Anil Nair · +1 202 555 0191'],
 ['STU-2026-1012','Noah Williams','noah.williams@northfield.edu','+1 202 555 0112','Male','2005-10-04','Business Administration','BBA','Semester 3','403 Elm Street, Northfield','3.09',85,'Monica Williams · +1 202 555 0192'],
];
try {
 $db->beginTransaction();
 $findUser=$db->prepare('SELECT id FROM users WHERE email=:email');
 $addAdmin=$db->prepare("INSERT INTO users(full_name,email,password,role) VALUES('Northfield Demo Admin','admin@northfield.edu',:password,'Admin')");
 $findUser->execute(['email'=>'admin@northfield.edu']);
 if(!$findUser->fetchColumn()) $addAdmin->execute(['password'=>password_hash($adminPassword,PASSWORD_DEFAULT)]);
 $findStudent=$db->prepare('SELECT id FROM students WHERE registration_number=:reg OR email=:email LIMIT 1');
 $addStudent=$db->prepare("INSERT INTO students(registration_number,full_name,email,phone,gender,date_of_birth,department,program,semester,address,status,gpa,attendance,guardian) VALUES(:reg,:name,:email,:phone,:gender,:dob,:department,:program,:semester,:address,'Active',:gpa,:attendance,:guardian)");
 $addAccount=$db->prepare("INSERT INTO users(full_name,email,password,role,student_id) VALUES(:name,:email,:password,'Student',:student_id)");
 foreach($students as $s){[$reg,$name,$email,$phone,$gender,$dob,$department,$program,$semester,$address,$gpa,$attendance,$guardian]=$s;$findStudent->execute(['reg'=>$reg,'email'=>$email]);$id=$findStudent->fetchColumn();if(!$id){$addStudent->execute(['reg'=>$reg,'name'=>$name,'email'=>$email,'phone'=>$phone,'gender'=>$gender,'dob'=>$dob,'department'=>$department,'program'=>$program,'semester'=>$semester,'address'=>$address,'gpa'=>$gpa,'attendance'=>$attendance,'guardian'=>$guardian]);$id=(int)$db->lastInsertId();}$findUser->execute(['email'=>$email]);if(!$findUser->fetchColumn())$addAccount->execute(['name'=>$name,'email'=>$email,'password'=>password_hash($studentPassword,PASSWORD_DEFAULT),'student_id'=>$id]);}
 $catalog=[
  'Computer Science'=>['CS',['Programming Fundamentals','Discrete Mathematics','Data Structures','Database Systems','Operating Systems','Software Engineering','Artificial Intelligence','Cloud Computing']],
  'Business Administration'=>['BUS',['Financial Accounting','Principles of Management','Business Statistics','Marketing Fundamentals','Corporate Finance','Operations Management','Strategic Management','Entrepreneurship']],
  'Electrical Engineering'=>['ELE',['Circuit Analysis I','Engineering Mathematics','Electronics I','Signals and Systems','Power Systems','Control Systems','Embedded Systems','Renewable Energy Systems']],
  'Mechanical Engineering'=>['MEC',['Engineering Mechanics','Materials Science','Thermodynamics I','Fluid Mechanics','Machine Design','Heat Transfer','Manufacturing Systems','Mechatronics']],
  'Psychology'=>['PSY',['Foundations of Psychology','Developmental Psychology','Research Methods','Cognitive Psychology','Social Psychology','Psychological Assessment','Clinical Psychology','Senior Research Seminar']],
  'Mathematics'=>['MAT',['Calculus I','Linear Algebra','Multivariable Calculus','Differential Equations','Abstract Algebra','Probability and Statistics','Real Analysis','Mathematical Modeling']],
  'Economics'=>['ECO',['Microeconomics','Macroeconomics','Economic Statistics','Intermediate Microeconomics','Public Finance','Econometrics','International Trade','Development Economics']],
  'Civil Engineering'=>['CIV',['Statics','Engineering Surveying','Structural Analysis I','Geotechnical Engineering','Reinforced Concrete Design','Transportation Engineering','Water Resources','Construction Management']],
  'Nursing'=>['NUR',['Anatomy and Physiology','Fundamentals of Nursing','Pathophysiology','Pharmacology','Adult Health Nursing','Community Health Nursing','Maternal Health Nursing','Nursing Practicum']],
  'Media Studies'=>['MED',['Media Writing','Communication Theory','Digital Media Production','Media Ethics','Broadcast Journalism','Strategic Communication','Documentary Production','Media Research']],
 ];
 $addCourse=$db->prepare('INSERT IGNORE INTO courses(course_code,title,department,program,semester,credits,instructor,description) VALUES(:code,:title,:department,NULL,:semester,:credits,:instructor,:description)');
 foreach($catalog as $department=>$catalogEntry){[$prefix,$titles]=$catalogEntry;for($term=1;$term<=8;$term++){for($slot=0;$slot<3;$slot++){$title=$titles[($term-1+$slot)%count($titles)];$code=$prefix.'-'.$term.'0'.($slot+1);$addCourse->execute(['code'=>$code,'title'=>$title,'department'=>$department,'semester'=>'Semester '.$term,'credits'=>3.0,'instructor'=>'Department Faculty','description'=>'Core '.$department.' coursework covering '.$title.' through lectures, guided practice, and applied assignments.']);}}}
 $db->commit();fwrite(STDOUT,"Demo data and department course catalog are ready. New demo Admin password: {$adminPassword}; student passwords: {$studentPassword}\n");
} catch(Throwable $e){if($db->inTransaction())$db->rollBack();fwrite(STDERR,'Demo data could not be created: '.$e->getMessage()."\n");exit(1);}
