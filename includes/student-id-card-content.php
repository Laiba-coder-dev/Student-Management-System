<section class="id-card-toolbar no-print">
  <div><p class="id-eyebrow">DIGITAL STUDENT ID</p><h1 class="id-page-title">Student identity card</h1><p class="id-page-subtitle">Your front and back card preview. Download PDF saves both sides as a file; Print card opens the browser print dialog.</p></div>
  <div class="id-toolbar-actions"><button type="button" class="btn" id="printCard"><i data-lucide="printer"></i> Print card</button><button type="button" class="btn btn--primary" id="downloadCard"><i data-lucide="download"></i> Download PDF</button></div>
</section>
<div class="id-card-alert" id="cardAlert" hidden role="status"></div>
<section class="id-card-pair" id="cardPair" hidden aria-label="Front and back of student ID card">
  <article class="id-card id-card-front" id="cardFront">
    <header class="id-front-head"><img src="../images/logo.svg" alt="Northfield University logo"><div><strong>Northfield University</strong><span>OFFICIAL STUDENT IDENTIFICATION</span></div><span class="id-card-seal"><i data-lucide="badge-check"></i></span></header>
    <div class="id-front-body"><div class="id-photo-wrap"><img id="cardPhoto" alt="Student profile photograph" hidden><span class="id-photo-fallback" id="photoFallback">ST</span></div><div class="id-student-main"><span class="id-card-label">STUDENT ID</span><h2 id="cardName">—</h2><div class="id-number" id="cardNumber">—</div><div class="id-reg"><span>Registration no.</span><strong id="cardReg">—</strong></div></div></div>
    <div class="id-academic-row"><div><span>Department</span><strong id="cardDepartment">—</strong></div><div><span>Degree / program</span><strong id="cardProgram">—</strong></div><div><span>Semester</span><strong id="cardSemester">—</strong></div></div>
    <footer class="id-front-footer"><span>Session <strong id="cardSession">—</strong></span><span>Issued <strong id="cardIssue">—</strong></span><span>Valid through <strong id="cardExpiry">—</strong></span></footer>
  </article>
  <article class="id-card id-card-back" id="cardBack">
    <header class="id-back-head"><strong>Northfield University</strong><span>STUDENT SERVICES · ID VERIFICATION</span></header>
    <div class="id-back-main"><div class="id-qr-frame" id="qrCode" aria-label="QR code for ID verification"></div><div class="id-back-copy"><span class="id-card-label">SCAN TO VERIFY</span><h2>Official student identity</h2><p>This card confirms the holder’s identity and current card status. Verification displays limited public information only.</p><div class="id-status-line"><span>Card status</span><strong id="cardStatus" class="id-status">Valid</strong></div><a id="verifyLink" href="#" target="_blank" rel="noopener">Open verification page</a></div></div>
    <footer class="id-back-footer"><span>If found, please return this card to Northfield University Student Services.</span><span>Card no. <strong id="backCardNumber">—</strong></span></footer>
  </article>
</section>
<section class="id-card-empty" id="cardEmpty" hidden><span class="id-empty-icon"><i data-lucide="id-card"></i></span><h2 id="emptyTitle">ID card unavailable</h2><p id="emptyMessage">Ask the administrator to generate your student ID card.</p><a class="btn" id="backLink" href="student-dashboard.php">Back</a></section>
