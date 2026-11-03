USE student_management_system;

CREATE TABLE IF NOT EXISTS student_id_cards (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
 student_id BIGINT UNSIGNED NOT NULL,
 card_number VARCHAR(24) NOT NULL,
 verification_token_hash CHAR(64) NOT NULL,
 verification_token_encrypted TEXT NOT NULL,
 issue_date DATE NOT NULL,
 expiry_date DATE NOT NULL,
 status ENUM('Valid','Revoked') NOT NULL DEFAULT 'Valid',
 photo_path VARCHAR(255) DEFAULT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (id),
 UNIQUE KEY uq_student_id_cards_student (student_id),
 UNIQUE KEY uq_student_id_cards_number (card_number),
 UNIQUE KEY uq_student_id_cards_token_hash (verification_token_hash),
 KEY idx_student_id_cards_status (status),
 CONSTRAINT fk_student_id_cards_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;
