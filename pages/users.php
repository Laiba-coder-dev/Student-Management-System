<?php require_once __DIR__.'/../includes/bootstrap.php'; page_guard(true); ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Manage staff accounts and portal permissions in EduCore." />
    <title>User Management · EduCore Student Management</title>
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
    data-page="users"
    data-title="User Management"
    data-section="Users"
  >
    <main class="main">
      <div class="page">
        <div class="page-head">
          <div>
            <h1 class="page-head__title">User Management</h1>
            <p class="page-head__subtitle">
              Control who can access EduCore and what they are allowed to do.
            </p>
          </div>
          <div class="page-head__actions">
            <button type="button" class="btn" id="exportUsers">
              <i data-lucide="download"></i> Export
            </button>
            <button type="button" class="btn btn--primary" id="inviteUser">
              <i data-lucide="user-plus"></i> Invite user
            </button>
          </div>
        </div>

        <!-- Summary -->
        <section class="user-summary" aria-label="User statistics">
          <div class="mini-stat">
            <span class="mini-stat__icon"><i data-lucide="users"></i></span>
            <div><strong id="sumTotal">0</strong><span>Total users</span></div>
          </div>
          <div class="mini-stat">
            <span class="mini-stat__icon mini-stat__icon--violet"
              ><i data-lucide="shield-check"></i
            ></span>
            <div><strong id="sumAdmins">0</strong><span>Administrators</span></div>
          </div>
          <div class="mini-stat">
            <span class="mini-stat__icon mini-stat__icon--success"
              ><i data-lucide="presentation"></i
            ></span>
            <div><strong id="sumLecturers">0</strong><span>Standard users</span></div>
          </div>
          <div class="mini-stat">
            <span class="mini-stat__icon mini-stat__icon--warning"
              ><i data-lucide="mail-question"></i
            ></span>
            <div><strong id="sumPending">0</strong><span>Inactive accounts</span></div>
          </div>
        </section>

        <!-- Filters -->
        <section class="toolbar" aria-label="Search and filters">
          <div class="toolbar__search">
            <i data-lucide="search"></i>
            <input
              type="search"
              id="userSearch"
              placeholder="Search by name or email…"
              aria-label="Search users"
              autocomplete="off"
            />
          </div>
          <div class="toolbar__group">
            <select class="select" id="filterRole" aria-label="Filter by role">
              <option value="">All roles</option>
              <option>Administrator</option><option>Registrar</option>
            </select>
            <select class="select" id="filterUserStatus" aria-label="Filter by status">
              <option value="">All statuses</option>
              <option>Active</option><option>Inactive</option>
            </select>
            <button type="button" class="btn btn--ghost" id="clearUserFilters">
              <i data-lucide="filter-x"></i> Clear
            </button>
          </div>
          <span class="toolbar__meta ms-auto" id="userResultMeta"></span>
        </section>

        <!-- Table -->
        <section class="table-card">
          <div class="table-scroll">
            <table class="table" id="userTable">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th class="hide-mobile">Last active</th>
                  <th class="hide-mobile">Joined</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody id="userTableBody"></tbody>
            </table>
          </div>

          <div class="empty-state d-none" id="usersEmpty">
            <img class="empty-state__art" src="../images/empty-users.svg" alt="" />
            <h3 class="empty-state__title">No users found</h3>
            <p class="empty-state__desc">
              No accounts match your search. Clear the filters or invite a new
              team member to EduCore.
            </p>
            <button type="button" class="btn btn--soft" id="emptyUserClear">
              <i data-lucide="filter-x"></i> Reset filters
            </button>
          </div>

          <div class="pagination" id="userPager"></div>
        </section>
      </div>
    </main>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/data.js"></script>
    <script src="../js/app.js"></script>
    <script src="../js/users.js"></script>
  </body>
</html>
