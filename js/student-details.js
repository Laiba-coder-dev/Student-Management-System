/* ==========================================================================
   student-details.js — student profile page rendering & actions
   ========================================================================== */

(function () {
  "use strict";

  if (!window.App || !window.DB) return;

  var id = App.queryParam("id");
  var student = null;

  function shiftDate(iso, days) {
    var d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + days);
    var mm = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  function detailItem(icon, label, value) {
    return (
      '<div class="detail-item"><span class="detail-item__icon"><i data-lucide="' +
      icon +
      '"></i></span><div><div class="detail-item__label">' +
      App.escapeHtml(label) +
      '</div><div class="detail-item__value">' +
      App.escapeHtml(value) +
      "</div></div></div>"
    );
  }

  function academicRow(icon, label, value, badge) {
    return (
      '<div class="academic-row"><div class="academic-row__label"><i data-lucide="' +
      icon +
      '"></i> ' +
      App.escapeHtml(label) +
      '</div><div class="academic-row__value">' +
      (badge || App.escapeHtml(value)) +
      "</div></div>"
    );
  }

  function meter(label, value, pct, tone) {
    return (
      '<div class="meter"><div class="meter__head"><span>' +
      App.escapeHtml(label) +
      "</span><strong>" +
      App.escapeHtml(value) +
      '</strong></div><div class="progress"><div class="progress__fill' +
      (tone ? " progress__fill--" + tone : "") +
      '" data-width="' +
      Math.max(0, Math.min(100, pct)) +
      '%"></div></div></div>'
    );
  }

  function showNotFound() {
    document.getElementById("notFound").classList.remove("d-none");
    var layout = document.getElementById("detailsLayout");
    if (layout) layout.classList.add("d-none");
    var editLink = document.getElementById("editLink");
    if (editLink) editLink.classList.add("is-disabled");
    document.title = "Student not found · EduCore";
    App.toast({
      type: "danger",
      title: "Record not found",
      message: "That student does not exist or was removed."
    });
  }

  function render() {
    if (!student) {
      showNotFound();
      return;
    }

    document.getElementById("detailsLayout").classList.remove("d-none");
    document.title = student.name + " · EduCore Student Management";

    /* Hero */
    var avatar = document.getElementById("heroAvatar");
    avatar.textContent = student.initials;
    avatar.style.background = student.color;
    if (student.photo) {
      avatar.innerHTML = '<img src="' + student.photo + '" alt="' + App.escapeHtml(student.name) + '" />';
    }

    document.getElementById("heroName").textContent = student.name;
    document.getElementById("heroStatus").innerHTML = App.statusBadge(student.status);
    document.getElementById("heroReg").textContent = student.regNo;
    document.getElementById("heroEmail").textContent = student.email;
    document.getElementById("heroPhone").textContent = student.phone;
    document.getElementById("heroDept").textContent = student.department;

    var subtitle = document.getElementById("detailsSubtitle");
    subtitle.textContent =
      student.program +
      " · " +
      student.semester +
      " · Registered " +
      DB.formatDate(student.joined, "long");

    var editLink = document.getElementById("editLink");
    editLink.href = "edit-student.php?id=" + student.id;
    var qaEdit = document.getElementById("qaEdit");
    if (qaEdit) qaEdit.href = "edit-student.php?id=" + student.id;

    /* KPIs */
    document.getElementById("kpiGpa").textContent = student.gpa.toFixed(2);
    document.getElementById("kpiAttendance").textContent = student.attendance + "%";
    document.getElementById("kpiAge").textContent = DB.ageFrom(student.dob);

    /* Personal list */
    document.getElementById("personalList").innerHTML =
      detailItem("mail", "Email address", student.email) +
      detailItem("phone", "Phone number", student.phone) +
      detailItem("users", "Gender", student.gender) +
      detailItem(
        "cake-slice",
        "Date of birth",
        DB.formatDate(student.dob, "long") + " (" + DB.ageFrom(student.dob) + " years)"
      ) +
      detailItem("map-pin", "Residential address", student.address) +
      detailItem(
        "users-round",
        "Guardian contact",
        student.guardian || "Not provided"
      );

    /* Academic list */
    document.getElementById("academicBadge").textContent = student.status;
    document.getElementById("academicList").innerHTML =
      academicRow("badge", "Registration number", student.regNo) +
      academicRow("building-2", "Department", student.department) +
      academicRow("book-open", "Degree programme", student.program) +
      academicRow("calendar-range", "Current semester", student.semester) +
      academicRow("circle-check-big", "Enrolment status", student.status, App.statusBadge(student.status)) +
      academicRow("calendar-plus", "Date of registration", DB.formatDate(student.joined, "long")) +
      academicRow("chart-line", "Cumulative GPA", student.gpa.toFixed(2) + " / 4.00") +
      academicRow("clipboard-check", "Attendance", student.attendance + "%");

    /* Performance meters */
    var semesterNumber = parseInt(student.semester.replace(/\D/g, ""), 10) || 1;
    document.getElementById("performanceList").innerHTML =
      meter("Cumulative GPA", student.gpa.toFixed(2) + " / 4.00", (student.gpa / 4) * 100, student.gpa >= 3.5 ? "success" : "") +
      meter("Attendance", student.attendance + "% target 80%", student.attendance, student.attendance >= 80 ? "" : "warning") +
      meter(
        "Programme progress",
        semesterNumber + " of 8 semesters",
        (semesterNumber / 8) * 100,
        "violet"
      );

    /* Timeline */
    var semesterStart = new Date();
    semesterStart.setDate(semesterStart.getDate() - 45);
    document.getElementById("timeline").innerHTML =
      '<div class="timeline__item"><span class="timeline__dot"></span><div><p>Enrolled at Northfield University</p><time>' +
      DB.formatDate(student.joined, "long") +
      "</time></div></div>" +
      '<div class="timeline__item"><span class="timeline__dot"></span><div><p>Orientation and matriculation completed</p><time>' +
      DB.formatDate(shiftDate(student.joined, 10), "long") +
      "</time></div></div>" +
      '<div class="timeline__item"><span class="timeline__dot"></span><div><p>' +
      App.escapeHtml(student.semester) +
      " courses in progress</p><time>" +
      DB.formatDate(
        semesterStart.getFullYear() +
          "-" +
          (semesterStart.getMonth() + 1 < 10 ? "0" : "") +
          (semesterStart.getMonth() + 1) +
          "-" +
          (semesterStart.getDate() < 10 ? "0" : "") +
          semesterStart.getDate(),
        "long"
      ) +
      "</time></div></div>" +
      '<div class="timeline__item"><span class="timeline__dot"></span><div><p>Next academic advisement window</p><time>' +
      DB.formatDate(shiftDate(todayIso(), 30), "long") +
      "</time></div></div>";

    App.icons(document.getElementById("detailsLayout"));

    App.qsa("[data-width]", document.getElementById("detailsLayout")).forEach(function (bar) {
      bar.style.width = bar.getAttribute("data-width");
    });
  }

  function todayIso() {
    var d = new Date();
    var mm = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  /* ---- Actions --------------------------------------------------------------- */

  function deleteStudent() {
    App.confirmDialog({
      title: "Delete " + student.name + "?",
      desc: "This permanently removes the record from EduCore.",
      icon: "trash-2",
      tone: "danger",
      confirmText: "Delete student",
      confirmClass: "btn--danger",
      body:
        '<div class="alert alert--danger"><i data-lucide="triangle-alert"></i>' +
        '<div class="alert__body"><strong>This action cannot be undone.</strong><br />' +
        "Registration " +
        App.escapeHtml(student.regNo) +
        " and all associated details will be removed.</div></div>",
      onConfirm: function () {
        DB.deleteStudent(student.id).then(async function(result){if(!result.ok){App.toast({type:"danger",title:"Student not deleted",message:result.error});return;}await DB.refreshStudents();App.toast({type:"success",title:"Student deleted",message:student.name+" was removed from the database."});setTimeout(function(){App.go("pages/students.php");},450);});
      }
    });
  }

  function composeEmail() {
    App.openModal({
      title: "Email " + student.name,
      desc: "Send a message to " + student.email + ".",
      icon: "send",
      size: "md",
      body:
        '<div class="field"><label class="field__label" for="mailSubject">Subject <span class="req">*</span></label>' +
        '<input class="input" id="mailSubject" placeholder="Regarding your enrolment" data-label="Subject" required />' +
        '<p class="field__error"></p></div>' +
        '<div class="field mt-4"><label class="field__label" for="mailBody">Message <span class="req">*</span></label>' +
        '<textarea class="textarea" id="mailBody" placeholder="Write your message…" data-label="Message" required></textarea>' +
        '<p class="field__error"></p></div>',
      confirmText: "Send email",
      onConfirm: function (root) {
        var subject = root.querySelector("#mailSubject");
        var body = root.querySelector("#mailBody");
        var e1 = App.validateControl(subject);
        var e2 = App.validateControl(body);
        App.showControlError(subject, e1);
        App.showControlError(body, e2);
        if (e1 || e2) return false;
        App.toast({
          type: "success",
          title: "Message sent",
          message: "“" + subject.value + "” was sent to " + student.email + "."
        });
        return true;
      }
    });
  }

  function requestTranscript() {
    App.confirmDialog({
      title: "Request official transcript?",
      desc: "The registry will prepare a signed copy for " + student.name + ".",
      icon: "file-text",
      confirmText: "Submit request",
      body:
        '<p>Transcripts are usually processed within <strong>2 working days</strong> and delivered to the student email on file:</p>' +
        '<div class="alert alert--info mt-4"><i data-lucide="mail"></i><div class="alert__body">' +
        App.escapeHtml(student.email) +
        "</div></div>",
      onConfirm: function () {
        App.toast({
          type: "success",
          title: "Transcript requested",
          message: "The registry has been notified."
        });
      }
    });
  }

  function duplicateRecord() {
    App.confirmDialog({
      title: "Duplicate this record?",
      desc: "A new draft record will be created with the same details.",
      icon: "copy",
      confirmText: "Create duplicate",
      body:
        "<p>A copy of <strong>" +
        App.escapeHtml(student.name) +
        "</strong> will be created with a new registration number, ready for editing.</p>",
      onConfirm: function () {
        var copy = JSON.parse(JSON.stringify(student));
        var stamp=Date.now();copy.id="s"+stamp;copy.regNo="STU-"+new Date().getFullYear()+"-"+String(stamp).slice(-4);copy.email="copy."+stamp+"@"+DB.DOMAIN;
        copy.name = student.name + " (Copy)";
        copy.joined = todayIso();
        DB.createStudent(copy).then(async function(result){if(!result.ok){App.toast({type:"danger",title:"Duplicate not created",message:result.error});return;}await DB.refreshStudents();App.toast({type:"success",title:"Duplicate created",message:"Opening the new record…"});setTimeout(function(){location.href="edit-student.php?id="+result.student_id;},500);});
      }
    });
  }

  function exportRecord() {
    var rows = [
      ["Field", "Value"],
      ["Registration number", student.regNo],
      ["Full name", student.name],
      ["Email", student.email],
      ["Phone", student.phone],
      ["Gender", student.gender],
      ["Date of birth", student.dob],
      ["Department", student.department],
      ["Programme", student.program],
      ["Semester", student.semester],
      ["Status", student.status],
      ["GPA", student.gpa],
      ["Attendance", student.attendance + "%"],
      ["Address", student.address],
      ["Registered", student.joined]
    ];
    var ok = App.downloadCSV(student.regNo + "-record.csv", rows);
    App.toast(
      ok
        ? { type: "success", title: "Record exported", message: student.regNo + "-record.csv downloaded." }
        : { type: "warning", title: "Export unavailable", message: "Your browser blocked the download." }
    );
  }

  function bindActions() {
    document.getElementById("printBtn").addEventListener("click", function () {
      window.print();
    });

    document.getElementById("exportBtn").addEventListener("click", exportRecord);

    document.querySelectorAll("[data-detail-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-detail-action");
        if (action === "delete") deleteStudent();
        if (action === "email" || action === "message") composeEmail();
        if (action === "transcript") requestTranscript();
        if (action === "duplicate") duplicateRecord();
      });
    });
  }

  async function init() {
    if (!id) {
      showNotFound();
      return;
    }
    try {
      student = await DB.fetchStudent(id);
      render();
      bindActions();
      App.icons();
    } catch (error) {
      if (error.message === "Student not found.") showNotFound();
      else App.toast({ type: "danger", title: "Student details unavailable", message: error.message });
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
