-- Import once on installations that already have the student role/link migration.
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
