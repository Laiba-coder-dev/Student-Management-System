/* ==========================================================================
   users.js — staff account management: search, filters, invite, roles,
   status changes, deletion and pagination.
   ========================================================================== */

(function () {
  "use strict";

  if (!window.App || !window.DB) return;

  var ROLES = ["Administrator", "Registrar"];
  var STATUSES = ["Active", "Inactive"];

  var state = {
    query: "",
    role: "",
    status: "",
    page: 1,
    perPage: 8
  };

  var ROLE_ICONS = {
    Administrator: "shield-check",
    Registrar: "clipboard-list",
    Lecturer: "presentation",
    Advisor: "messages-square"
  };

  /* ---- Data ----------------------------------------------------------------- */

  function getFiltered() {
    var q = state.query.toLowerCase();
    return DB.users.filter(function (u) {
      var matches =
        !q ||
        u.name.toLowerCase().indexOf(q) > -1 ||
        u.email.toLowerCase().indexOf(q) > -1 ||
        u.role.toLowerCase().indexOf(q) > -1;
      return matches && (!state.role || u.role === state.role) && (!state.status || u.status === state.status);
    });
  }

  function renderSummary() {
    var count = function (predicate) {
      return DB.users.filter(predicate).length;
    };
    var set = function (id, value) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(value);
    };
    set("sumTotal", DB.users.length);
    set("sumAdmins", count(function (u) { return u.role === "Administrator"; }));
    set("sumLecturers", count(function (u) { return u.role === "Registrar"; }));
    set("sumPending", count(function (u) { return u.status === "Inactive"; }));
  }

  function rowMarkup(u) {
    return (
      '<tr data-user="' +
      u.id +
      '">' +
      '<td><div class="cell-title">' +
      App.avatarHTML(u) +
      '<div class="cell-title__meta"><strong>' +
      App.escapeHtml(u.name) +
      (u.isCurrentUser ? ' <span class="badge badge--brand" style="margin-left:6px">You</span>' : "") +
      "</strong><span>" +
      App.escapeHtml(u.email) +
      "</span></div></div></td>" +
      '<td><span class="role-cell"><i data-lucide="' +
      (ROLE_ICONS[u.role] || "user-round") +
      '"></i> ' +
      App.escapeHtml(u.role) +
      "</span></td>" +
      "<td>" +
      App.statusBadge(u.status) +
      "</td>" +
      '<td class="hide-mobile text-muted text-sm">' +
      App.escapeHtml(u.lastActive) +
      "</td>" +
      '<td class="hide-mobile">' +
      DB.formatDate(u.joined) +
      "</td>" +
      '<td class="col-actions"><div class="cell-actions">' +
      '<button type="button" class="action-btn" data-manage="' +
      u.id +
      '" title="Edit role & status" aria-label="Edit user"><i data-lucide="shield-check"></i></button>' +
      '<button type="button" class="action-btn" data-email-user="' +
      u.id +
      '" title="Send email" aria-label="Email user"><i data-lucide="mail"></i></button>' +
      '<button type="button" class="action-btn action-btn--danger' +
      (u.isCurrentUser ? " is-disabled" : "") +
      '" data-delete-user="' +
      u.id +
      '" title="' +
      (u.isCurrentUser ? "You cannot delete your own account" : "Delete user") +
      '" aria-label="Delete user"><i data-lucide="trash-2"></i></button>' +
      "</div></td></tr>"
    );
  }

  function render() {
    var list = getFiltered();
    var total = list.length;
    var totalPages = Math.max(1, Math.ceil(total / state.perPage));
    if (state.page > totalPages) state.page = totalPages;

    var slice = list.slice((state.page - 1) * state.perPage, state.page * state.perPage);
    var tbody = document.getElementById("userTableBody");
    var empty = document.getElementById("usersEmpty");
    var pager = document.getElementById("userPager");
    var scroll = document.querySelector(".table-scroll");

    tbody.innerHTML = slice.map(rowMarkup).join("");
    App.icons(tbody);

    scroll.classList.toggle("d-none", total === 0);
    empty.classList.toggle("d-none", total > 0);

    var meta = document.getElementById("userResultMeta");
    if (meta) {
      meta.innerHTML = "<strong>" + total + "</strong> of <strong>" + DB.users.length + "</strong> users";
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

    pager.classList.toggle("d-none", total === 0);

    renderSummary();
  }

  /* ---- Invite --------------------------------------------------------------- */

  function openInvite() {
    App.openModal({
      title: "Invite a team member",
      desc: "Create a staff account and share its temporary password securely.",
      icon: "user-plus",
      size: "md",
      body:
        '<div class="field"><label class="field__label" for="inviteName">Full name <span class="req">*</span></label>' +
        '<input class="input" id="inviteName" placeholder="e.g. Rachel Nguyen" data-label="Full name" minlength="3" required />' +
        '<p class="field__error"></p></div>' +
        '<div class="field mt-4"><label class="field__label" for="inviteEmail">Email address <span class="req">*</span></label>' +
        '<input class="input" type="email" id="inviteEmail" placeholder="name@northfield.edu" data-label="Email address" required />' +
        '<p class="field__error"></p></div>' +
        '<div class="field mt-4"><label class="field__label" for="invitePassword">Temporary password <span class="req">*</span></label>' +
        '<input class="input" type="password" id="invitePassword" minlength="10" data-label="Temporary password" required />' +
        '<p class="field__error"></p></div>' +
        '<div class="field mt-4"><label class="field__label" for="inviteRole">Role <span class="req">*</span></label>' +
        '<select class="select" id="inviteRole" data-label="Role" required>' +
        '<option value="">Select a role</option>' +
        ROLES.map(function (r) { return "<option>" + r + "</option>"; }).join("") +
        "</select><p class=\"field__error\"></p></div>",
      confirmText: "Create account",
      onConfirm: function (root) {
        var name = root.querySelector("#inviteName");
        var email = root.querySelector("#inviteEmail");
        var password = root.querySelector("#invitePassword");
        var role = root.querySelector("#inviteRole");
        var errors = [App.validateControl(name), App.validateControl(email), App.validateControl(password), App.validateControl(role)];
        App.showControlError(name, errors[0]);
        App.showControlError(email, errors[1]);
        App.showControlError(password, errors[2]);
        App.showControlError(role, errors[3]);
        if (errors.some(Boolean)) return false;
        DB.createUser({name:name.value.trim(),email:email.value.trim(),password:password.value,role:role.value}).then(async function(result){if(!result.ok){App.toast({type:"danger",title:"Account not created",message:result.error});return;}await DB.refreshUsers();render();App.toast({type:"success",title:"Account created",message:name.value.trim()+" can now sign in as "+role.value+"."});});
        return true;
      }
    });
  }

  /* ---- Manage role & status -------------------------------------------------- */

  function openManage(userId) {
    var user = DB.getUser(userId);
    if (!user) return;

    App.openModal({
      title: "Manage " + user.name,
      desc: "Update portal role and account status.",
      icon: "shield-check",
      size: "md",
      body:
        '<div class="field"><label class="field__label" for="manageRole">Role <span class="req">*</span></label>' +
        '<select class="select" id="manageRole" data-label="Role" required>' +
        ROLES.map(function (r) {
          return "<option" + (r === user.role ? " selected" : "") + ">" + r + "</option>";
        }).join("") +
        '</select><p class="field__error"></p></div>' +
        '<div class="field mt-4"><label class="field__label" for="manageStatus">Account status <span class="req">*</span></label>' +
        '<select class="select" id="manageStatus" data-label="Account status" required>' +
        STATUSES.map(function (s) {
          return "<option" + (s === user.status ? " selected" : "") + ">" + s + "</option>";
        }).join("") +
        '</select><p class="field__error"></p></div>' +
        '<div class="alert alert--info mt-4"><i data-lucide="info"></i><div class="alert__body">' +
        "Administrators can manage students and users. Registrars manage records. " +
        "Lecturers and advisors have read-only student access.</div></div>",
      confirmText: "Save changes",
      onConfirm: function (root) {
        DB.updateUser({id:user.id,role:root.querySelector("#manageRole").value,status:root.querySelector("#manageStatus").value}).then(async function(result){if(!result.ok){App.toast({type:"danger",title:"Permissions not changed",message:result.error});return;}await DB.refreshUsers();render();App.toast({type:"success",title:"Permissions updated",message:"Access settings saved for "+user.name+"."});});
        return true;
      }
    });
  }

  /* ---- Delete ------------------------------------------------------------------ */

  function openDelete(userId) {
    var user = DB.getUser(userId);
    if (!user || user.isCurrentUser) return;

    App.confirmDialog({
      title: "Delete " + user.name + "?",
      desc: "Their portal access will be revoked immediately.",
      icon: "user-x",
      tone: "danger",
      confirmText: "Delete user",
      confirmClass: "btn--danger",
      body:
        '<div class="alert alert--danger"><i data-lucide="triangle-alert"></i><div class="alert__body">' +
        "Audit history will be kept, but <strong>" +
        App.escapeHtml(user.email) +
        "</strong> will no longer be able to sign in.</div></div>",
      onConfirm: function () {
        DB.deleteUser(user.id).then(async function(result){if(!result.ok){App.toast({type:"danger",title:"User not deleted",message:result.error});return;}await DB.refreshUsers();render();App.toast({type:"success",title:"User deleted",message:user.name+" no longer has portal access."});});
      }
    });
  }

  /* ---- Export ------------------------------------------------------------------- */

  function exportUsers() {
    var rows = [["Name", "Email", "Role", "Status", "Last active", "Joined"]];
    getFiltered().forEach(function (u) {
      rows.push([u.name, u.email, u.role, u.status, u.lastActive, u.joined]);
    });
    if (rows.length === 1) {
      App.toast({ type: "warning", title: "Nothing to export", message: "No users match the current filters." });
      return;
    }
    var ok = App.downloadCSV("educore-users.csv", rows);
    App.toast(
      ok
        ? { type: "success", title: "Users exported", message: "educore-users.csv was downloaded." }
        : { type: "warning", title: "Export unavailable", message: "Your browser blocked the download." }
    );
  }

  function todayIso() {
    var d = new Date();
    var mm = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
    var dd = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  /* ---- Wiring -------------------------------------------------------------------- */

  function resetFilters() {
    state.query = "";
    state.role = "";
    state.status = "";
    state.page = 1;
    document.getElementById("userSearch").value = "";
    document.getElementById("filterRole").value = "";
    document.getElementById("filterUserStatus").value = "";
    render();
  }

  function bind() {
    var search = document.getElementById("userSearch");
    search.addEventListener(
      "input",
      App.debounce(function () {
        state.query = search.value.trim();
        state.page = 1;
        render();
      }, 180)
    );

    document.getElementById("filterRole").addEventListener("change", function (e) {
      state.role = e.target.value;
      state.page = 1;
      render();
    });

    document.getElementById("filterUserStatus").addEventListener("change", function (e) {
      state.status = e.target.value;
      state.page = 1;
      render();
    });

    ["clearUserFilters", "emptyUserClear"].forEach(function (id) {
      document.getElementById(id).addEventListener("click", resetFilters);
    });

    document.getElementById("inviteUser").addEventListener("click", openInvite);
    document.getElementById("exportUsers").addEventListener("click", exportUsers);

    var tbody = document.getElementById("userTableBody");
    tbody.addEventListener("click", function (e) {
      var manage = e.target.closest("[data-manage]");
      if (manage) {
        openManage(manage.getAttribute("data-manage"));
        return;
      }

      var emailBtn = e.target.closest("[data-email-user]");
      if (emailBtn) {
        var user = DB.getUser(emailBtn.getAttribute("data-email-user"));
        if (user) {
          App.toast({
            type: "info",
            title: "Mail client",
            message: "Opening a message to " + user.email + "…"
          });
          setTimeout(function () {
            window.location.href = "mailto:" + user.email + "?subject=" + encodeURIComponent("EduCore portal access");
          }, 500);
        }
        return;
      }

      var del = e.target.closest("[data-delete-user]");
      if (del) {
        if (del.classList.contains("is-disabled")) {
          App.toast({
            type: "warning",
            title: "This is you",
            message: "You cannot delete your own account."
          });
          return;
        }
        openDelete(del.getAttribute("data-delete-user"));
      }
    });
  }

  function init() {
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
