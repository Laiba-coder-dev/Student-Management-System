<?php require_once __DIR__.'/../includes/bootstrap.php'; page_guard(true); ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Full student profile and academic record in EduCore." />
    <title>Student Details · EduCore Student Management</title>
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../css/variables.css" />
    <link rel="stylesheet" href="../css/base.css" />
    <link rel="stylesheet" href="../css/layout.css" />
    <link rel="stylesheet" href="../css/components.css" />
    <link rel="stylesheet" href="../css/pages.css" />
  </head>
  <body
    data-shell="true"
    data-page="students"
    data-title="Student Details"
    data-section="Students"
  >
    <main class="main">
      <div class="page">
        <!-- Breadcrumb row -->
        <div class="page-head">
          <div>
            <h1 class="page-head__title">Student Details</h1>
            <p class="page-head__subtitle" id="detailsSubtitle">
              Complete profile, academic standing and enrolment history.
            </p>
          </div>
          <div class="page-head__actions">
            <a class="btn" href="students.php"><i data-lucide="arrow-left"></i> Back to list</a>
            <a class="btn btn--primary" id="editLink" href="students.php">
              <i data-lucide="pencil"></i> Edit student
            </a>
          </div>
        </div>

        <!-- Not found state -->
        <section class="card d-none" id="notFound">
          <div class="empty-state">
            <img class="empty-state__art" src="../images/empty-students.svg" alt="" />
            <h3 class="empty-state__title">Student record not found</h3>
            <p class="empty-state__desc">
              This student may have been deleted, or the link is out of date.
            </p>
            <a class="btn btn--primary" href="students.php">
              <i data-lucide="graduation-cap"></i> Back to students
            </a>
          </div>
        </section>

        <div id="detailsLayout" class="d-none">
          <!-- Profile hero -->
          <section class="profile-hero">
            <div class="profile-hero__avatar">
              <span class="avatar avatar--xl" id="heroAvatar">—</span>
            </div>
            <div class="profile-hero__body">
              <h1>
                <span id="heroName">Student</span>
                <span id="heroStatus"></span>
              </h1>
              <div class="profile-hero__meta">
                <span><i data-lucide="badge"></i> <span id="heroReg">—</span></span>
                <span><i data-lucide="mail"></i> <span id="heroEmail">—</span></span>
                <span><i data-lucide="phone"></i> <span id="heroPhone">—</span></span>
                <span><i data-lucide="building-2"></i> <span id="heroDept">—</span></span>
              </div>
            </div>
            <div class="profile-hero__actions">
              <button type="button" class="btn" id="printBtn">
                <i data-lucide="printer"></i> Print
              </button>
              <button type="button" class="btn" id="exportBtn">
                <i data-lucide="download"></i> Export
              </button>
              <div class="dropdown" data-dropdown>
                <button
                  type="button"
                  class="btn btn--icon"
                  data-dropdown-toggle
                  aria-label="More actions"
                  aria-expanded="false"
                >
                  <i data-lucide="ellipsis"></i>
                </button>
                <div class="dropdown__menu" data-dropdown-menu>
                  <button type="button" class="dropdown__item" data-detail-action="email">
                    <i data-lucide="send"></i> Email student
                  </button>
                  <button type="button" class="dropdown__item" data-detail-action="duplicate">
                    <i data-lucide="copy"></i> Duplicate record
                  </button>
                  <button type="button" class="dropdown__item" data-detail-action="transcript">
                    <i data-lucide="file-text"></i> Request transcript
                  </button>
                  <div class="dropdown__sep"></div>
                  <button type="button" class="dropdown__item dropdown__item--danger" data-detail-action="delete">
                    <i data-lucide="trash-2"></i> Delete student
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- KPI strip -->
          <section class="kpi-strip mb-6" aria-label="Academic summary">
            <div class="kpi-cell">
              <strong id="kpiGpa">—</strong>
              <span>Cumulative GPA</span>
            </div>
            <div class="kpi-cell">
              <strong id="kpiAttendance">—</strong>
              <span>Attendance rate</span>
            </div>
            <div class="kpi-cell">
              <strong id="kpiAge">—</strong>
              <span>Age · years</span>
            </div>
          </section>

          <div class="details-grid">
            <!-- Left column -->
            <div class="dash-col">
              <section class="card">
                <div class="card__header">
                  <div>
                    <h2 class="card__title">
                      <i data-lucide="contact"></i> Personal information
                    </h2>
                    <p class="card__subtitle">Contact and identity details.</p>
                  </div>
                </div>
                <div class="card__body">
                  <div class="detail-list" id="personalList"></div>
                </div>
              </section>

              <section class="card">
                <div class="card__header">
                  <div>
                    <h2 class="card__title">
                      <i data-lucide="graduation-cap"></i> Academic information
                    </h2>
                    <p class="card__subtitle">Programme, semester and standing.</p>
                  </div>
                  <span class="badge badge--brand" id="academicBadge">Enrolled</span>
                </div>
                <div class="card__body" id="academicList"></div>
              </section>
            </div>

            <!-- Right column -->
            <div class="dash-col">
              <section class="card">
                <div class="card__header card__header--plain">
                  <div>
                    <h2 class="card__title"><i data-lucide="chart-line"></i> Performance</h2>
                    <p class="card__subtitle">GPA against programme targets.</p>
                  </div>
                </div>
                <div class="card__body" id="performanceList"></div>
              </section>

              <section class="card">
                <div class="card__header card__header--plain">
                  <div>
                    <h2 class="card__title"><i data-lucide="history"></i> Enrolment timeline</h2>
                  </div>
                </div>
                <div class="card__body">
                  <div class="timeline" id="timeline"></div>
                </div>
              </section>

              <section class="card">
                <div class="card__header card__header--plain">
                  <div>
                    <h2 class="card__title"><i data-lucide="zap"></i> Quick actions</h2>
                  </div>
                </div>
                <div class="card__body">
                  <div class="quick-actions">
                    <a class="quick-action" id="qaEdit" href="students.php">
                      <span class="quick-action__icon"><i data-lucide="pencil"></i></span>
                      <strong>Edit record</strong>
                      <span>Update personal details</span>
                    </a>
                    <button type="button" class="quick-action" data-detail-action="transcript">
                      <span class="quick-action__icon quick-action__icon--violet"
                        ><i data-lucide="file-text"></i
                      ></span>
                      <strong>Transcript</strong>
                      <span>Request an official copy</span>
                    </button>
                    <button type="button" class="quick-action" data-detail-action="message">
                      <span class="quick-action__icon quick-action__icon--success"
                        ><i data-lucide="message-square"></i
                      ></span>
                      <strong>Send message</strong>
                      <span>Email the student directly</span>
                    </button>
                    <button type="button" class="quick-action" data-detail-action="delete">
                      <span class="quick-action__icon quick-action__icon--warning"
                        ><i data-lucide="trash-2"></i
                      ></span>
                      <strong>Delete record</strong>
                      <span>Remove from the system</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/data.js"></script>
    <script src="../js/app.js"></script>
    <script src="../js/student-details.js"></script>
  </body>
</html>
