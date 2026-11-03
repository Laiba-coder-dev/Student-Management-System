/* ==========================================================================
   student-form.js — shared logic for the Add Student and Edit Student pages:
   select population, live progress, avatar preview, validation and saving.
   ========================================================================== */

(function () {
  "use strict";

  if (!window.App || !window.DB) return;

  var form = document.getElementById("studentForm");
  if (!form) return;

  var mode = form.getAttribute("data-mode") || "add";
  var studentId = App.queryParam("id");
  var original = null;
  var uploadedImage = null;

  var fields = {
    name: document.getElementById("fName"),
    email: document.getElementById("fEmail"),
    phone: document.getElementById("fPhone"),
    dob: document.getElementById("fDob"),
    address: document.getElementById("fAddress"),
    status: document.getElementById("fStatus"),
    regNo: document.getElementById("fRegNo"),
    department: document.getElementById("fDepartment"),
    program: document.getElementById("fProgram"),
    semester: document.getElementById("fSemester"),
    gpa: document.getElementById("fGpa"),
    guardian: document.getElementById("fGuardian")
  };

  /* ---- Helpers -------------------------------------------------------------- */

  function fillSelect(select, values, placeholder) {
    if (!select) return;
    select.innerHTML =
      '<option value="">' +
      placeholder +
      "</option>" +
      values
        .map(function (v) {
          return '<option value="' + App.escapeHtml(v) + '">' + App.escapeHtml(v) + "</option>";
        })
        .join("");
  }

  function selectedGender() {
    var checked = form.querySelector('input[name="gender"]:checked');
    return checked ? checked.value : "";
  }

  function setGender(value) {
    var radio = form.querySelector('input[name="gender"][value="' + value + '"]');
    if (radio) radio.checked = true;
  }

  function ensureOption(select, value) {
    if (!select || !value) return;
    var exists = Array.prototype.some.call(select.options, function (option) {
      return option.value === value;
    });
    if (!exists) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.add(option);
    }
  }

  function updateAvatar() {
    var preview = document.getElementById("formAvatar");
    if (!preview) return;
    if (uploadedImage) {
      preview.innerHTML = '<img src="' + uploadedImage + '" alt="Profile preview" />';
      preview.style.backgroundImage = "";
      return;
    }
    var value = fields.name.value.trim();
    preview.textContent = value ? DB.initials(value) : "NS";
    preview.style.backgroundImage = "";
  }

  function updateProgress() {
    var required = [];
    var seen = {};
    App.qsa("[required]", form).forEach(function (control) {
      if (control.type === "radio") {
        if (seen[control.name]) return;
        seen[control.name] = true;
      }
      required.push(control);
    });

    var filled = required.filter(function (control) {
      if (control.type === "radio") {
        return Boolean(form.querySelector('input[name="' + control.name + '"]:checked'));
      }
      if (control.type === "checkbox") return control.checked;
      return (control.value || "").trim() !== "";
    }).length;

    var pct = required.length ? Math.round((filled / required.length) * 100) : 0;
    var label = document.getElementById("progressLabel");
    var bar = document.getElementById("progressBar");
    if (label) label.textContent = pct + "%";
    if (bar) bar.style.width = pct + "%";
    if (bar) {
      bar.style.background =
        pct === 100 ? "var(--success)" : pct >= 60 ? "var(--brand-500)" : "var(--warning)";
    }
  }

  /* ---- Edit mode: load the record ------------------------------------------- */

  function showNotFound() {
    var notFound = document.getElementById("notFound");
    var layout = document.getElementById("editLayout");
    if (notFound) notFound.classList.remove("d-none");
    if (layout) layout.classList.add("d-none");
    App.toast({
      type: "danger",
      title: "Record unavailable",
      message: "That student could not be found."
    });
  }

  function loadStudent() {
    original = DB.getStudent(studentId);
    if (!original) {
      showNotFound();
      return false;
    }

    fields.name.value = original.name;
    fields.email.value = original.email;
    fields.phone.value = original.phone;
    fields.dob.value = original.dob;
    fields.address.value = original.address;
    ensureOption(fields.status, original.status);
    fields.status.value = original.status;
    fields.regNo.value = original.regNo;
    fields.department.value = original.department;
    ensureOption(fields.program, original.program);
    fields.program.value = original.program;
    fields.semester.value = original.semester;
    fields.gpa.value = original.gpa;
    fields.guardian.value = original.guardian || "";
    setGender(original.gender);
    fields.regNo.setAttribute("data-unique-ignore", original.regNo);

    var subtitle = document.getElementById("editSubtitle");
    if (subtitle) {
      subtitle.textContent =
        "Editing " + original.name + " (" + original.regNo + ") — updates are applied immediately after saving.";
    }

    var detailsLink = document.getElementById("viewDetailsLink");
    if (detailsLink) detailsLink.href = "student-details.php?id=" + original.id;

    var history = document.getElementById("recordHistory");
    if (history) {
      history.innerHTML =
        '<div class="detail-item"><span class="detail-item__icon"><i data-lucide="calendar-plus"></i></span><div><div class="detail-item__label">Registered</div><div class="detail-item__value">' +
        DB.formatDate(original.joined, "long") +
        "</div></div></div>" +
        '<div class="detail-item"><span class="detail-item__icon"><i data-lucide="badge-check"></i></span><div><div class="detail-item__label">Current status</div><div class="detail-item__value">' +
        App.escapeHtml(original.status) +
        "</div></div></div>" +
        '<div class="detail-item"><span class="detail-item__icon"><i data-lucide="chart-line"></i></span><div><div class="detail-item__label">GPA / attendance</div><div class="detail-item__value">' +
        original.gpa.toFixed(2) +
        " · " +
        original.attendance +
        "%</div></div></div>";
      App.icons(history);
    }

    document.title = "Edit " + original.name + " · EduCore";
    return true;
  }

  /* ---- Saving ---------------------------------------------------------------- */

  function collectValues() {
    return {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      gender: selectedGender(),
      dob: fields.dob.value,
      address: fields.address.value.trim(),
      status: fields.status.value,
      regNo: fields.regNo.value.trim().toUpperCase(),
      department: fields.department.value,
      program: fields.program.value,
      semester: fields.semester.value,
      gpa: fields.gpa.value === "" ? null : parseFloat(fields.gpa.value),
      guardian: fields.guardian.value.trim()
    };
  }

  function todayIso() {
    var d = new Date();
    var mm = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  async function save(event) {
    event.preventDefault();
    if (!App.validateForm(form)) { App.toast({ type: "danger", title: "Please review the form", message: "Some required fields are missing or invalid." }); return; }
    var values=collectValues(), button=document.getElementById("saveStudentBtn"), payload=Object.assign({},values);
    if(mode==="edit"&&original)payload.id=original.id;
    if(mode==="add")payload.password=document.getElementById("fPassword").value;
    button.disabled=true;button.classList.add("is-loading");
    try {
      var response=mode==="add"?await DB.createStudent(payload):await DB.updateStudent(payload);
      if(!response.ok)throw new Error(response.error||"Student record could not be saved.");
      await DB.refreshStudents();
      var saved=mode==="add"?DB.getStudent(response.student_id):DB.getStudent(original.id);
      if(!saved)throw new Error("The saved student could not be reloaded.");
      if(mode==="add"){
        App.openModal({title:"Student added successfully",desc:saved.name+" is now enrolled as "+saved.regNo+".",icon:"circle-check-big",tone:"success",body:'<div class="review-grid"><div><dt>Department</dt><dd>'+App.escapeHtml(saved.department)+'</dd></div><div><dt>Programme</dt><dd>'+App.escapeHtml(saved.program)+'</dd></div><div><dt>Semester</dt><dd>'+App.escapeHtml(saved.semester)+'</dd></div><div><dt>Status</dt><dd>'+App.escapeHtml(saved.status)+'</dd></div></div>',cancelText:"Add another",confirmText:"View student details",onConfirm:function(){setTimeout(function(){location.href="student-details.php?id="+saved.id;},300);},onOpen:function(root){var cancel=root.querySelector("[data-modal-close]");if(cancel)cancel.addEventListener("click",function(){resetForm();setTimeout(function(){fields.name.focus();},250);});}});
      } else {
        original=saved;loadStudent();
        App.openModal({title:"Changes saved",desc:"The database record and linked student login for "+saved.name+" have been updated.",icon:"circle-check-big",tone:"success",cancelText:"Keep editing",confirmText:"Back to students",onConfirm:function(){setTimeout(function(){location.href="students.php";},250);}});
      }
      App.toast({type:"success",title:mode==="add"?"Record created":"Student updated",message:mode==="add"?saved.name+" was added to the student list.":"Changes to "+saved.name+" were saved."});
    } catch(error) { App.toast({type:"danger",title:"Student not saved",message:error.message}); }
    finally { button.disabled=false;button.classList.remove("is-loading"); }
  }
  /* ---- Reset ------------------------------------------------------------------ */

  function resetForm() {
    if (mode === "edit" && original) {
      App.qsa("input, select, textarea", form).forEach(function (control) {
        if (control.type === "radio" || control.type === "checkbox") {
          control.checked = control.value === original[control.name];
        } else if (control.name && original[control.name] !== undefined) {
          control.value = original[control.name];
        } else {
          control.value = "";
        }
      });
      setGender(original.gender);
      App.toast({ type: "info", title: "Changes discarded", message: "The form was restored." });
    } else {
      form.reset();
      App.qsa(".field", form).forEach(function (f) {
        f.classList.remove("is-invalid", "is-valid");
      });
      App.toast({ type: "info", title: "Form cleared", message: "You can start over." });
    }
    uploadedImage = null;
    updateAvatar();
    updateProgress();
  }

  function confirmReset() {
    App.confirmDialog({
      title: mode === "edit" ? "Discard your changes?" : "Clear the entire form?",
      desc:
        mode === "edit"
          ? "Every edit you made will be reverted to the saved record."
          : "All entered values will be removed.",
      icon: "rotate-ccw",
      confirmText: mode === "edit" ? "Discard changes" : "Clear form",
      onConfirm: resetForm
    });
  }

  /* ---- Wiring ------------------------------------------------------------------ */

  function init() {
    fillSelect(fields.department, DB.departments, "Select department");
    fillSelect(fields.program, DB.programs, "Select programme");
    fillSelect(fields.semester, DB.semesters, "Select semester");

    if (mode === "edit") {
      if (!loadStudent()) return;
      document.getElementById("editLayout").classList.remove("d-none");
      document.getElementById("notFound").classList.add("d-none");
    }

    App.initLiveValidation(form);
    updateAvatar();
    updateProgress();

    form.addEventListener("submit", save);

    fields.name.addEventListener("input", function () {
      updateAvatar();
      updateProgress();
    });

    form.addEventListener("input", updateProgress);
    form.addEventListener("change", updateProgress);

    var resetBtn = document.getElementById("resetFormBtn");
    if (resetBtn) resetBtn.addEventListener("click", confirmReset);

    /* Avatar upload */
    var avatarInput = document.getElementById("avatarInput");
    if (avatarInput) {
      avatarInput.addEventListener("change", function () {
        var file = avatarInput.files && avatarInput.files[0];
        if (!file) return;
        if (!/^image\//.test(file.type)) {
          App.toast({ type: "danger", title: "Unsupported file", message: "Please choose an image." });
          avatarInput.value = "";
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          App.toast({ type: "warning", title: "File too large", message: "Maximum size is 2 MB." });
          avatarInput.value = "";
          return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
          uploadedImage = e.target.result;
          updateAvatar();
          App.toast({ type: "success", title: "Photo attached", message: file.name + " is ready to save." });
        };
        reader.readAsDataURL(file);
      });
    }

    var avatarRemove = document.getElementById("avatarRemove");
    if (avatarRemove) {
      avatarRemove.addEventListener("click", function () {
        uploadedImage = null;
        if (avatarInput) avatarInput.value = "";
        updateAvatar();
        App.toast({ type: "info", title: "Photo removed", message: "Initials will be used instead." });
      });
    }
  }

  DB.ready.then(function () {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
    } else { init(); }
  }).catch(function (error) {
    if (window.App) App.toast({ type: "danger", title: "Backend unavailable", message: error.message });
  });
})();
