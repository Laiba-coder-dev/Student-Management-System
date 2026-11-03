<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
$keyFile=__DIR__.'/../config/student_id_card.key';
if(file_exists($keyFile)){fwrite(STDOUT,"ID card encryption key already exists; it was not changed.\n");exit(0);}
$key=bin2hex(random_bytes(32));
if(file_put_contents($keyFile,$key."\n",LOCK_EX)===false){fwrite(STDERR,"Could not write config/student_id_card.key.\n");exit(1);}
@chmod($keyFile,0600);
fwrite(STDOUT,"ID card encryption key created at config/student_id_card.key. Keep this file private and include it in backups.\n");
