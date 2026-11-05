<?php require_once __DIR__.'/../includes/bootstrap.php'; page_guard(true); ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="EduCore overview dashboard — student management at a glance." />
    <title>Overview Dashboard · EduCore Student Management</title>
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
    data-page="dashboard"
    data-title="Overview Dashboard"
    data-section="Dashboard"
  >
    <main class="main">
      <div class="page">
        <!-- Page header -->
        <div class="page-head">
          <div>
            <h1 class="page-head__title">Overview Dashboard</h1>
            <p class="page-head__subtitle">
              Welcome back, Admin — here is what is happening across
              Northfield University today.
            </p>
          </div>
          <div class="page-head__actions">
            <button type="button" class="btn" id="refreshBtn">
              <i data-lucide="refresh-cw"></i> Refresh
            </button>
            <button type="button" class="btn" id="exportBtn">
              <i data-lucide="download"></i> Export report
            </button>
            <a class="btn btn--primary" href="add-student.php">
              <i data-lucide="user-plus"></i> Add student
            </a>
          </div>
        </div>

        <!-- Welcome banner -->
        <section class="dash-banner">
          <div class="dash-banner__text">
            <h2>Spring 2026 registration is in full swing</h2>
            <p id="bannerText">
              New students joined this week. Review the latest enrolments or
              continue managing your student records below.
            </p>
          </div>
          <div class="dash-banner__actions">
            <a class="btn btn--white" href="students.php">
              <i data-lucide="graduation-cap"></i> Browse students
            </a>
            <a class="btn btn--outline-white" href="add-student.php">
              <i data-lucide="plus"></i> New enrolment
            </a>
          </div>
        </section>

        <!-- KPI cards -->
        <section class="stat-grid" aria-label="Key metrics">
          <article class="stat-card">
            <div class="stat-card__top">
              <span class="stat-card__icon"><i data-lucide="graduation-cap"></i></span>
              <span class="stat-card__trend stat-card__trend--up">
                <i data-lucide="trending-up"></i> 4.8%
              </span>
            </div>
            <div>
              <p class="stat-card__label">Total Students</p>
              <p class="stat-card__value" id="kpiTotalStudents">0</p>
            </div>
            <div class="stat-card__bar"><span id="kpiStudentsBar" style="width: 0%"></span></div>
            <p class="stat-card__foot" id="kpiStudentsFoot">Across 10 departments</p>
          </article>

          <article class="stat-card">
            <div class="stat-card__top">
              <span class="stat-card__icon stat-card__icon--violet"
                ><i data-lucide="user-plus"></i
              ></span>
              <span class="stat-card__trend stat-card__trend--up">
                <i data-lucide="trending-up"></i> 12%
              </span>
            </div>
            <div>
              <p class="stat-card__label">Recent Registrations</p>
              <p class="stat-card__value" id="kpiRecent">0</p>
            </div>
            <div class="stat-card__bar">
              <span id="kpiRecentBar" style="width: 0%; background: var(--violet-500)"></span>
            </div>
            <p class="stat-card__foot" id="kpiRecentFoot">Last 7 days</p>
          </article>

          <article class="stat-card">
            <div class="stat-card__top">
              <span class="stat-card__icon stat-card__icon--warning"
                ><i data-lucide="users"></i
              ></span>
              <span class="stat-card__trend stat-card__trend--up">
                <i data-lucide="trending-up"></i> 1 new
              </span>
            </div>
            <div>
              <p class="stat-card__label">Total Users</p>
              <p class="stat-card__value" id="kpiUsers">0</p>
            </div>
            <div class="stat-card__bar">
              <span id="kpiUsersBar" style="width: 0%; background: var(--warning)"></span>
            </div>
            <p class="stat-card__foot" id="kpiUsersFoot">Staff with portal access</p>
          </article>

          <article class="stat-card">
            <div class="stat-card__top">
              <span class="stat-card__icon stat-card__icon--success"
                ><i data-lucide="activity"></i
              ></span>
              <span class="stat-card__trend stat-card__trend--up">
                <i data-lucide="trending-up"></i> 2.1%
              </span>
            </div>
            <div>
              <p class="stat-card__label">Active Students</p>
              <p class="stat-card__value" id="kpiActive">0</p>
            </div>
            <div class="stat-card__bar">
              <span id="kpiActiveBar" style="width: 0%; background: var(--success)"></span>
            </div>
            <p class="stat-card__foot" id="kpiActiveFoot">Currently enrolled</p>
          </article>
        </section>

        <!-- Main grid -->
        <div class="dash-grid">
          <div class="dash-col">
            <!-- Recent registrations -->
            <section class="table-card" aria-labelledby="recentTitle">
              <div class="card__header">
                <div>
                  <h2 class="card__title" id="recentTitle">
                    <i data-lucide="list-checks"></i> Recent Student Registrations
                  </h2>
                  <p class="card__subtitle">
                    Newly enrolled students — search to find anyone instantly.
                  </p>
                </div>
                <div class="card__actions">
                  <div class="toolbar__search" style="flex: 0 1 260px; margin: 0">
                    <i data-lucide="search"></i>
                    <input
                      type="search"
                      id="dashSearch"
                      placeholder="Search students…"
                      aria-label="Search recent students"
                      autocomplete="off"
                    />
                  </div>
                  <a class="btn btn--soft btn--sm" href="students.php">
                    View all <i data-lucide="arrow-right"></i>
                  </a>
                </div>
              </div>

              <div class="table-scroll" id="dashTableWrap">
                <table class="table" id="dashTable">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Reg. number</th>
                      <th>Department</th>
                      <th class="hide-mobile">Programme</th>
                      <th>Registered</th>
                      <th>Status</th>
                      <th class="col-actions">Action</th>
                    </tr>
                  </thead>
                  <tbody id="dashTableBody"></tbody>
                </table>
              </div>

              <div class="empty-state d-none" id="dashEmpty">
                <img class="empty-state__art" src="../images/empty-search.svg" alt="" />
                <h3 class="empty-state__title">No matching students</h3>
                <p class="empty-state__desc">
                  We could not find anyone matching your search. Try a different
                  name, registration number or department.
                </p>
                <button type="button" class="btn btn--soft" id="clearDashSearch">
                  <i data-lucide="x"></i> Clear search
                </button>
              </div>

              <div class="pagination" id="dashPager" hidden></div>
            </section>

            <!-- Enrolment breakdown -->
            <section class="card">
              <div class="card__header">
                <div>
                  <h2 class="card__title">
                    <i data-lucide="chart-no-axes-column-increasing"></i>
                    Enrolment by department
                  </h2>
                  <p class="card__subtitle">
                    Distribution of students across the largest departments.
                  </p>
                </div>
                <span class="badge badge--brand">Spring 2026</span>
              </div>
              <div class="card__body" id="deptMeters"></div>
            </section>
          </div>

          <div class="dash-col">
            <!-- Quick actions -->
            <section class="card">
              <div class="card__header card__header--plain">
                <div>
                  <h2 class="card__title">
                    <i data-lucide="zap"></i> Quick actions
                  </h2>
                  <p class="card__subtitle">Shortcuts for everyday tasks.</p>
                </div>
              </div>
              <div class="card__body">
                <div class="quick-actions">
                  <button type="button" class="quick-action" data-quick="add">
                    <span class="quick-action__icon"><i data-lucide="user-plus"></i></span>
                    <strong>Add student</strong>
                    <span>Create a new enrolment record</span>
                  </button>
                  <button type="button" class="quick-action" data-quick="import">
                    <span class="quick-action__icon quick-action__icon--violet"
                      ><i data-lucide="file-up"></i
                    ></span>
                    <strong>Import records</strong>
                    <span>Upload a CSV of students</span>
                  </button>
                  <button type="button" class="quick-action" data-quick="users">
                    <span class="quick-action__icon quick-action__icon--warning"
                      ><i data-lucide="users"></i
                    ></span>
                    <strong>Manage users</strong>
                    <span>Invite or update staff access</span>
                  </button>
                  <button type="button" class="quick-action" data-quick="notice">
                    <span class="quick-action__icon quick-action__icon--success"
                      ><i data-lucide="megaphone"></i
                    ></span>
                    <strong>Broadcast notice</strong>
                    <span>Message all students</span>
                  </button>
                </div>
              </div>
            </section>

            <!-- Recent activity -->
            <section class="card">
              <div class="card__header">
                <div>
                  <h2 class="card__title">
                    <i data-lucide="history"></i> Recent activity
                  </h2>
                  <p class="card__subtitle">Latest changes in the system.</p>
                </div>
                <button type="button" class="btn btn--ghost btn--sm" id="clearActivity">
                  Clear
                </button>
              </div>
              <div class="card__body">
                <div class="activity-feed" id="activityFeed"></div>
                <div class="empty-state d-none" id="activityEmpty" style="padding: var(--space-6) var(--space-2)">
                  <img class="empty-state__art" src="../images/empty-activity.svg" alt="" />
                  <h3 class="empty-state__title">You're all caught up</h3>
                  <p class="empty-state__desc">
                    New activity will appear here as your team updates records.
                  </p>
                  <button type="button" class="btn btn--soft" id="restoreActivity">
                    <i data-lucide="rotate-ccw"></i> Restore sample activity
                  </button>
                </div>
              </div>
            </section>

            <!-- Status summary -->
            <section class="card">
              <div class="card__header card__header--plain">
                <div>
                  <h2 class="card__title">
                    <i data-lucide="badge-check"></i> Student status
                  </h2>
                  <p class="card__subtitle">Enrolment health at a glance.</p>
                </div>
              </div>
              <div class="card__body" id="statusMeters"></div>
            </section>
          </div>
        </div>
      </div>
    </main>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/data.js"></script>
    <script src="../js/app.js"></script>
    <script src="../js/dashboard.js"></script>
  </body>
</html>
