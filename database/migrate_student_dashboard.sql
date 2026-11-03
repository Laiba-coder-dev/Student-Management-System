-- Run once on an existing installation before running seed_demo.php.
ALTER TABLE users MODIFY role ENUM('Admin','Student','User') NOT NULL DEFAULT 'User';
ALTER TABLE users ADD COLUMN student_id BIGINT UNSIGNED DEFAULT NULL AFTER updated_at;
ALTER TABLE users ADD UNIQUE KEY uq_users_student_id (student_id);
ALTER TABLE users ADD CONSTRAINT fk_users_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
