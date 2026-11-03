<?php require_once __DIR__.'/../includes/bootstrap.php'; page_guard(); if(current_user()['role']==='Admin'){header('Location: dashboard.php');exit;} if(current_user()['role']!=='Student'){header('Location: ../index.php');exit;} ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Your Northfield University student portal.">
  <title>Student Portal · EduCore</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/variables.css"><link rel="stylesheet" href="../css/base.css">
  <link rel="stylesheet" href="../css/student-dashboard.css"><link rel="stylesheet" href="../css/student-id-cards.css">
</head>
<body class="student-portal" data-page="student-dashboard">
  <header class="portal-header">
    <a class="portal-brand" href="student-dashboard.php"><span class="portal-mark"><i data-lucide="book-open-check"></i></span><span><strong>EduCore</strong><small>Student Portal</small></span></a>
    <div class="portal-header__right"><span class="secure-label"><i data-lucide="shield-check"></i> Secure student access</span><a class="portal-id-link" href="student-my-id-card.php"><i data-lucide="id-card"></i> My ID Card</a><button type="button" class="portal-logout" id="logoutButton"><i data-lucide="log-out"></i> Sign out</button></div>
  </header>
  <main class="portal-main">
    <section class="portal-welcome"><div><p class="eyebrow">NORTHFIELD UNIVERSITY</p><h1 id="welcomeTitle">Welcome back</h1><p class="welcome-copy">Here is your student profile and latest academic information.</p></div><div class="welcome-icon"><i data-lucide="graduation-cap"></i></div></section>
    <div class="portal-error" id="loadError" hidden role="alert"></div>
    <section class="profile-hero" id="profileHero" hidden>
      <div class="profile-avatar" id="studentAvatar">ST</div>
      <div class="profile-hero__identity"><span class="eyebrow">STUDENT PROFILE</span><h2 id="studentName">—</h2><p class="profile-role" id="studentRole">Student</p><p id="studentProgram">—</p></div>
      <div class="profile-reg"><span>Registration number</span><strong id="studentReg">—</strong></div>
    </section>
    <section class="portal-grid" id="portalContent" hidden>
      <article class="portal-card academic-card"><div class="card-heading"><span class="card-icon card-icon--blue"><i data-lucide="graduation-cap"></i></span><div><h2>Academic information</h2><p>Your current enrolment details</p></div></div>
        <div class="academic-grid"><div class="info-tile"><span>Department</span><strong id="department">—</strong></div><div class="info-tile"><span>Degree program</span><strong id="program">—</strong></div><div class="info-tile"><span>Current semester</span><strong id="semester">—</strong></div><div class="info-tile"><span>Enrollment status</span><strong id="status">—</strong></div></div>
        <div class="academic-metrics"><div class="metric"><span class="metric-icon"><i data-lucide="chart-no-axes-column-increasing"></i></span><div><small>Current GPA</small><strong id="gpa">—</strong></div></div><div class="metric"><span class="metric-icon metric-icon--teal"><i data-lucide="calendar-check-2"></i></span><div><small>Attendance</small><strong id="attendance">—</strong></div></div></div>
      </article>
      <article class="portal-card contact-card"><div class="card-heading"><span class="card-icon card-icon--violet"><i data-lucide="contact-round"></i></span><div><h2>Contact details</h2><p>Information on your student record</p></div></div>
        <div class="contact-list"><div class="contact-row"><span class="contact-icon"><i data-lucide="mail"></i></span><div><small>Email address</small><strong id="email">—</strong></div></div><div class="contact-row"><span class="contact-icon"><i data-lucide="phone"></i></span><div><small>Phone number</small><strong id="phone">—</strong></div></div><div class="contact-row"><span class="contact-icon"><i data-lucide="map-pin"></i></span><div><small>Home address</small><strong id="address">—</strong></div></div><div class="contact-row"><span class="contact-icon"><i data-lucide="calendar-days"></i></span><div><small>Date of birth</small><strong id="dob">—</strong></div></div><div class="contact-row"><span class="contact-icon"><i data-lucide="users-round"></i></span><div><small>Guardian contact</small><strong id="guardian">—</strong></div></div></div>
      </article>
    </section>
    <section class="portal-card courses-card" id="coursesCard" hidden>
      <div class="card-heading"><span class="card-icon card-icon--teal"><i data-lucide="book-open-check"></i></span><div><h2>Current semester courses</h2><p id="courseSemester">Courses connected to your department and semester</p></div><span class="course-count" id="courseCount">0 courses</span></div>
      <div class="course-grid" id="courseList"></div>
      <p class="courses-empty" id="coursesEmpty" hidden>No courses are listed for your department and semester yet. Please check with your department office.</p>
    </section>
    <footer class="portal-footer"><span>EduCore Student Management</span><span>Your student portal shows your own enrollment and academic information.</span></footer>
  </main>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script><script src="../js/data.js"></script><script src="../js/student-dashboard.js"></script>
</body>
</html>
