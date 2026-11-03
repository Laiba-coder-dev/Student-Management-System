<?php require_once __DIR__.'/../includes/bootstrap.php'; page_guard(true); ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Create a new student record in EduCore." />
    <title>Add Student · EduCore Student Management</title>
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
    data-page="add-student"
    data-title="Add Student"
    data-section="Students"
  >
    <main class="main">
      <div class="page">
        <!-- Page header -->
        <div class="page-head">
          <div>
            <h1 class="page-head__title">Add Student</h1>
            <p class="page-head__subtitle">
              Complete the form below to enrol a new student. Fields marked with
              an asterisk are required.
            </p>
          </div>
          <div class="page-head__actions">
            <a class="btn" href="students.php"><i data-lucide="arrow-left"></i> Back to list</a>
          </div>
        </div>

        <div class="form-layout">
          <!-- Main form -->
          <form class="card" id="studentForm" data-mode="add" novalidate>
            <div class="card__body">
              <!-- Personal information -->
              <section class="form-section">
                <div class="form-section__head">
                  <span class="form-section__icon"><i data-lucide="user-round"></i></span>
                  <div>
                    <p class="form-section__title">Personal information</p>
                    <p class="form-section__desc">
                      Identity and contact details for the new student.
                    </p>
                  </div>
                </div>

                <div class="form-grid">
                  <div class="field span-2">
                    <label class="field__label" for="fName"
                      >Full name <span class="req">*</span></label
                    >
                    <input
                      class="input"
                      type="text"
                      id="fName"
                      name="name"
                      placeholder="e.g. Jordan Avery"
                      data-label="Full name"
                      minlength="3"
                      autocomplete="name"
                      required
                    />
                    <p class="field__error"></p>
                  </div>

                  <div class="field">
                    <label class="field__label" for="fEmail"
                      >Email address <span class="req">*</span></label
                    >
                    <div class="input-icon input-icon--trailing">
                      <i data-lucide="mail"></i>
                      <input
                        class="input"
                        type="email"
                        id="fEmail"
                        name="email"
                        placeholder="student@northfield.edu"
                        data-label="Email address"
                        required
                      />
                      <span class="input-action" aria-hidden="true"
                        ><i data-lucide="at-sign"></i
                      ></span>
                    </div>
                    <p class="field__error"></p>
                  </div>

                  <div class="field">
                    <label class="field__label" for="fPhone"
                      >Phone number <span class="req">*</span></label
                    >
                    <div class="input-icon">
                      <i data-lucide="phone"></i>
                      <input
                        class="input"
                        type="tel"
                        id="fPhone"
                        name="phone"
                        placeholder="+1 555 010 2233"
                        data-label="Phone number"
                        required
                      />
                    </div>
                    <p class="field__error"></p>
                  </div>

                  <div class="field span-2">
                    <label class="field__label" for="fPassword">Temporary student password <span class="req">*</span></label>
                    <input class="input" type="password" id="fPassword" minlength="10" maxlength="200" autocomplete="new-password" data-label="Temporary password" required />
                    <p class="field__hint">Share this login credential with the student securely. The password is stored as a one-way hash.</p>
                    <p class="field__error"></p>
                  </div>

                  <div class="field span-2">
                    <span class="field__label">Gender <span class="req">*</span></span>
                    <div class="choice-group" role="radiogroup" aria-label="Gender">
                      <label class="choice">
                        <input type="radio" name="gender" value="Female" data-label="Gender" required />
                        <span><i data-lucide="user-round"></i> Female</span>
                      </label>
                      <label class="choice">
                        <input type="radio" name="gender" value="Male" data-label="Gender" required />
                        <span><i data-lucide="user-round"></i> Male</span>
                      </label>
                      <label class="choice">
                        <input type="radio" name="gender" value="Other" data-label="Gender" required />
                        <span><i data-lucide="users-round"></i> Other</span>
                      </label>
                    </div>
                    <p class="field__error" id="genderError"></p>
                  </div>

                  <div class="field">
                    <label class="field__label" for="fDob"
                      >Date of birth <span class="req">*</span></label
                    >
                    <div class="input-icon">
                      <i data-lucide="calendar-days"></i>
                      <input
                        class="input"
                        type="date"
                        id="fDob"
                        name="dob"
                        data-label="Date of birth"
                        data-not-future
                        data-min-age="16"
                        required
                      />
                    </div>
                    <p class="field__hint">Students must be at least 16 years old.</p>
                    <p class="field__error"></p>
                  </div>

                  <div class="field">
                    <label class="field__label" for="fStatus">Enrolment status</label>
                    <select class="select" id="fStatus" name="status">
                      <option>Active</option>
                      <option>On Leave</option>
                      <option>Inactive</option>
                    </select>
                    <p class="field__error"></p>
                  </div>

                  <div class="field span-2">
                    <label class="field__label" for="fAddress"
                      >Residential address <span class="req">*</span></label
                    >
                    <textarea
                      class="textarea"
                      id="fAddress"
                      name="address"
                      placeholder="Street, city, country"
                      data-label="Address"
                      minlength="6"
                      required
                    ></textarea>
                    <p class="field__error"></p>
                  </div>
                </div>
              </section>

              <!-- Academic information -->
              <section class="form-section">
                <div class="form-section__head">
                  <span class="form-section__icon"><i data-lucide="graduation-cap"></i></span>
                  <div>
                    <p class="form-section__title">Academic information</p>
                    <p class="form-section__desc">
                      Registration number, department, programme and semester.
                    </p>
                  </div>
                </div>

                <div class="form-grid form-grid--3">
                  <div class="field">
                    <label class="field__label" for="fRegNo"
                      >Registration number <span class="req">*</span></label
                    >
                    <input
                      class="input"
                      type="text"
                      id="fRegNo"
                      name="regNo"
                      placeholder="STU-2026-1042"
                      data-label="Registration number"
                      data-unique-reg
                      data-pattern-msg="Use the format STU-YYYY-NNNN."
                      pattern="^STU-\d{4}-\d{4}$"
                      required
                    />
                    <p class="field__hint">Format: STU-YYYY-NNNN</p>
                    <p class="field__error"></p>
                  </div>

                  <div class="field">
                    <label class="field__label" for="fDepartment"
                      >Department <span class="req">*</span></label
                    >
                    <select class="select" id="fDepartment" name="department" data-label="Department" required></select>
                    <p class="field__error"></p>
                  </div>

                  <div class="field">
                    <label class="field__label" for="fProgram"
                      >Degree programme <span class="req">*</span></label
                    >
                    <select class="select" id="fProgram" name="program" data-label="Degree programme" required></select>
                    <p class="field__error"></p>
                  </div>

                  <div class="field">
                    <label class="field__label" for="fSemester"
                      >Semester <span class="req">*</span></label
                    >
                    <select class="select" id="fSemester" name="semester" data-label="Semester" required></select>
                    <p class="field__error"></p>
                  </div>

                  <div class="field">
                    <label class="field__label" for="fGpa">Entry GPA</label>
                    <input
                      class="input"
                      type="number"
                      id="fGpa"
                      name="gpa"
                      min="0"
                      max="4"
                      step="0.01"
                      placeholder="3.50"
                      data-label="Entry GPA"
                    />
                    <p class="field__hint">Optional, on a 4.00 scale.</p>
                    <p class="field__error"></p>
                  </div>

                  <div class="field">
                    <label class="field__label" for="fGuardian">Guardian contact</label>
                    <input
                      class="input"
                      type="tel"
                      id="fGuardian"
                      name="guardian"
                      placeholder="+1 555 010 4477"
                      data-label="Guardian contact"
                    />
                    <p class="field__error"></p>
                  </div>
                </div>
              </section>
            </div>

            <div class="card__footer">
              <div class="form-actions" style="margin: 0; padding: 0; border: 0">
                <button type="submit" class="btn btn--primary btn--lg" id="saveStudentBtn">
                  <i data-lucide="check"></i> Save student
                </button>
                <button type="button" class="btn btn--lg" id="resetFormBtn">
                  <i data-lucide="rotate-ccw"></i> Clear form
                </button>
                <a class="btn btn--ghost btn--lg ms-auto" href="students.php">Cancel</a>
              </div>
            </div>
          </form>

          <!-- Sidebar -->
          <aside class="form-aside">
            <section class="card">
              <div class="card__body">
                <div class="photo-upload">
                  <span class="photo-upload__preview" id="formAvatar">NS</span>
                  <div class="photo-upload__actions">
                    <p class="text-sm fw-semibold">Profile picture</p>
                    <p class="text-xs text-muted">JPG or PNG, up to 2 MB.</p>
                    <label class="btn btn--soft btn--sm">
                      <i data-lucide="upload"></i> Upload
                      <input type="file" accept="image/*" id="avatarInput" class="sr-only" />
                    </label>
                    <button type="button" class="btn btn--ghost btn--sm" id="avatarRemove">
                      <i data-lucide="trash-2"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section class="card">
              <div class="card__header card__header--plain">
                <div>
                  <h2 class="card__title"><i data-lucide="circle-gauge"></i> Form progress</h2>
                  <p class="card__subtitle">Required fields completed.</p>
                </div>
              </div>
              <div class="card__body">
                <div class="form-progress">
                  <div class="form-progress__head">
                    <span>Completion</span>
                    <strong id="progressLabel">0%</strong>
                  </div>
                  <div class="progress">
                    <div class="progress__fill" id="progressBar" style="width: 0%"></div>
                  </div>
                </div>
              </div>
            </section>

            <section class="card">
              <div class="card__header card__header--plain">
                <div>
                  <h2 class="card__title"><i data-lucide="lightbulb"></i> Good to know</h2>
                </div>
              </div>
              <div class="card__body">
                <ul class="tip-list">
                  <li><i data-lucide="check-circle-2"></i> Registration numbers must be unique across the university.</li>
                  <li><i data-lucide="check-circle-2"></i> The student email will be used for portal notifications.</li>
                  <li><i data-lucide="check-circle-2"></i> Semester and programme can be changed later from the record page.</li>
                  <li><i data-lucide="check-circle-2"></i> Saved records appear in the student list immediately.</li>
                </ul>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="../js/data.js"></script>
    <script src="../js/app.js"></script>
    <script src="../js/student-form.js"></script>
  </body>
</html>
