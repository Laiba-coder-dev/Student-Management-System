CREATE DATABASE IF NOT EXISTS student_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_management_system;

CREATE TABLE IF NOT EXISTS users (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
 full_name VARCHAR(150) NOT NULL,
 email VARCHAR(254) NOT NULL,
 password VARCHAR(255) NOT NULL,
 role ENUM('Admin','Student','User') NOT NULL DEFAULT 'User',
 status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
 phone VARCHAR(40) DEFAULT NULL,
 department VARCHAR(120) DEFAULT NULL,
 bio VARCHAR(240) DEFAULT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 student_id BIGINT UNSIGNED DEFAULT NULL,
 PRIMARY KEY (id), UNIQUE KEY uq_users_email (email), KEY idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS students (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
 registration_number VARCHAR(50) NOT NULL,
 full_name VARCHAR(150) NOT NULL,
 email VARCHAR(254) NOT NULL,
 phone VARCHAR(40) DEFAULT NULL,
 gender VARCHAR(40) DEFAULT NULL,
 date_of_birth DATE DEFAULT NULL,
 department VARCHAR(120) NOT NULL,
 program VARCHAR(150) NOT NULL,
 semester VARCHAR(40) NOT NULL,
 address TEXT DEFAULT NULL,
 status ENUM('Active','Pending','Inactive','On Leave') NOT NULL DEFAULT 'Active',
 gpa DECIMAL(3,2) DEFAULT NULL,
 attendance TINYINT UNSIGNED DEFAULT NULL,
 guardian VARCHAR(80) DEFAULT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (id), UNIQUE KEY uq_students_registration_number (registration_number), UNIQUE KEY uq_students_email (email),
 KEY idx_students_name (full_name), KEY idx_students_department (department), KEY idx_students_status (status)
) ENGINE=InnoDB;

ALTER TABLE users ADD UNIQUE KEY uq_users_student_id (student_id), ADD CONSTRAINT fk_users_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS courses (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
 course_code VARCHAR(32) NOT NULL,
 title VARCHAR(180) NOT NULL,
 department VARCHAR(120) NOT NULL,
 program VARCHAR(150) DEFAULT NULL,
 semester VARCHAR(40) NOT NULL,
 credits DECIMAL(3,1) NOT NULL DEFAULT 3.0,
 instructor VARCHAR(150) DEFAULT NULL,
 description VARCHAR(500) NOT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (id), UNIQUE KEY uq_courses_code (course_code),
 KEY idx_courses_department_semester (department, semester)
) ENGINE=InnoDB;


-- Create the initial administrator from a terminal with: php database/create_admin.php "Campus Administrator" admin@example.com
