<?php require_once __DIR__.'/../includes/bootstrap.php'; if(current_user()){header('Location: dashboard.php');exit;} ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Create an EduCore account to manage student records at Northfield University."
    />
    <title>Create account · EduCore Student Management</title>
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="../css/variables.css" />
    <link rel="stylesheet" href="../css/base.css" />
    <link rel="stylesheet" href="../css/components.css" />
    <link rel="stylesheet" href="../css/auth.css" />
  </head>
  <body data-page="register" data-title="Create account" data-section="Authentication">
    <div class="auth">
      <!-- Brand panel -->
      <section class="auth__brand">
        <a class="auth__logo" href="../index.php">
          <span class="brand-mark"><i data-lucide="book-open-check"></i></span>
          <span>
            <strong>EduCore</strong>
            <span>Student Management</span>
          </span>
        </a>

        <div class="auth__pitch">
          <h1>Join the workspace your registry deserves.</h1>
          <p>
            One account gives you access to student records, enrolment forms,
            user permissions and activity reporting — all tied to Northfield
            University's directory.
          </p>

          <ul class="auth__features">
            <li class="auth__feature">
              <span class="tick"><i data-lucide="check"></i></span>
              Guided registration with real-time validation
            </li>
            <li class="auth__feature">
              <span class="tick"><i data-lucide="check"></i></span>
              Role-based permissions for registrars and lecturers
            </li>
            <li class="auth__feature">
              <span class="tick"><i data-lucide="check"></i></span>
              Full audit trail on every record you change
            </li>
          </ul>
        </div>

        <div class="auth__stats">
          <div class="auth__stat"><strong>42</strong><span>Departments</span></div>
          <div class="auth__stat"><strong>18</strong><span>Degree programmes</span></div>
          <div class="auth__stat"><strong>6</strong><span>Campuses</span></div>
        </div>
      </section>

      <!-- Form panel -->
      <section class="auth__panel">
        <header class="auth__panel-head">
          <a class="auth__mobile-brand" href="../index.php">
            <span class="brand-mark"><i data-lucide="book-open-check"></i></span>
            <strong>EduCore</strong>
          </a>
          <p class="text-sm text-muted">
            Already registered?
            <a href="../index.php"><strong>Sign in</strong></a>
          </p>
        </header>

        <div class="auth__panel-body">
          <h1 class="auth__form-title">Create your account</h1>
          <p class="auth__form-sub">
            Create an account with the details below. The registry administrator assigns access permissions.
          </p>

          <form class="auth-form" id="registerForm" novalidate>
            <div class="auth-form__row">
              <div class="field">
                <label class="field__label" for="regName"
                  >Full name <span class="req">*</span></label
                >
                <div class="input-icon">
                  <i data-lucide="user-round"></i>
                  <input
                    class="input"
                    type="text"
                    id="regName"
                    name="fullName"
                    placeholder="e.g. Jordan Avery"
                    data-label="Full name"
                    minlength="3"
                    autocomplete="name"
                    required
                  />
                </div>
                <p class="field__error"></p>
              </div>

              <div class="field">
                <label class="field__label" for="regRole"
                  >Account role <span class="req">*</span></label
                >
                <select
                  class="select"
                  id="regRole"
                  name="role"
                  data-label="Account role"
                  required
                >
                  <option selected>Registrar</option>
                </select>
                <p class="field__error"></p>
              </div>
            </div>

            <div class="field">
              <label class="field__label" for="regEmail"
                >Email address <span class="req">*</span></label
              >
              <div class="input-icon">
                <i data-lucide="mail"></i>
                <input
                  class="input"
                  type="email"
                  id="regEmail"
                  name="email"
                  placeholder="you@northfield.edu"
                  data-label="Email address"
                  autocomplete="email"
                  required
                />
              </div>
              <p class="field__hint">
                Use your institutional address so the request can be verified.
              </p>
              <p class="field__error"></p>
            </div>

            <div class="auth-form__row">
              <div class="field">
                <label class="field__label" for="regPassword"
                  >Password <span class="req">*</span></label
                >
                <div class="input-icon input-icon--trailing">
                  <i data-lucide="lock-keyhole"></i>
                  <input
                    class="input"
                    type="password"
                    id="regPassword"
                    name="password"
                    placeholder="Min. 8 characters"
                    data-label="Password"
                    minlength="8"
                    autocomplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    class="input-action"
                    data-toggle-password="#regPassword"
                    aria-label="Show password"
                  >
                    <i data-lucide="eye"></i>
                  </button>
                </div>
                <p class="field__error"></p>
              </div>

              <div class="field">
                <label class="field__label" for="regConfirm"
                  >Confirm password <span class="req">*</span></label
                >
                <div class="input-icon input-icon--trailing">
                  <i data-lucide="shield-check"></i>
                  <input
                    class="input"
                    type="password"
                    id="regConfirm"
                    name="confirmPassword"
                    placeholder="Repeat password"
                    data-label="Confirm password"
                    data-match="#regPassword"
                    data-match-msg="Passwords do not match."
                    autocomplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    class="input-action"
                    data-toggle-password="#regConfirm"
                    aria-label="Show password"
                  >
                    <i data-lucide="eye"></i>
                  </button>
                </div>
                <p class="field__error"></p>
              </div>
            </div>

            <div class="strength" id="passwordStrength" data-level="0">
              <div class="strength__bars">
                <span></span><span></span><span></span><span></span>
              </div>
              <p class="strength__label">
                Password strength: <strong id="strengthText">—</strong>
              </p>
            </div>

            <label class="checkbox-line" id="termsField">
              <input type="checkbox" id="regTerms" name="terms" data-label="Terms acceptance" data-error-target="#termsError" required />
              <span>
                I agree to the <a href="#" data-policy="terms">Terms of use</a>
                and the <a href="#" data-policy="privacy">Privacy policy</a> of
                Northfield University.
              </span>
            </label>
            <p class="field__error" id="termsError"></p>

            <button type="submit" class="btn btn--primary btn--lg btn--block" id="createBtn">
              <i data-lucide="user-plus"></i> Create account
            </button>
          </form>

          <p class="auth-alt">
            Already have an account?
            <a href="../index.php"><strong>Sign in instead</strong></a>
          </p>
        </div>

        <footer class="auth__panel-foot">
          © 2026 Northfield University · ICT Services · Privacy · Terms
        </footer>
      </section>
    </div>

    <div id="toastRoot" class="toast-root" role="status" aria-live="polite"></div>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/data.js"></script>
    <script src="../js/app.js"></script>
    <script src="../js/auth.js"></script>
  </body>
</html>
