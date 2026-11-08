<?php require_once __DIR__.'/includes/bootstrap.php'; if(current_user()){if(current_user()['role']==='Admin'){header('Location: pages/dashboard.php');exit;}if(current_user()['role']==='Student'){header('Location: pages/student-dashboard.php');exit;}$_SESSION=[];session_destroy();} ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="EduCore Student Management System — secure administrator sign in."
    />
    <title>Sign in · EduCore Student Management</title>
    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="css/variables.css" />
    <link rel="stylesheet" href="css/base.css" />
    <link rel="stylesheet" href="css/components.css" />
    <link rel="stylesheet" href="css/auth.css" />
  </head>
  <body data-page="login" data-title="Sign in" data-section="Authentication">
    <div class="auth">
      <!-- Brand panel -->
      <section class="auth__brand">
        <a class="auth__logo" href="index.php">
          <span class="brand-mark"><i data-lucide="book-open-check"></i></span>
          <span>
            <strong>EduCore</strong>
            <span>Student Management</span>
          </span>
        </a>

        <div class="auth__pitch">
          <h1>Everything your registrar's office needs, in one calm workspace.</h1>
          <p>
            Enrol students, track programmes and semesters, manage staff access
            and keep every record accurate — with a dashboard your team will
            actually enjoy using.
          </p>

          <ul class="auth__features">
            <li class="auth__feature">
              <span class="tick"><i data-lucide="check"></i></span>
              Complete student records with registration numbers &amp; history
            </li>
            <li class="auth__feature">
              <span class="tick"><i data-lucide="check"></i></span>
              Instant search, filters and pagination across thousands of rows
            </li>
            <li class="auth__feature">
              <span class="tick"><i data-lucide="check"></i></span>
              Role-based user management for administrators and lecturers
            </li>
          </ul>
        </div>

        <div class="auth__stats">
          <div class="auth__stat"><strong>1,240+</strong><span>Students</span></div>
          <div class="auth__stat"><strong>98.6%</strong><span>Data accuracy</span></div>
          <div class="auth__stat"><strong>24/7</strong><span>Portal access</span></div>
        </div>
      </section>

      <!-- Form panel -->
      <section class="auth__panel">
        <header class="auth__panel-head">
          <a class="auth__mobile-brand" href="index.php">
            <span class="brand-mark"><i data-lucide="book-open-check"></i></span>
            <strong>EduCore</strong>
          </a>
          <p class="text-sm text-muted">
            Student access is provisioned by your administrator.
          </p>
        </header>

        <div class="auth__panel-body">
          <h1 class="auth__form-title">Welcome back</h1>
          <p class="auth__form-sub">
            Sign in to open your administrator or student workspace.
          </p>
          <form class="auth-form" id="loginForm" novalidate>
          <input type="hidden" name="_csrf" value="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
            <div class="field">
              <label class="field__label" for="loginEmail"
                >Email address <span class="req">*</span></label
              >
              <div class="input-icon">
                <i data-lucide="mail"></i>
                <input
                  class="input"
                  type="email"
                  id="loginEmail"
                  name="email"
                  placeholder="you@northfield.edu"
                  data-label="Email address"
                  autocomplete="email"
                  required
                />
              </div>
              <p class="field__error"></p>
            </div>

            <div class="field">
              <label class="field__label" for="loginPassword"
                >Password <span class="req">*</span></label
              >
              <div class="input-icon input-icon--trailing">
                <i data-lucide="lock-keyhole"></i>
                <input
                  class="input"
                  type="password"
                  id="loginPassword"
                  name="password"
                  placeholder="Enter your password"
                  data-label="Password"
                  minlength="6"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="input-action"
                  data-toggle-password="#loginPassword"
                  aria-label="Show password"
                >
                  <i data-lucide="eye"></i>
                </button>
              </div>
              <p class="field__error"></p>
            </div>

            <div class="auth-form__meta">
              <label class="checkbox-line">
                <input type="checkbox" id="rememberMe" />
                <span>Keep me signed in for 30 days</span>
              </label>
              <a href="#" id="forgotLink">Forgot password?</a>
            </div>

            <button type="submit" class="btn btn--primary btn--lg btn--block" id="signInBtn">
              <i data-lucide="log-in"></i> Sign in to dashboard
            </button>

            <div class="auth-divider">or</div>

            <button type="button" class="btn btn--lg btn--block" id="ssoBtn">
              <i data-lucide="shield-check"></i> Continue Campus Access
            </button>
          </form>

          <p class="auth-alt">
            Need access? Contact your university administrator.
          </p>
        </div>

        <footer class="auth__panel-foot">
          © 2026 Northfield University · ICT Services · Privacy · Terms
        </footer>
      </section>
    </div>

    <div id="toastRoot" class="toast-root" role="status" aria-live="polite"></div>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="js/data.js"></script>
    <script src="js/app.js"></script>
    <script src="js/auth.js"></script>
  </body>
</html>
