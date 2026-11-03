<?php
declare(strict_types=1);
function sms_id_card_key(): string {
    $configured=getenv('SMS_ID_CARD_KEY');
    if(!is_string($configured)||$configured===''){
        $keyFile=__DIR__.'/student_id_card.key';
        if(!is_file($keyFile))throw new RuntimeException('Run database/setup_student_id_cards.php to create the ID card encryption key.');
        $configured=trim((string)file_get_contents($keyFile));
    }
    if(!preg_match('/^[a-f0-9]{64}$/i',$configured))throw new RuntimeException('The student ID card key must be 64 hexadecimal characters.');
    $key=hex2bin($configured);
    if($key===false||strlen($key)!==32)throw new RuntimeException('The student ID card encryption key is invalid.');
    return $key;
}
function sms_encrypt_id_token(string $token): string {
    $iv=random_bytes(12);$tag='';$cipher=openssl_encrypt($token,'aes-256-gcm',sms_id_card_key(),OPENSSL_RAW_DATA,$iv,$tag,'sms-student-id-card-v1',16);
    if($cipher===false)throw new RuntimeException('Could not protect the ID verification token.');
    return base64_encode($iv.$tag.$cipher);
}
function sms_decrypt_id_token(string $encrypted): string {
    $raw=base64_decode($encrypted,true);
    if($raw===false||strlen($raw)<29)throw new RuntimeException('The stored ID verification token is invalid.');
    $token=openssl_decrypt(substr($raw,28),'aes-256-gcm',sms_id_card_key(),OPENSSL_RAW_DATA,substr($raw,0,12),substr($raw,12,16),'sms-student-id-card-v1');
    if($token===false)throw new RuntimeException('The ID card encryption key does not match this database.');
    return $token;
}
