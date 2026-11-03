<?php require_once __DIR__.'/../includes/bootstrap.php'; page_guard(true); ?>
<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Student ID Cards · EduCore</title><link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/variables.css"><link rel="stylesheet" href="../css/base.css"><link rel="stylesheet" href="../css/layout.css"><link rel="stylesheet" href="../css/components.css"><link rel="stylesheet" href="../css/pages.css"><link rel="stylesheet" href="../css/student-id-cards.css">
</head><body data-shell="true" data-page="student-id-cards" data-title="Student ID Cards" data-section="Student ID Cards">
<main class="main"><div class="page">
  <div class="page-head"><div><h1 class="page-head__title">Student ID Cards</h1><p class="page-head__subtitle">Generate, view, print, and revoke secure student identity cards.</p></div><div class="page-head__actions"><button type="button" class="btn btn--primary" id="generateAll"><i data-lucide="layers-3"></i> Generate all missing cards</button></div></div>
  <div class="id-stats"><article><span class="id-stat-icon"><i data-lucide="users-round"></i></span><div><small>Registered students</small><strong id="statStudents">—</strong></div></article><article><span class="id-stat-icon id-stat-icon--green"><i data-lucide="id-card"></i></span><div><small>Cards generated</small><strong id="statGenerated">—</strong></div></article><article><span class="id-stat-icon id-stat-icon--amber"><i data-lucide="circle-dashed"></i></span><div><small>Not generated</small><strong id="statMissing">—</strong></div></article></div>
  <section class="id-list-card"><div class="id-list-toolbar"><div class="id-list-search"><i data-lucide="search"></i><input type="search" id="cardSearch" placeholder="Search name, registration number, department…" aria-label="Search student ID cards"></div><span class="id-list-count" id="listCount">Loading students…</span></div><div class="table-scroll"><table class="table"><thead><tr><th>Student</th><th>Registration number</th><th>Department</th><th>Semester</th><th>Card status</th><th class="col-actions">Actions</th></tr></thead><tbody id="cardTableBody"></tbody></table></div><div class="id-table-empty" id="listEmpty" hidden>No students match your search.</div></section>
</div></main>
<div id="toastRoot" class="toast-root" role="status" aria-live="polite"></div>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script><script src="../js/data.js"></script><script src="../js/app.js"></script><script src="../js/student-id-cards.js"></script>
</body></html>
