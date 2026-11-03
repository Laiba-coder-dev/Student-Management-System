/* ==========================================================================
   dashboard.js — overview dashboard interactions & visualisations
   ========================================================================== */

(function () {
  "use strict";

  if (!window.App || !window.DB) return;

  var PER_PAGE = 6;
  var state = { page: 1, perPage: PER_PAGE, query: "" };

  var sorted = DB.students.slice().sort(function (a, b) {
    return a.joined < b.joined ? 1 : a.joined > b.joined ? -1 : 0;
  });

  function daysSince(iso) {
    var d = new Date(iso + "T00:00:00").getTime();
    return Math.floor((Date.now() - d) / 86400000);
  }

  /* ---- KPI cards --------------------------------------------------------- */

  function animateNumber(el, target, suffix) {
    if (!el) return;
    var finalText = target.toLocaleString() + (suffix || "");
    var finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      el.textContent = finalText;
    }

    /* Fallback in case animation frames are throttled (background tab). */
    var fallback = setTimeout(finish, 900);

    var duration = 750;
    var start = null;

    function step(now) {
      if (finished) return;
      if (start === null) start = now;
      var progress = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + (suffix || "");
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        clearTimeout(fallback);
        finish();
      }
    }

    requestAnimationFrame(step);
  }

  function renderKpis() {
    var stats = DB.dashboardStats || {};
    var total = Number(stats.students == null ? DB.students.length : stats.students);
    var active = Number(stats.active_students == null ? DB.students.filter(function (s) {
      return s.status === "Active";
    }).length : stats.active_students);
    var recent = Number(stats.recent_registrations == null ? DB.students.filter(function (s) {
      return daysSince(s.joined) <= 7;
    }).length : stats.recent_registrations);
    var users = Number(stats.users == null ? DB.users.length : stats.users);
    var activeUsers = Number(stats.active_users == null ? DB.users.filter(function (u) {
      return u.status === "Active";
    }).length : stats.active_users);
    var departments = DB.departments.length;
    var capacity = 60;

    animateNumber(document.getElementById("kpiTotalStudents"), total);
    animateNumber(document.getElementById("kpiRecent"), recent);
    animateNumber(document.getElementById("kpiUsers"), users);
    animateNumber(document.getElementById("kpiActive"), active);

    var setBar = function (id, pct, color) {
      var bar = document.getElementById(id);
      if (!bar) return;
      if (color) bar.style.background = color;
      bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
    };

    setBar("kpiStudentsBar", (total / capacity) * 100);
    setBar("kpiRecentBar", total ? (recent / total) * 100 : 0, "var(--violet-500)");
    setBar("kpiUsersBar", users ? (activeUsers / users) * 100 : 0, "var(--warning)");
    setBar("kpiActiveBar", total ? (active / total) * 100 : 0, "var(--success)");

    setText(
      "kpiStudentsFoot",
      departments + " departments · " + Math.round((total / capacity) * 100) + "% of intake capacity"
    );
    setText("kpiRecentFoot", recent + " enrolled in the last 7 days");
    setText("kpiUsersFoot", activeUsers + " active of " + users + " staff accounts");
    setText(
      "kpiActiveFoot",
      Math.round(total ? (active / total) * 100 : 0) + "% of all enrolled students"
    );

    var banner = document.getElementById("bannerText");
    if (banner) {
      banner.textContent =
        recent +
        " new students joined this week. Review the latest enrolments or continue managing your student records below.";
    }
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  /* ---- Recent registrations table ---------------------------------------- */

  function filtered() {
    var q = state.query.toLowerCase();
    if (!q) return sorted;
    return sorted.filter(function (s) {
      return (
        s.name.toLowerCase().indexOf(q) > -1 ||
        s.regNo.toLowerCase().indexOf(q) > -1 ||
        s.email.toLowerCase().indexOf(q) > -1 ||
        s.department.toLowerCase().indexOf(q) > -1 ||
        s.program.toLowerCase().indexOf(q) > -1 ||
        s.semester.toLowerCase().indexOf(q) > -1
      );
    });
  }

  function rowMarkup(s) {
    return (
      '<tr data-student="' +
      s.id +
      '" class="is-clickable">' +
      '<td><div class="cell-title">' +
      App.avatarHTML(s) +
      '<div class="cell-title__meta"><strong>' +
      App.escapeHtml(s.name) +
      "</strong><span>" +
      App.escapeHtml(s.email) +
      "</span></div></div></td>" +
      '<td><span class="reg-no">' +
      App.escapeHtml(s.regNo) +
      "</span></td>" +
      "<td>" +
      App.escapeHtml(s.department) +
      "</td>" +
      '<td class="hide-mobile">' +
      App.escapeHtml(s.program) +
      " · " +
      App.escapeHtml(s.semester.replace("Semester ", "S")) +
      "</td>" +
      "<td>" +
      DB.formatDate(s.joined) +
      "</td>" +
      "<td>" +
      App.statusBadge(s.status) +
      "</td>" +
      '<td class="col-actions"><div class="cell-actions">' +
      '<a class="action-btn" href="student-details.php?id=' +
      s.id +
      '" title="View details" aria-label="View ' +
      App.escapeHtml(s.name) +
      '"><i data-lucide="eye"></i></a>' +
      '<a class="action-btn" href="edit-student.php?id=' +
      s.id +
      '" title="Edit student" aria-label="Edit ' +
      App.escapeHtml(s.name) +
      '"><i data-lucide="pencil"></i></a>' +
      "</div></td></tr>"
    );
  }

  function renderTable() {
    var list = filtered();
    var tbody = document.getElementById("dashTableBody");
    var wrap = document.getElementById("dashTableWrap");
    var empty = document.getElementById("dashEmpty");
    var pager = document.getElementById("dashPager");
    if (!tbody) return;

    var total = list.length;
    var pages = Math.max(1, Math.ceil(total / state.perPage));
    state.page = Math.min(state.page, pages);
    var slice = list.slice((state.page - 1) * state.perPage, state.page * state.perPage);

    if (total === 0) {
      wrap.classList.add("d-none");
      empty.classList.remove("d-none");
      pager.hidden = true;
      return;
    }

    wrap.classList.remove("d-none");
    empty.classList.add("d-none");
    pager.hidden = false;
    tbody.innerHTML = slice.map(rowMarkup).join("");
    App.icons(tbody);

    App.renderPagination(
      pager,
      { total: total, page: state.page, perPage: state.perPage },
      function (page, perPage) {
        state.page = page;
        state.perPage = perPage;
        renderTable();
      }
    );
  }

  /* ---- Meters ------------------------------------------------------------ */

  function renderMeters() {
    var deptHost = document.getElementById("deptMeters");
    if (deptHost) {
      var counts = {};
      DB.students.forEach(function (s) {
        counts[s.department] = (counts[s.department] || 0) + 1;
      });
      var top = Object.keys(counts)
        .map(function (name) {
          return { name: name, count: counts[name] };
        })
        .sort(function (a, b) {
          return b.count - a.count;
        })
        .slice(0, 5);
      var max = top.length ? top[0].count : 1;
      var colors = ["", "var(--violet-500)", "var(--success)", "var(--warning)", "var(--info)"];

      deptHost.innerHTML = top
        .map(function (d, i) {
          return (
            '<div class="meter"><div class="meter__head"><span>' +
            App.escapeHtml(d.name) +
            "</span><strong>" +
            d.count +
            " students</strong></div>" +
            '<div class="progress"><div class="progress__fill' +
            (colors[i] ? '" style="background:' + colors[i] : "") +
            '" data-width="' +
            Math.round((d.count / max) * 100) +
            '%"></div></div></div>'
          );
        })
        .join("");

      App.qsa("[data-width]", deptHost).forEach(function (bar) {
        bar.style.width = bar.getAttribute("data-width");
      });
    }

    var statusHost = document.getElementById("statusMeters");
    if (statusHost) {
      var total = DB.students.length;
      var statuses = ["Active", "On Leave", "Inactive"];
      var tone = { Active: "success", "On Leave": "warning", Inactive: "" };
      statusHost.innerHTML = statuses
        .map(function (st) {
          var count = DB.students.filter(function (s) {
            return s.status === st;
          }).length;
          var pct = Math.round((count / total) * 100);
          return (
            '<div class="meter"><div class="meter__head"><span>' +
            st +
            "</span><strong>" +
            count +
            " · " +
            pct +
            "%</strong></div>" +
            '<div class="progress"><div class="progress__fill' +
            (tone[st] ? " progress__fill--" + tone[st] : "") +
            '" data-width="' +
            pct +
            '%"></div></div></div>'
          );
        })
        .join("");

      App.qsa("[data-width]", statusHost).forEach(function (bar) {
        bar.style.width = bar.getAttribute("data-width");
      });
    }
  }

  /* ---- Activity feed ------------------------------------------------------ */

  function renderActivity() {
    var feed = document.getElementById("activityFeed");
    var empty = document.getElementById("activityEmpty");
    if (!feed) return;

    if (!DB.activities.length) {
      feed.classList.add("d-none");
      empty.classList.remove("d-none");
      return;
    }

    feed.classList.remove("d-none");
    empty.classList.add("d-none");
    feed.innerHTML = DB.activities
      .map(function (a) {
        return (
          '<div class="activity" data-activity>' +
          '<span class="activity__marker' +
          (a.type ? " activity__marker--" + a.type : "") +
          '"><i data-lucide="' +
          a.icon +
          '"></i></span>' +
          '<div class="activity__body"><p>' +
          a.text +
          "</p><time>" +
          App.escapeHtml(a.time) +
          "</time></div></div>"
        );
      })
      .join("");
    App.icons(feed);
  }

  /* ---- Page wiring -------------------------------------------------------- */

  function bind() {
    /* Search */
    var search = document.getElementById("dashSearch");
    if (search) {
      search.addEventListener(
        "input",
        App.debounce(function () {
          state.query = search.value.trim();
          state.page = 1;
          renderTable();
        }, 180)
      );
    }

    var clear = document.getElementById("clearDashSearch");
    if (clear) {
      clear.addEventListener("click", function () {
        search.value = "";
        state.query = "";
        state.page = 1;
        renderTable();
        search.focus();
      });
    }

    /* Row navigation */
    var tbody = document.getElementById("dashTableBody");
    if (tbody) {
      tbody.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        var row = e.target.closest("[data-student]");
        if (row) App.go("pages/student-details.php?id=" + row.getAttribute("data-student"));
      });
    }

    /* Refresh */
    var refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        var wrap = document.getElementById("dashTableWrap");
        wrap.classList.add("is-loading");
        refreshBtn.classList.add("is-disabled");
        App.withLoading(refreshBtn, "Refreshing…", 900, function () {
          wrap.classList.remove("is-loading");
          renderKpis();
          renderTable();
          renderMeters();
          App.toast({
            type: "success",
            title: "Dashboard refreshed",
            message: "All metrics are up to date."
          });
        });
      });
    }

    /* Export */
    var exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var rows = [
          ["Reg. Number", "Name", "Email", "Department", "Programme", "Semester", "Status", "Registered"]
        ];
        sorted.forEach(function (s) {
          rows.push([s.regNo, s.name, s.email, s.department, s.program, s.semester, s.status, s.joined]);
        });
        var ok = App.downloadCSV("educore-student-report.csv", rows);
        App.toast(
          ok
            ? { type: "success", title: "Report exported", message: "educore-student-report.csv was downloaded." }
            : { type: "warning", title: "Export unavailable", message: "Your browser blocked the download." }
        );
      });
    }

    /* Quick actions */
    document.querySelectorAll("[data-quick]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var kind = btn.getAttribute("data-quick");

        if (kind === "add") App.go("pages/add-student.php");
        if (kind === "users") App.go("pages/users.php");

        if (kind === "import") {
          App.openModal({
            title: "Import students from CSV",
            desc: "Upload a spreadsheet export from your previous system.",
            icon: "file-up",
            size: "md",
            body:
              '<div class="empty-state" style="padding: var(--space-6) var(--space-2)">' +
              '<img class="empty-state__art" src="images/empty-upload.svg" alt="" style="width: 128px" />' +
              "<p class=\"empty-state__desc\">Drag and drop your <strong>students.csv</strong> file here, " +
              "or choose a file from your computer. Maximum 5 MB.</p>" +
              '<label class="btn btn--soft"><i data-lucide="folder-open"></i> Choose file' +
              '<input type="file" accept=".csv" id="importFile" class="sr-only" /></label></div>',
            confirmText: "Import records",
            onConfirm: function (root) {
              var file = root.querySelector("#importFile");
              if (!file || !file.files.length) {
                App.toast({
                  type: "warning",
                  title: "No file selected",
                  message: "Choose a CSV file before starting the import."
                });
                return false;
              }
              App.toast({
                type: "success",
                title: "Import queued",
                message: file.files[0].name + " will be validated shortly."
              });
              return true;
            }
          });
        }

        if (kind === "notice") {
          App.openModal({
            title: "Broadcast a notice",
            desc: "Every enrolled student will receive this message by email.",
            icon: "megaphone",
            size: "md",
            body:
              '<div class="field"><label class="field__label" for="noticeTitle">Subject <span class="req">*</span></label>' +
              '<input class="input" id="noticeTitle" placeholder="e.g. Semester 6 advisement week" data-label="Subject" required />' +
              '<p class="field__error"></p></div>' +
              '<div class="field mt-4"><label class="field__label" for="noticeBody">Message <span class="req">*</span></label>' +
              '<textarea class="textarea" id="noticeBody" placeholder="Write your announcement…" data-label="Message" required></textarea>' +
              '<p class="field__error"></p></div>',
            confirmText: "Send notice",
            onConfirm: function (root) {
              var subject = root.querySelector("#noticeTitle");
              var message = root.querySelector("#noticeBody");
              var okSubject = App.validateControl(subject);
              var okMessage = App.validateControl(message);
              App.showControlError(subject, okSubject);
              App.showControlError(message, okMessage);
              if (okSubject || okMessage) return false;
              App.toast({
                type: "success",
                title: "Notice broadcast",
                message: "“" + subject.value + "” was sent to all students."
              });
              return true;
            }
          });
        }
      });
    });

    /* Activity feed */
    var clearActivity = document.getElementById("clearActivity");
    if (clearActivity) {
      clearActivity.addEventListener("click", function () {
        var original = DB.activities.slice();
        DB.activities = [];
        renderActivity();
        App.icons();
        App.toast({
          type: "info",
          title: "Activity cleared",
          message: "The activity list is empty for now.",
          duration: 3000
        });
        var restore = document.getElementById("restoreActivity");
        if (restore) {
          restore.addEventListener("click", function () {
            DB.activities = original;
            renderActivity();
            App.toast({ type: "success", title: "Activity restored" });
          });
        }
      });
    }

    var feed = document.getElementById("activityFeed");
    if (feed) {
      feed.addEventListener("click", function (e) {
        var item = e.target.closest("[data-activity]");
        if (!item) return;
        var label = item.querySelector("p").textContent.trim();
        App.toast({ type: "info", title: "Activity detail", message: label });
      });
    }
  }

  function init() {
    renderKpis();
    renderTable();
    renderMeters();
    renderActivity();
    bind();
    App.icons();
  }

  DB.ready.then(function () {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
    } else { init(); }
  }).catch(function (error) {
    if (window.App) App.toast({ type: "danger", title: "Backend unavailable", message: error.message });
  });
})();
