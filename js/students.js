/* ==========================================================================
   students.js — student records table: search, filters, sorting, selection,
   pagination, export and delete confirmations.
   ========================================================================== */

(function () {
  "use strict";

  if (!window.App || !window.DB) return;

  var state = {
    query: "",
    department: "",
    program: "",
    semester: "",
    status: "",
    sortKey: "joined",
    sortDir: "desc",
    page: 1,
    perPage: 10,
    selected: {}
  };

  /* ---- Filtering & sorting ------------------------------------------------ */

  function selectedCount() {
    return Object.keys(state.selected).length;
  }

  function getFiltered() {
    var q = state.query.toLowerCase();
    var list = DB.students.filter(function (s) {
      var matchesQuery =
        !q ||
        s.name.toLowerCase().indexOf(q) > -1 ||
        s.regNo.toLowerCase().indexOf(q) > -1 ||
        s.email.toLowerCase().indexOf(q) > -1 ||
        s.phone.replace(/\s/g, "").indexOf(q.replace(/\s/g, "")) > -1 ||
        s.department.toLowerCase().indexOf(q) > -1;

      return (
        matchesQuery &&
        (!state.department || s.department === state.department) &&
        (!state.program || s.program === state.program) &&
        (!state.semester || s.semester === state.semester) &&
        (!state.status || s.status === state.status)
      );
    });

    var key = state.sortKey;
    var dir = state.sortDir === "asc" ? 1 : -1;

    list.sort(function (a, b) {
      var av = a[key];
      var bv = b[key];
      if (key === "semester") {
        av = parseInt(String(av).replace(/\D/g, ""), 10) || 0;
        bv = parseInt(String(bv).replace(/\D/g, ""), 10) || 0;
        return (av - bv) * dir;
      }
      if (typeof av === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });

    return list;
  }

  /* ---- Rendering ----------------------------------------------------------- */

  function rowMarkup(s) {
    var checked = state.selected[s.id] ? " checked" : "";
    var canManage = App.currentUser().role === "Administrator";
    return (
      '<tr data-student="' +
      s.id +
      '">' +
      '<td class="col-check"><input type="checkbox" data-select="' +
      s.id +
      '" aria-label="Select ' +
      App.escapeHtml(s.name) +
      '"' +
      checked +
      " /></td>" +
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
      "<td>" +
      App.escapeHtml(s.program) +
      "</td>" +
      '<td class="hide-mobile"><span class="badge badge--brand">' +
      App.escapeHtml(s.semester) +
      "</span></td>" +
      '<td class="hide-mobile">' +
      DB.formatDate(s.joined) +
      "</td>" +
      '<td class="col-actions"><div class="cell-actions">' +
      '<a class="action-btn" href="student-details.php?id=' +
      s.id +
      '" title="View details" aria-label="View details"><i data-lucide="eye"></i></a>' +
      (canManage ? '<a class="action-btn" href="edit-student.php?id=' + s.id + '" title="Edit student" aria-label="Edit student"><i data-lucide="pencil"></i></a>' +
      '<button type="button" class="action-btn action-btn--danger" data-delete="' + s.id + '" title="Delete student" aria-label="Delete student"><i data-lucide="trash-2"></i></button>' : '') +
      "</div></td></tr>"
    );
  }

  function render() {
    var list = getFiltered();
    var total = list.length;
    var totalPages = Math.max(1, Math.ceil(total / state.perPage));
    if (state.page > totalPages) state.page = totalPages;

    var slice = list.slice((state.page - 1) * state.perPage, state.page * state.perPage);
    var tbody = document.getElementById("studentTableBody");
    var empty = document.getElementById("studentsEmpty");
    var pager = document.getElementById("studentPager");
    var scroll = document.querySelector(".table-scroll");

    tbody.innerHTML = slice.map(rowMarkup).join("");
    App.icons(tbody);

    var hasRows = total > 0;
    scroll.classList.toggle("d-none", !hasRows);
    empty.classList.toggle("d-none", hasRows);

    var hasFilters =
      state.query || state.department || state.program || state.semester || state.status;
    var emptyDesc = document.getElementById("emptyDesc");
    if (emptyDesc) {
      emptyDesc.textContent = hasFilters
        ? "No records match your current search and filters. Adjust the criteria or reset the view."
        : "There are no student records yet. Add your first student to get started.";
    }

    var meta = document.getElementById("resultMeta");
    if (meta) {
      meta.innerHTML =
        "<strong>" + total + "</strong> of <strong>" + DB.students.length + "</strong> students";
    }

    App.renderPagination(
      pager,
      { total: total, page: state.page, perPage: state.perPage },
      function (page, perPage) {
        state.page = page;
        state.perPage = perPage;
        render();
        pager.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    );

    pager.classList.toggle("d-none", !hasRows);

    syncHeaderCheckbox(slice);
    renderBulkBar();
  }

  function syncHeaderCheckbox(slice) {
    var header = document.getElementById("selectAll");
    if (!header) return;
    var selectedOnPage = slice.filter(function (s) {
      return state.selected[s.id];
    }).length;
    header.checked = slice.length > 0 && selectedOnPage === slice.length;
    header.indeterminate = selectedOnPage > 0 && selectedOnPage < slice.length;
  }

  function renderBulkBar() {
    var bar = document.getElementById("bulkBar");
    var count = selectedCount();
    if (!bar) return;
    bar.classList.toggle("is-visible", count > 0);
    var label = document.getElementById("selectedCount");
    if (label) label.textContent = String(count);
  }

  /* ---- Delete --------------------------------------------------------------- */

  async function deleteStudents(ids) {
    var results = await Promise.all(ids.map(function (id) { return DB.deleteStudent(id); }));
    var failed = results.find(function (r) { return !r.ok; });
    if (failed) { App.toast({ type: "danger", title: "Delete failed", message: failed.error || "The records could not be removed." }); return 0; }
    await DB.refreshStudents();
    ids.forEach(function (id) { delete state.selected[id]; });
    render();
    return results.length;
  }

  function confirmDelete(ids) {
    var many = ids.length > 1;
    var first = DB.getStudent(ids[0]);
    var name = many
      ? ids.length + " selected students"
      : first
        ? first.name
        : "this student";

    App.confirmDialog({
      title: many ? "Delete " + ids.length + " students?" : "Delete " + name + "?",
      desc: many
        ? "All selected records will be permanently removed."
        : "This permanently removes the record of " + name + " from EduCore.",
      icon: "trash-2",
      tone: "danger",
      confirmText: many ? "Delete all" : "Delete student",
      confirmClass: "btn--danger",
      body:
        '<div class="alert alert--danger"><i data-lucide="triangle-alert"></i>' +
        '<div class="alert__body"><strong>This action cannot be undone.</strong><br />' +
        "Registration history, grades and contact details for " +
        App.escapeHtml(name) +
        " will be removed from the system.</div></div>",
      onConfirm: async function () {
        var removed = await deleteStudents(ids);
        if (!removed) return;
        App.toast({
          type: "success",
          title: removed > 1 ? removed + " students deleted" : "Student deleted",
          message: "The record was removed from the database."
        });
      }
    });
  }

  /* ---- Filter options -------------------------------------------------------- */

  function fillSelect(id, values, placeholder) {
    var select = document.getElementById(id);
    if (!select) return;
    select.innerHTML =
      '<option value="">' + placeholder + "</option>" +
      values
        .map(function (v) {
          return '<option value="' + App.escapeHtml(v) + '">' + App.escapeHtml(v) + "</option>";
        })
        .join("");
  }

  function populateFilters() {
    fillSelect("filterDepartment", DB.departments, "All departments");
    fillSelect("filterProgram", DB.programs, "All programmes");
    fillSelect("filterSemester", DB.semesters, "All semesters");
  }

  /* ---- Wiring ----------------------------------------------------------------- */

  function currentPageIds() {
    var list = getFiltered();
    var slice = list.slice((state.page - 1) * state.perPage, state.page * state.perPage);
    return slice.map(function (s) {
      return s.id;
    });
  }

  function resetFilters() {
    state.query = "";
    state.department = "";
    state.program = "";
    state.semester = "";
    state.status = "";
    state.page = 1;

    var search = document.getElementById("studentSearch");
    if (search) search.value = "";
    ["filterDepartment", "filterProgram", "filterSemester", "filterStatus"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = "";
    });
    render();
  }

  function bind() {
    var search = document.getElementById("studentSearch");
    if (search) {
      /* Prefill from the global top-bar search: students.php?q=… */
      var initial = App.queryParam("q");
      if (initial) {
        search.value = initial;
        state.query = initial;
      }
      search.addEventListener(
        "input",
        App.debounce(function () {
          state.query = search.value.trim();
          state.page = 1;
          render();
        }, 180)
      );
      search.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          search.value = "";
          state.query = "";
          state.page = 1;
          render();
        }
      });
    }

    var map = {
      filterDepartment: "department",
      filterProgram: "program",
      filterSemester: "semester",
      filterStatus: "status"
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("change", function () {
        state[map[id]] = el.value;
        state.page = 1;
        render();
      });
    });

    ["clearFilters", "emptyClear"].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener("click", resetFilters);
    });

    /* Sorting */
    document.querySelectorAll("[data-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var key = th.getAttribute("data-sort");
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = key === "joined" || key === "regNo" ? "desc" : "asc";
        }
        state.page = 1;
        document.querySelectorAll("[data-sort]").forEach(function (other) {
          other.classList.toggle("sorted", other === th);
          other.setAttribute(
            "aria-sort",
            other === th ? (state.sortDir === "asc" ? "ascending" : "descending") : "none"
          );
        });
        App.toast({
          type: "info",
          title: "Sorted by " + th.textContent.trim(),
          message: state.sortDir === "asc" ? "Ascending order" : "Descending order",
          duration: 2200
        });
        render();
      });
    });

    /* Selection */
    var tbody = document.getElementById("studentTableBody");
    if (tbody) {
      tbody.addEventListener("change", function (e) {
        var box = e.target.closest("[data-select]");
        if (!box) return;
        var id = box.getAttribute("data-select");
        if (box.checked) state.selected[id] = true;
        else delete state.selected[id];
        renderBulkBar();
        syncHeaderCheckbox(getFiltered().slice((state.page - 1) * state.perPage, state.page * state.perPage));
      });

      tbody.addEventListener("click", function (e) {
        var del = e.target.closest("[data-delete]");
        if (del) {
          confirmDelete([del.getAttribute("data-delete")]);
          return;
        }
        if (e.target.closest("a") || e.target.closest("input") || e.target.closest("button")) return;
        var row = e.target.closest("[data-student]");
        if (row) App.go("pages/student-details.php?id=" + row.getAttribute("data-student"));
      });
    }

    var selectAll = document.getElementById("selectAll");
    if (selectAll) {
      selectAll.addEventListener("change", function () {
        currentPageIds().forEach(function (id) {
          if (selectAll.checked) state.selected[id] = true;
          else delete state.selected[id];
        });
        render();
      });
    }

    var bulkClear = document.getElementById("bulkClear");
    if (bulkClear) {
      bulkClear.addEventListener("click", function () {
        state.selected = {};
        render();
      });
    }

    var bulkDelete = document.getElementById("bulkDelete");
    if (bulkDelete) {
      bulkDelete.addEventListener("click", function () {
        var ids = Object.keys(state.selected);
        if (ids.length) confirmDelete(ids);
      });
    }

    var bulkExport = document.getElementById("bulkExport");
    if (bulkExport) {
      bulkExport.addEventListener("click", function () {
        var ids = Object.keys(state.selected);
        exportRows(
          DB.students.filter(function (s) {
            return ids.indexOf(s.id) > -1;
          }),
          "educore-selected-students.csv"
        );
      });
    }

    var exportBtn = document.getElementById("exportStudents");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        exportRows(getFiltered(), "educore-students.csv");
      });
    }
  }

  function exportRows(list, filename) {
    if (!list.length) {
      App.toast({
        type: "warning",
        title: "Nothing to export",
        message: "Select or filter at least one student first."
      });
      return;
    }
    var rows = [
      [
        "Reg. Number",
        "Full Name",
        "Email",
        "Phone",
        "Gender",
        "Date of Birth",
        "Department",
        "Programme",
        "Semester",
        "Status",
        "Address",
        "Registered"
      ]
    ];
    list.forEach(function (s) {
      rows.push([
        s.regNo,
        s.name,
        s.email,
        s.phone,
        s.gender,
        s.dob,
        s.department,
        s.program,
        s.semester,
        s.status,
        s.address,
        s.joined
      ]);
    });
    var ok = App.downloadCSV(filename, rows);
    App.toast(
      ok
        ? {
            type: "success",
            title: list.length + " students exported",
            message: filename + " was downloaded."
          }
        : { type: "warning", title: "Export unavailable", message: "Your browser blocked the download." }
    );
  }

  function init() {
    populateFilters();
    bind();
    render();
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
