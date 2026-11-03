<?php require_once __DIR__.'/../includes/bootstrap.php'; page_guard(true); ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Manage your EduCore administrator profile and preferences." />
    <title>Profile Settings · EduCore Student Management</title>
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
    data-page="profile"
    data-title="Profile Settings"
    data-section="Account"
  >
    <main class="main">
      <div class="page">
        <div class="page-head">
          <div>
            <h1 class="page-head__title">Profile Settings</h1>
            <p class="page-head__subtitle">
              Keep your personal details, security and notification preferences
              up to date.
            </p>
          </div>
          <div class="page-head__actions">
            <button type="button" class="btn" id="signOutAll">
              <i data-lucide="log-out"></i> Sign out everywhere
            </button>
          </div>
        </div>

        <div class="profile-layout">
          <!-- Profile card -->
          <aside class="profile-side">
            <section class="card profile-card">
              <div class="profile-card__avatar">
                <span class="avatar avatar--xl" id="profileAvatar">OB</span>
                <label class="profile-card__camera" for="profilePhoto" title="Change photo">
                  <i data-lucide="camera"></i>
                  <input type="file" accept="image/*" id="profilePhoto" class="sr-only" />
                </label>
              </div>
              <h3 id="profileName">Olivia Bennett</h3>
              <p class="role-line" id="profileRole">Administrator · Northfield University</p>

              <div class="d-flex gap-2 justify-center mt-4">
                <label class="btn btn--soft btn--sm">
                  <i data-lucide="upload"></i> Change photo
                </label>
                <button type="button" class="btn btn--ghost btn--sm" id="removePhoto">
                  <i data-lucide="trash-2"></i> Remove
                </button>
              </div>

              <div class="profile-card__meta">
                <div><span>Email</span><strong id="profileEmail">olivia.bennett@northfield.edu</strong></div>
                <div><span>Staff ID</span><strong>NF-0042</strong></div>
                <div><span>Member since</span><strong id="profileSince">Feb 2023</strong></div>
                <div><span>Last login</span><strong>Today, 09:41</strong></div>
              </div>
            </section>

            <section class="card">
              <div class="card__header card__header--plain">
                <div>
                  <h2 class="card__title"><i data-lucide="circle-gauge"></i> Profile strength</h2>
                </div>
              </div>
              <div class="card__body">
                <div class="form-progress">
                  <div class="form-progress__head">
                    <span>Completion</span>
                    <strong id="strengthLabel">85%</strong>
                  </div>
                  <div class="progress">
                    <div class="progress__fill progress__fill--success" id="strengthBar" style="width: 85%"></div>
                  </div>
                  <p class="text-xs text-muted">
                    Add a phone number and bio to reach 100%.
                  </p>
                </div>
              </div>
            </section>
          </aside>

          <!-- Settings -->
          <section class="card">
            <div class="card__header">
              <div class="tabs" role="tablist" aria-label="Profile sections">
                <button type="button" class="tab is-active" data-tab="account" role="tab" aria-selected="true">
                  <i data-lucide="user-round"></i> Account
                </button>
                <button type="button" class="tab" data-tab="security" role="tab" aria-selected="false">
                  <i data-lucide="lock-keyhole"></i> Security
                </button>
                <button type="button" class="tab" data-tab="notifications" role="tab" aria-selected="false">
                  <i data-lucide="bell"></i> Notifications
                </button>
              </div>
            </div>

            <!-- Account tab -->
            <div class="card__body tab-panel is-active" id="tab-account" role="tabpanel">
              <form id="accountForm" novalidate>
                <div class="settings-section">
                  <div class="settings-section__head">
                    <span class="form-section__icon"><i data-lucide="contact"></i></span>
                    <div>
                      <h3>Personal information</h3>
                      <p>Visible to other administrators in the staff directory.</p>
                    </div>
                  </div>

                  <div class="form-grid">
                    <div class="field">
                      <label class="field__label" for="pName">Full name <span class="req">*</span></label>
                      <input class="input" type="text" id="pName" name="name" data-label="Full name" minlength="3" required />
                      <p class="field__error"></p>
                    </div>
                    <div class="field">
                      <label class="field__label" for="pEmail">Email address <span class="req">*</span></label>
                      <input class="input" type="email" id="pEmail" name="email" data-label="Email address" required />
                      <p class="field__error"></p>
                    </div>
                    <div class="field">
                      <label class="field__label" for="pPhone">Phone number</label>
                      <input class="input" type="tel" id="pPhone" name="phone" placeholder="+1 555 010 1000" data-label="Phone number" />
                      <p class="field__error"></p>
                    </div>
                    <div class="field">
                      <label class="field__label" for="pDepartment">Department</label>
                      <select class="select" id="pDepartment" name="department"></select>
                      <p class="field__error"></p>
                    </div>
                    <div class="field span-2">
                      <label class="field__label" for="pBio">Short bio</label>
                      <textarea
                        class="textarea"
                        id="pBio"
                        name="bio"
                        maxlength="240"
                        placeholder="Tell your colleagues a little about your role…"
                        data-label="Bio"
                      ></textarea>
                      <p class="field__hint"><span id="bioCount">0</span>/240 characters</p>
                      <p class="field__error"></p>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn--primary" id="saveAccount">
                    <i data-lucide="check"></i> Save changes
                  </button>
                  <button type="button" class="btn" id="cancelAccount">
                    <i data-lucide="x"></i> Cancel
                  </button>
                </div>
              </form>
            </div>

            <!-- Security tab -->
            <div class="card__body tab-panel" id="tab-security" role="tabpanel">
              <form id="passwordForm" novalidate>
                <div class="settings-section">
                  <div class="settings-section__head">
                    <span class="form-section__icon"><i data-lucide="key-round"></i></span>
                    <div>
                      <h3>Change password</h3>
                      <p>Use at least 8 characters with upper and lower case letters.</p>
                    </div>
                  </div>

                  <div class="form-grid">
                    <div class="field span-2">
                      <label class="field__label" for="currentPassword"
                        >Current password <span class="req">*</span></label
                      >
                      <div class="input-icon input-icon--trailing">
                        <i data-lucide="lock-keyhole"></i>
                        <input
                          class="input"
                          type="password"
                          id="currentPassword"
                          data-label="Current password"
                          autocomplete="current-password"
                          required
                        />
                        <button type="button" class="input-action" data-toggle-password="#currentPassword" aria-label="Show password">
                          <i data-lucide="eye"></i>
                        </button>
                      </div>
                      <p class="field__error"></p>
                    </div>
                    <div class="field">
                      <label class="field__label" for="newPassword"
                        >New password <span class="req">*</span></label
                      >
                      <div class="input-icon input-icon--trailing">
                        <i data-lucide="shield-check"></i>
                        <input
                          class="input"
                          type="password"
                          id="newPassword"
                          data-label="New password"
                          minlength="8"
                          autocomplete="new-password"
                          required
                        />
                        <button type="button" class="input-action" data-toggle-password="#newPassword" aria-label="Show password">
                          <i data-lucide="eye"></i>
                        </button>
                      </div>
                      <p class="field__error"></p>
                    </div>
                    <div class="field">
                      <label class="field__label" for="confirmPassword"
                        >Confirm new password <span class="req">*</span></label
                      >
                      <div class="input-icon input-icon--trailing">
                        <i data-lucide="shield-check"></i>
                        <input
                          class="input"
                          type="password"
                          id="confirmPassword"
                          data-label="Confirm password"
                          data-match="#newPassword"
                          data-match-msg="Passwords do not match."
                          autocomplete="new-password"
                          required
                        />
                        <button type="button" class="input-action" data-toggle-password="#confirmPassword" aria-label="Show password">
                          <i data-lucide="eye"></i>
                        </button>
                      </div>
                      <p class="field__error"></p>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn--primary" id="savePassword">
                    <i data-lucide="key-round"></i> Update password
                  </button>
                </div>
              </form>

              <div class="settings-section">
                <div class="settings-section__head">
                  <span class="form-section__icon"><i data-lucide="fingerprint"></i></span>
                  <div>
                    <h3>Account protection</h3>
                    <p>Extra layers of security for your administrator account.</p>
                  </div>
                </div>

                <div class="switch-line">
                  <div class="switch-line__text">
                    <strong>Two-factor authentication</strong>
                    <span>Require a one-time code when signing in from a new device.</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" id="toggle2fa" checked data-switch-label="Two-factor authentication" />
                    <span></span>
                  </label>
                </div>

                <div class="switch-line">
                  <div class="switch-line__text">
                    <strong>Login alerts</strong>
                    <span>Email me when my account is accessed from an unknown location.</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" id="toggleAlerts" checked data-switch-label="Login alerts" />
                    <span></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Notifications tab -->
            <div class="card__body tab-panel" id="tab-notifications" role="tabpanel">
              <div class="settings-section">
                <div class="settings-section__head">
                  <span class="form-section__icon"><i data-lucide="bell-ring"></i></span>
                  <div>
                    <h3>Email notifications</h3>
                    <p>Choose which updates land in your inbox.</p>
                  </div>
                </div>

                <div class="switch-line">
                  <div class="switch-line__text">
                    <strong>New student registrations</strong>
                    <span>Get notified whenever a student is enrolled.</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" checked data-switch-label="New student registrations" />
                    <span></span>
                  </label>
                </div>

                <div class="switch-line">
                  <div class="switch-line__text">
                    <strong>Weekly digest</strong>
                    <span>A Monday summary of enrolment and attendance.</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" checked data-switch-label="Weekly digest" />
                    <span></span>
                  </label>
                </div>

                <div class="switch-line">
                  <div class="switch-line__text">
                    <strong>Attendance warnings</strong>
                    <span>Alerts when a student drops below 70% attendance.</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" checked data-switch-label="Attendance warnings" />
                    <span></span>
                  </label>
                </div>

                <div class="switch-line">
                  <div class="switch-line__text">
                    <strong>Product updates</strong>
                    <span>Occasional news about new EduCore features.</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" data-switch-label="Product updates" />
                    <span></span>
                  </label>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn--primary" id="savePrefs">
                  <i data-lucide="check"></i> Save preferences
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/data.js"></script>
    <script src="../js/app.js"></script>
    <script src="../js/profile.js"></script>
  </body>
</html>
