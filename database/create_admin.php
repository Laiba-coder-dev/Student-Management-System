<?php
declare(strict_types=1);
require_once __DIR__.'/../config/database.php';
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
if($argc<3){fwrite(STDERR,"Usage: php database/create_admin.php \"Full Name\" email@example.com\n");exit(1);}
$name=trim($argv[1]); $email=strtolower(trim($argv[2]));
if($name===''||!filter_var($email,FILTER_VALIDATE_EMAIL)){fwrite(STDERR,"Provide a valid name and email.\n");exit(1);}
fwrite(STDOUT,'Set administrator password (minimum 10 characters): '); $password=trim((string)fgets(STDIN));
if(strlen($password)<10){fwrite(STDERR,"Password must be at least 10 characters.\n");exit(1);}
try{$q=database()->prepare("INSERT INTO users(full_name,email,password,role) VALUES(:name,:email,:password,'Admin')");$q->execute(['name'=>$name,'email'=>$email,'password'=>password_hash($password,PASSWORD_DEFAULT)]);fwrite(STDOUT,"Administrator created. Sign in at index.php.\n");}
catch(PDOException $e){if($e->getCode()==='23000')fwrite(STDERR,"That email address is already registered.\n");else fwrite(STDERR,"Could not create administrator. Check database configuration.\n");exit(1);}
