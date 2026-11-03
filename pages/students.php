<?php require_once __DIR__.'/../includes/bootstrap.php'; page_guard(true); ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Search, filter and manage every student record in EduCore." />
    <title>Students · EduCore Student Management</title>
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
    data-title="Student Management"
    data-section="Students"
  >
    <main class="main">
      <div class="page">
        <!-- Page header -->
        <div class="page-head">
          <div>
            <h1 class="page-head__title">Student Management</h1>
            <p class="page-head__subtitle">
              Browse, search and maintain every student record across all
              departments and programmes.
            </p>
          </div>
          <div class="page-head__actions">
            <button type="button" class="btn" id="exportStudents">
              <i data-lucide="download"></i> Export CSV
            </button>
            <a class="btn btn--primary" href="add-student.php">
              <i data-lucide="user-plus"></i> Add student
            </a>
          </div>
        </div>

        <!-- Search & filters -->
        <section class="toolbar" aria-label="Search and filters">
          <div class="toolbar__search">
            <i data-lucide="search"></i>
            <input
              type="search"
              id="studentSearch"
              placeholder="Search by name, registration number, email…"
              aria-label="Search students"
              autocomplete="off"
            />
          </div>

          <div class="toolbar__group">
            <select class="select" id="filterDepartment" aria-label="Filter by department">
              <option value="">All departments</option>
            </select>

            <select class="select" id="filterProgram" aria-label="Filter by programme">
              <option value="">All programmes</option>
            </select>

            <select class="select" id="filterSemester" aria-label="Filter by semester">
              <option value="">All semesters</option>
            </select>

            <select class="select" id="filterStatus" aria-label="Filter by status">
              <option value="">All statuses</option>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>

            <button type="button" class="btn btn--ghost" id="clearFilters">
              <i data-lucide="filter-x"></i> Clear
            </button>
          </div>

          <span class="toolbar__meta ms-auto" id="resultMeta"></span>
        </section>

        <!-- Records table -->
        <section class="table-card">
          <div class="bulk-bar" id="bulkBar">
            <span><strong id="selectedCount">0</strong> students selected</span>
            <div class="d-flex gap-2 ms-auto">
              <button type="button" class="btn btn--sm" id="bulkExport">
                <i data-lucide="download"></i> Export selected
              </button>
              <button type="button" class="btn btn--danger-soft btn--sm" id="bulkDelete">
                <i data-lucide="trash-2"></i> Delete selected
              </button>
              <button type="button" class="btn btn--ghost btn--sm" id="bulkClear">
                <i data-lucide="x"></i> Deselect
              </button>
            </div>
          </div>

          <div class="table-scroll">
            <table class="table" id="studentTable">
              <thead>
                <tr>
                  <th class="col-check">
                    <input type="checkbox" id="selectAll" aria-label="Select all students on this page" />
                  </th>
                  <th class="sortable" data-sort="name">Student <i class="sort-icon" data-lucide="arrow-up-down"></i></th>
                  <th class="sortable" data-sort="regNo">Reg. number <i class="sort-icon" data-lucide="arrow-up-down"></i></th>
                  <th class="sortable" data-sort="department">Department <i class="sort-icon" data-lucide="arrow-up-down"></i></th>
                  <th>Programme</th>
                  <th class="sortable hide-mobile" data-sort="semester">Semester <i class="sort-icon" data-lucide="arrow-up-down"></i></th>
                  <th class="sortable hide-mobile" data-sort="joined">Registered <i class="sort-icon" data-lucide="arrow-up-down"></i></th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody id="studentTableBody"></tbody>
            </table>
          </div>

          <div class="empty-state d-none" id="studentsEmpty">
            <img class="empty-state__art" src="../images/empty-students.svg" alt="" />
            <h3 class="empty-state__title">No students found</h3>
            <p class="empty-state__desc" id="emptyDesc">
              No records match your current search and filters. Adjust the
              criteria or add a new student to get started.
            </p>
            <div class="d-flex gap-3 flex-wrap justify-center">
              <button type="button" class="btn btn--soft" id="emptyClear">
                <i data-lucide="filter-x"></i> Reset filters
              </button>
              <a class="btn btn--primary" href="add-student.php">
                <i data-lucide="user-plus"></i> Add student
              </a>
            </div>
          </div>

          <div class="pagination" id="studentPager"></div>
        </section>
      </div>
    </main>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/data.js"></script>
    <script src="../js/app.js"></script>
    <script src="../js/students.js"></script>
  </body>
</html>
