/* ==========================================================================
   app.js — application shell (sidebar, topbar) + reusable UI components:
   dropdowns, modals, toasts, validation, pagination, loaders, helpers.
   ========================================================================== */

(function () {
  "use strict";

  /* -------------------------------------------------------------------------
     Environment helpers
     ------------------------------------------------------------------------- */

  var BASE = /\/pages\//i.test(window.location.pathname.replace(/\\/g, "/"))
    ? "../"
    : "";

  var NAV_ITEMS = [
    { group: "Overview", items: [{ key: "dashboard", label: "Dashboard", href: "pages/dashboard.php", icon: "layout-dashboard" }] },
    {
      group: "Management",
      items: [
        { key: "students", label: "Students", href: "pages/students.php", icon: "graduation-cap", count: true },
        { key: "add-student", label: "Add Student", href: "pages/add-student.php", icon: "user-plus" },
        { key: "users", label: "User Management", href: "pages/users.php", icon: "users" },
        { key: "student-id-cards", label: "Student ID Cards", href: "pages/student-id-cards.php", icon: "id-card", adminOnly: true }
      ]
    },
    {
      group: "Account",
      items: [{ key: "profile", label: "Profile Settings", href: "pages/profile.php", icon: "settings" }]
    }
  ];

  function currentUser() {
    if (window.DB && DB.currentUser) return DB.currentUser;
    var list = (window.DB && DB.users) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].isCurrentUser) return list[i];
    }
    return list[0] || { name: "Administrator", role: "Administrator", initials: "AD", color: "#2451e0" };
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments,
        ctx = this;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait || 200);
    };
  }

  function icons(root) {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons({
        attrs: { "aria-hidden": "true" },
        nameAttr: "data-lucide",
        root: root || document
      });
    }
  }

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* -------------------------------------------------------------------------
     Application shell (sidebar + topbar)
     ------------------------------------------------------------------------- */

  function navMarkup() {
    var page = document.body.getAttribute("data-page") || "";
    var user = currentUser();
    var studentCount = (window.DB && DB.students ? DB.students.length : 0);

    return NAV_ITEMS.map(function (group) {
      var links = group.items
        .filter(function (item) { return (!item.adminOnly || user.role === "Administrator") && (user.role === "Administrator" || (item.key !== "add-student" && item.key !== "users")); })
        .map(function (item) {
          var active = item.key === page ? " is-active" : "";
          var count = item.count
            ? '<span class="nav-link__count">' + studentCount + "</span>"
            : "";
          return (
            '<li><a class="nav-link' +
            active +
            '" href="' +
            BASE +
            item.href +
            '"' +
            (active ? ' aria-current="page"' : "") +
            '><i data-lucide="' +
            item.icon +
            '"></i><span class="nav-link__label">' +
            item.label +
            "</span>" +
            count +
            "</a></li>"
          );
        })
        .join("");

      return (
        '<div class="nav-group"><p class="nav-group__title">' +
        group.group +
        "</p><ul>" +
        links +
        "</ul></div>"
      );
    }).join("");
  }

  function notificationsMarkup() {
    var items = (window.DB && DB.notifications) || [];
    var unread = items.filter(function (n) {
      return n.unread;
    }).length;
    return {
      unread: unread,
      html: items
        .map(function (n) {
          return (
            '<div class="notif' +
            (n.unread ? " is-unread" : "") +
            '" data-notif>' +
            '<span class="notif__icon notif__icon--' +
            (n.tone === "brand" ? "" : n.tone) +
            '"><i data-lucide="' +
            n.icon +
            '"></i></span>' +
            '<div class="notif__body"><p><strong>' +
            escapeHtml(n.title) +
            "</strong> — " +
            escapeHtml(n.text) +
            "</p><time>" +
            escapeHtml(n.time) +
            "</time></div></div>"
          );
        })
        .join("")
    };
  }

  function renderShell() {
    if (!document.body.hasAttribute("data-shell")) return;
    if (qs("#appShell")) return;

    var user = currentUser();
    var notifs = notificationsMarkup();
    var title = document.body.getAttribute("data-title") || "Dashboard";
    var section = document.body.getAttribute("data-section") || "Home";

    var wrap = document.createElement("div");
    wrap.id = "appShell";
    wrap.className = "app-shell";
    wrap.innerHTML =
      /* Sidebar */
      '<aside class="sidebar" id="sidebar" aria-label="Main navigation">' +
      '<div class="sidebar__brand">' +
      '<span class="brand-mark"><i data-lucide="book-open-check"></i></span>' +
      '<span class="brand-text"><strong>EduCore</strong><span>' +
      escapeHtml(window.DB ? DB.UNIVERSITY : "Student System") +
      "</span></span></div>" +
      '<div class="sidebar__scroll">' +
      navMarkup() +
      "</div>" +
      '<div class="sidebar__footer">' +
      '<div class="sidebar-upgrade"><strong>Need help?</strong>' +
      "<p>Visit the admin handbook or contact the ICT desk.</p>" +
      '<button type="button" class="btn btn--soft btn--sm btn--block" data-action="help">' +
      '<i data-lucide="life-buoy"></i> Support</button></div>' +
      "</div></aside>" +
      '<div class="sidebar-overlay" id="sidebarOverlay"></div>' +
      /* Topbar */
      '<header class="topbar">' +
      '<div class="topbar__start">' +
      '<button type="button" class="icon-btn nav-toggle" id="navToggle" aria-label="Open navigation"><i data-lucide="menu"></i></button>' +
      '<button type="button" class="icon-btn hide-mobile" id="collapseToggle" aria-label="Collapse sidebar"><i data-lucide="panel-left-close"></i></button>' +
      "<div>" +
      '<div class="topbar__title">' +
      escapeHtml(title) +
      "</div>" +
      '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="' +
      BASE +
      'pages/dashboard.php">Home</a><i data-lucide="chevron-right"></i><span>' +
      escapeHtml(section) +
      "</span></nav></div></div>" +
      '<div class="topbar__end">' +
      '<form class="topbar__search" id="globalSearchForm" role="search">' +
      '<i data-lucide="search"></i>' +
      '<input type="search" id="globalSearch" placeholder="Search students, users…" aria-label="Global search" autocomplete="off" />' +
      "<kbd>Ctrl K</kbd></form>" +
      /* Notifications */
      '<div class="dropdown" data-dropdown>' +
      '<button type="button" class="icon-btn" data-dropdown-toggle aria-haspopup="true" aria-expanded="false" aria-label="Notifications">' +
      '<i data-lucide="bell"></i><span class="icon-btn__dot" id="notifCount">' +
      notifs.unread +
      "</span></button>" +
      '<div class="dropdown__menu dropdown__menu--wide" data-dropdown-menu>' +
      '<div class="dropdown__head"><strong>Notifications</strong><span>You have ' +
      notifs.unread +
      " unread updates</span></div>" +
      '<div id="notifList">' +
      notifs.php +
      "</div>" +
      '<div class="dropdown__sep"></div>' +
      '<button type="button" class="dropdown__item" data-action="mark-read">' +
      '<i data-lucide="check-check"></i> Mark all as read</button></div></div>' +
      /* User menu */
      '<div class="topbar__divider hide-mobile"></div>' +
      '<div class="dropdown" data-dropdown>' +
      '<button type="button" class="user-trigger" data-dropdown-toggle aria-haspopup="true" aria-expanded="false">' +
      '<span class="avatar avatar--sm" style="background:' +
      user.color +
      '">' +
      user.initials +
      "</span>" +
      '<span class="user-trigger__meta"><strong>' +
      escapeHtml(user.name) +
      "</strong><span>" +
      escapeHtml(user.role) +
      "</span></span>" +
      '<i class="chevron" data-lucide="chevron-down"></i></button>' +
      '<div class="dropdown__menu" data-dropdown-menu>' +
      '<div class="dropdown__head"><strong>' +
      escapeHtml(user.name) +
      "</strong><span>" +
      escapeHtml(user.email) +
      "</span></div>" +
      '<a class="dropdown__item" href="' +
      BASE +
      'pages/profile.php"><i data-lucide="user-round"></i> Profile settings</a>' +
      '<a class="dropdown__item" href="' +
      BASE +
      'pages/dashboard.php"><i data-lucide="layout-dashboard"></i> Dashboard</a>' +
      (user.role === "Administrator" ? '<a class="dropdown__item" href="' + BASE + 'pages/users.php"><i data-lucide="shield-check"></i> Manage users</a>' : "") +
      '<div class="dropdown__sep"></div>' +
      '<button type="button" class="dropdown__item dropdown__item--danger" data-action="logout">' +
      '<i data-lucide="log-out"></i> Sign out</button></div></div>' +
      "</div></header>";

    document.body.insertBefore(wrap, document.body.firstChild);

    /* Keep the page content inside the shell so it starts below the fixed topbar
       in the same viewport instead of after the shell's full-height block. */
    var pageMain = qs("body > main.main");
    if (pageMain) wrap.appendChild(pageMain);
    if (user.role !== "Administrator") {
      qsa('a[href*="add-student.php"],a[href*="edit-student.php"],#bulkDelete,#deleteStudent').forEach(function (el) { el.remove(); });
      qsa('[data-action="delete"]').forEach(function (el) { el.remove(); });
    }
  }

  /* -------------------------------------------------------------------------
     Sidebar behaviour
     ------------------------------------------------------------------------- */

  function initSidebar() {
    var navToggle = qs("#navToggle");
    var collapseToggle = qs("#collapseToggle");
    var overlay = qs("#sidebarOverlay");

    /* Remember desktop preference */
    try {
      if (window.localStorage && localStorage.getItem("sms.sidebar") === "collapsed") {
        document.body.classList.add("sidebar-collapsed");
      }
    } catch (e) {}

    if (navToggle) {
      navToggle.addEventListener("click", function () {
        document.body.classList.toggle("nav-open");
        navToggle.setAttribute(
          "aria-label",
          document.body.classList.contains("nav-open") ? "Close navigation" : "Open navigation"
        );
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    }

    if (collapseToggle) {
      collapseToggle.addEventListener("click", function () {
        var collapsed = document.body.classList.toggle("sidebar-collapsed");
        collapseToggle.innerHTML = collapsed
          ? '<i data-lucide="panel-left-open"></i>'
          : '<i data-lucide="panel-left-close"></i>';
        collapseToggle.setAttribute(
          "aria-label",
          collapsed ? "Expand sidebar" : "Collapse sidebar"
        );
        icons(collapseToggle);
        try {
          if (window.localStorage) {
            localStorage.setItem("sms.sidebar", collapsed ? "collapsed" : "expanded");
          }
        } catch (e) {}
      });
    }

    /* Close the off-canvas menu when a navigation link is chosen */
    qsa(".sidebar .nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") document.body.classList.remove("nav-open");
    });

    window.addEventListener(
      "resize",
      debounce(function () {
        if (window.innerWidth > 1024) document.body.classList.remove("nav-open");
      }, 150)
    );
  }

  /* -------------------------------------------------------------------------
     Dropdowns
     ------------------------------------------------------------------------- */

  function closeDropdowns(except) {
    qsa(".dropdown.is-open").forEach(function (dd) {
      if (dd !== except) {
        dd.classList.remove("is-open");
        var toggle = qs("[data-dropdown-toggle]", dd);
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function initDropdowns() {
    document.addEventListener("click", function (e) {
      var toggle = e.target.closest("[data-dropdown-toggle]");
      if (toggle) {
        var dd = toggle.closest(".dropdown");
        var willOpen = !dd.classList.contains("is-open");
        closeDropdowns(dd);
        dd.classList.toggle("is-open", willOpen);
        toggle.setAttribute("aria-expanded", String(willOpen));
        e.preventDefault();
        return;
      }
      if (!e.target.closest(".dropdown__menu")) closeDropdowns();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDropdowns();
    });
  }

  /* -------------------------------------------------------------------------
     Modal dialogs
     ------------------------------------------------------------------------- */

  var lastFocused = null;

  function modalRoot() {
    var root = qs("#modalRoot");
    if (!root) {
      root = document.createElement("div");
      root.id = "modalRoot";
      root.className = "modal-root";
      root.setAttribute("role", "presentation");
      document.body.appendChild(root);
    }
    return root;
  }

  function closeModal() {
    var root = qs("#modalRoot");
    if (!root) return;
    root.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () {
      if (!root.classList.contains("is-open")) root.innerHTML = "";
    }, 220);
    if (lastFocused && lastFocused.focus) {
      try {
        lastFocused.focus();
      } catch (e) {}
    }
  }

  /**
   * openModal({
   *   title, desc, icon, tone, size, body, confirmText, confirmClass,
   *   cancelText, onConfirm, onOpen
   * })
   */
  function openModal(opts) {
    opts = opts || {};
    lastFocused = document.activeElement;
    var root = modalRoot();
    var toneClass = opts.tone ? " modal__icon--" + opts.tone : "";
    var sizeClass = opts.size ? " modal--" + opts.size : "";

    root.innerHTML =
      '<div class="modal' +
      sizeClass +
      '" role="dialog" aria-modal="true" aria-labelledby="modalTitle">' +
      '<div class="modal__header">' +
      '<span class="modal__icon' +
      toneClass +
      '"><i data-lucide="' +
      (opts.icon || "info") +
      '"></i></span>' +
      "<div><h3 class=\"modal__title\" id=\"modalTitle\">" +
      escapeHtml(opts.title || "Confirm") +
      "</h3>" +
      (opts.desc
        ? '<p class="modal__desc">' + escapeHtml(opts.desc) + "</p>"
        : "") +
      "</div>" +
      '<button type="button" class="modal__close" data-modal-close aria-label="Close dialog"><i data-lucide="x"></i></button>' +
      "</div>" +
      '<div class="modal__body">' +
      (opts.body || "") +
      "</div>" +
      '<div class="modal__footer">' +
      '<button type="button" class="btn" data-modal-close>' +
      escapeHtml(opts.cancelText || "Cancel") +
      "</button>" +
      (opts.confirmText
        ? '<button type="button" class="btn ' +
          (opts.confirmClass || "btn--primary") +
          '" data-modal-confirm>' +
          escapeHtml(opts.confirmText) +
          "</button>"
        : "") +
      "</div></div>";

    root.classList.add("is-open");
    document.body.style.overflow = "hidden";
    icons(root);

    qsa("[data-modal-close]", root).forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });

    root.addEventListener("click", function (e) {
      if (e.target === root) closeModal();
    });

    var confirmBtn = qs("[data-modal-confirm]", root);
    if (confirmBtn && typeof opts.onConfirm === "function") {
      confirmBtn.addEventListener("click", function () {
        var keepOpen = opts.onConfirm(root) === false;
        if (!keepOpen) closeModal();
      });
    }

    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escHandler);
      }
    });

    if (typeof opts.onOpen === "function") opts.onOpen(root);

    var focusTarget = qs("input, textarea, select, [data-modal-confirm]", root);
    if (focusTarget) setTimeout(function () { focusTarget.focus(); }, 60);

    return root;
  }

  function confirmDialog(opts) {
    return openModal({
      title: opts.title,
      desc: opts.desc,
      body: opts.body || "",
      icon: opts.icon || "triangle-alert",
      tone: opts.tone || "warning",
      confirmText: opts.confirmText || "Confirm",
      confirmClass: opts.confirmClass || "btn--primary",
      cancelText: opts.cancelText || "Cancel",
      onConfirm: opts.onConfirm
    });
  }

  /* -------------------------------------------------------------------------
     Toast notifications
     ------------------------------------------------------------------------- */

  var TOAST_ICONS = {
    success: "circle-check-big",
    danger: "circle-x",
    warning: "triangle-alert",
    info: "info"
  };

  function toast(opts) {
    if (typeof opts === "string") opts = { title: opts };
    var root = qs("#toastRoot");
    if (!root) {
      root = document.createElement("div");
      root.id = "toastRoot";
      root.className = "toast-root";
      root.setAttribute("role", "status");
      root.setAttribute("aria-live", "polite");
      document.body.appendChild(root);
    }

    var type = opts.type || "info";
    var el = document.createElement("div");
    el.className = "toast toast--" + type;
    el.innerHTML =
      '<span class="toast__icon"><i data-lucide="' +
      (TOAST_ICONS[type] || TOAST_ICONS.info) +
      '"></i></span>' +
      '<div class="toast__body"><div class="toast__title">' +
      escapeHtml(opts.title || "Notification") +
      "</div>" +
      (opts.message
        ? '<div class="toast__msg">' + escapeHtml(opts.message) + "</div>"
        : "") +
      "</div>" +
      '<button type="button" class="toast__close" aria-label="Dismiss"><i data-lucide="x"></i></button>';

    root.appendChild(el);
    icons(el);

    var timer = setTimeout(dismiss, opts.duration || 4200);

    function dismiss() {
      clearTimeout(timer);
      el.classList.add("is-leaving");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }

    qs(".toast__close", el).addEventListener("click", dismiss);
    return dismiss;
  }

  /* -------------------------------------------------------------------------
     Loading indicators
     ------------------------------------------------------------------------- */

  function ensurePageLoader() {
    if (qs("#pageLoader")) return;
    var loader = document.createElement("div");
    loader.className = "page-loader";
    loader.id = "pageLoader";
    loader.innerHTML =
      '<div class="page-loader__brand"><span class="brand-mark"><i data-lucide="book-open-check"></i></span> EduCore</div>' +
      '<div class="spinner spinner--lg text-accent"></div>' +
      '<div class="page-loader__text">Loading workspace</div>';
    document.body.appendChild(loader);
    icons(loader);
  }

  function hidePageLoader() {
    var loader = qs("#pageLoader");
    if (loader) loader.classList.add("is-hidden");
  }

  /** Shows a spinner inside a button while work "happens", then calls done(). */
  function withLoading(button, label, ms, done) {
    if (!button) {
      setTimeout(done || function () {}, ms || 600);
      return;
    }
    var original = button.innerHTML;
    button.disabled = true;
    button.classList.add("is-loading");
    button.innerHTML =
      '<span class="btn__spinner' +
      (button.classList.contains("btn--primary") ||
      button.classList.contains("btn--danger") ||
      button.classList.contains("btn--violet")
        ? ""
        : " btn--secondary-spinner") +
      '"></span>' +
      (label || "Saving…");
    setTimeout(function () {
      button.disabled = false;
      button.classList.remove("is-loading");
      button.innerHTML = original;
      icons(button);
      if (typeof done === "function") done();
    }, ms || 700);
  }

  /* -------------------------------------------------------------------------
     Form validation
     ------------------------------------------------------------------------- */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  var PHONE_RE = /^[+()\d][\d\s()\-.]{6,19}$/;

  function fieldOf(control) {
    return control.closest(".field") || control.closest(".auth-form__field") || control.parentNode;
  }

  function validateControl(control) {
    var value = (control.value || "").trim();
    var label = control.getAttribute("data-label") || "This field";
    var name = control.getAttribute("name") || label;

    if (control.type === "hidden") return null;

    if (control.type === "checkbox" || control.type === "radio") {
      if (control.hasAttribute("required")) {
        var group = control.name
          ? qsa('input[name="' + control.name + '"]', control.form || document)
          : [control];
        var checked = group.some(function (c) {
          return c.checked;
        });
        if (!checked) {
          return label + " is required.";
        }
      }
      return null;
    }

    if (control.hasAttribute("required") && !value) {
      return label + " is required.";
    }

    if (!value) return null;

    if (control.hasAttribute("minlength")) {
      var min = parseInt(control.getAttribute("minlength"), 10);
      if (value.length < min) {
        return label + " must be at least " + min + " characters.";
      }
    }

    if (control.hasAttribute("maxlength")) {
      var max = parseInt(control.getAttribute("maxlength"), 10);
      if (value.length > max) {
        return label + " must be " + max + " characters or fewer.";
      }
    }

    if (control.type === "email" && !EMAIL_RE.test(value)) {
      return "Enter a valid email address, e.g. " + name.split("@")[0] + "@example.com";
    }

    if (control.type === "tel" && !PHONE_RE.test(value)) {
      return "Enter a valid phone number (7–20 digits).";
    }

    if (control.type === "date") {
      var d = new Date(value + "T00:00:00");
      if (isNaN(d.getTime())) return "Enter a valid date.";
      if (control.hasAttribute("data-not-future") && d.getTime() > Date.now()) {
        return label + " cannot be in the future.";
      }
      if (control.hasAttribute("data-min-age")) {
        var minAge = parseInt(control.getAttribute("data-min-age"), 10);
        var age = DB ? DB.ageFrom(value) : 0;
        if (!isNaN(minAge) && age < minAge) {
          return label + " must be at least " + minAge + " years old.";
        }
        if (age > 100) return "Enter a realistic date of birth.";
      }
    }

    if (control.hasAttribute("pattern")) {
      var re = new RegExp(control.getAttribute("pattern"));
      if (!re.test(value)) {
        return control.getAttribute("data-pattern-msg") || (label + " format is invalid.");
      }
    }

    if (control.hasAttribute("data-match")) {
      var other = qs(control.getAttribute("data-match"));
      if (other && other.value !== value) {
        return control.getAttribute("data-match-msg") || "Passwords do not match.";
      }
    }

    if (control.hasAttribute("data-unique-reg") && window.DB) {
      var ignore = (control.getAttribute("data-unique-ignore") || "").toLowerCase();
      var exists = DB.students.some(function (s) {
        var reg = s.regNo.toLowerCase();
        return reg === value.toLowerCase() && reg !== ignore;
      });
      if (exists) return "This registration number is already in use.";
    }

    return null;
  }

  function showControlError(control, message) {
    var customSlot = control.getAttribute("data-error-target");
    if (customSlot) {
      var custom = qs(customSlot);
      var wrap = control.closest(".checkbox-line") || control.closest(".choice-group");
      if (custom) {
        if (message) {
          custom.style.display = "flex";
          custom.innerHTML =
            '<i data-lucide="circle-alert"></i><span>' + escapeHtml(message) + "</span>";
          icons(custom);
        } else {
          custom.style.display = "";
          custom.innerHTML = "";
        }
      }
      if (wrap) wrap.classList.toggle("is-invalid", Boolean(message));
      if (message) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
      return;
    }

    var field = fieldOf(control);
    if (!field) return;
    var slot = qs(".field__error", field);
    if (message) {
      field.classList.add("is-invalid");
      field.classList.remove("is-valid");
      if (slot) {
        slot.innerHTML =
          '<i data-lucide="circle-alert"></i><span>' + escapeHtml(message) + "</span>";
        icons(slot);
      }
      control.setAttribute("aria-invalid", "true");
    } else {
      field.classList.remove("is-invalid");
      if ((control.value || "").trim()) field.classList.add("is-valid");
      else field.classList.remove("is-valid");
      control.removeAttribute("aria-invalid");
    }
  }

  /**
   * Validates a form. Controls opt in with `required`, and may carry
   * data-label, data-match, data-min-age, data-not-future, data-unique-reg.
   * Returns true when everything passes.
   */
  function validateForm(form) {
    if (!form) return false;
    var controls = qsa("input, select, textarea", form).filter(function (c) {
      return c.type !== "hidden" && c.type !== "submit" && c.type !== "button";
    });
    var firstInvalid = null;
    var ok = true;
    var seenGroups = {};

    controls.forEach(function (control) {
      /* Radio groups are validated once, on their first control. */
      if (control.type === "radio" && control.name) {
        var groupKey = "radio:" + control.name;
        if (seenGroups[groupKey]) return;
        seenGroups[groupKey] = true;
      }
      var message = validateControl(control);
      showControlError(control, message);
      if (message) {
        ok = false;
        if (!firstInvalid) firstInvalid = control;
      }
    });

    if (!ok && firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return ok;
  }

  function initLiveValidation(form) {
    if (!form) return;
    qsa("input, select, textarea", form).forEach(function (control) {
      var handler = function () {
        var field = fieldOf(control);
        if (field && field.classList.contains("is-invalid")) {
          showControlError(control, validateControl(control));
        }
      };
      control.addEventListener("input", handler);
      control.addEventListener("change", handler);
      control.addEventListener("blur", function () {
        var f = fieldOf(control);
        var touched =
          (control.value || "").trim() !== "" ||
          control.type === "checkbox" ||
          (f && f.classList.contains("is-invalid"));
        if (touched) showControlError(control, validateControl(control));
      });
    });
  }

  /* -------------------------------------------------------------------------
     Password visibility toggle
     ------------------------------------------------------------------------- */

  function initPasswordToggles() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-toggle-password]");
      if (!btn) return;
      var targetSel = btn.getAttribute("data-toggle-password") || btn.getAttribute("data-target");
      var input = targetSel ? qs(targetSel) : null;
      if (!input) return;
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.innerHTML = show
        ? '<i data-lucide="eye-off"></i>'
        : '<i data-lucide="eye"></i>';
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      icons(btn);
    });
  }

  /* -------------------------------------------------------------------------
     Pagination component
     ------------------------------------------------------------------------- */

  function paginationState(total, page, perPage) {
    var size = perPage || 10;
    var pages = Math.max(1, Math.ceil(total / size));
    return {
      total: total,
      page: Math.min(Math.max(1, page || 1), pages),
      perPage: size,
      totalPages: pages
    };
  }

  function pageNumbers(state) {
    var out = [];
    var p = state.page;
    var total = state.totalPages;
    if (total <= 7) {
      for (var i = 1; i <= total; i++) out.push(i);
      return out;
    }
    out.push(1);
    if (p > 3) out.push("…");
    for (var j = Math.max(2, p - 1); j <= Math.min(total - 1, p + 1); j++) out.push(j);
    if (p < total - 2) out.push("…");
    out.push(total);
    return out;
  }

  /**
   * renderPagination(container, state, onChange)
   * state: { total, page, perPage }
   * Re-rendering is safe: listeners are bound only once per container.
   */
  function renderPagination(container, state, onChange) {
    if (!container) return;
    var s = paginationState(state.total, state.page, state.perPage);
    var start = (s.page - 1) * s.perPage;
    var end = Math.min(s.total, start + s.perPage);

    container.__state = s;
    container.__onChange = onChange;

    var numbers = pageNumbers(s)
      .map(function (n) {
        if (n === "…") return '<span class="page-ellipsis">…</span>';
        return (
          '<button type="button" class="page-btn' +
          (n === s.page ? " is-current" : "") +
          '" data-page="' +
          n +
          '"' +
          (n === s.page ? ' aria-current="page"' : "") +
          ">" +
          n +
          "</button>"
        );
      })
      .join("");

    container.className = "pagination";
    container.innerHTML =
      '<div class="pagination__info">Showing <strong>' +
      (s.total === 0 ? 0 : start + 1) +
      "–" +
      end +
      "</strong> of <strong>" +
      s.total +
      "</strong> records</div>" +
      '<div class="pagination__pages">' +
      '<button type="button" class="page-btn" data-page="prev" ' +
      (s.page === 1 ? "disabled" : "") +
      ' aria-label="Previous page"><i data-lucide="chevron-left"></i></button>' +
      numbers +
      '<button type="button" class="page-btn" data-page="next" ' +
      (s.page === s.totalPages ? "disabled" : "") +
      ' aria-label="Next page"><i data-lucide="chevron-right"></i></button>' +
      "</div>" +
      '<label class="pagination__size">Per page ' +
      '<select class="select" data-per-page>' +
      [10, 15, 25, 50]
        .map(function (n) {
          return (
            '<option value="' +
            n +
            '"' +
            (n === s.perPage ? " selected" : "") +
            ">" +
            n +
            "</option>"
          );
        })
        .join("") +
      "</select></label>";

    icons(container);

    if (container.__bound) return;
    container.__bound = true;

    container.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-page]");
      if (!btn || btn.disabled || !container.__onChange) return;
      var target = btn.getAttribute("data-page");
      var current = container.__state;
      var nextPage = current.page;
      if (target === "prev") nextPage = current.page - 1;
      else if (target === "next") nextPage = current.page + 1;
      else nextPage = parseInt(target, 10);
      container.__onChange(nextPage, current.perPage);
    });

    container.addEventListener("change", function (e) {
      var select = e.target.closest("[data-per-page]");
      if (select && container.__onChange) {
        container.__onChange(1, parseInt(select.value, 10));
      }
    });
  }

  /* -------------------------------------------------------------------------
     Small view helpers
     ------------------------------------------------------------------------- */

  function avatarHTML(person, size) {
    var cls = size ? " avatar--" + size : "";
    return (
      '<span class="avatar' +
      cls +
      '" style="background:' +
      (person.color || "#2451e0") +
      '">' +
      escapeHtml(person.initials || DB.initials(person.name || "?")) +
      "</span>"
    );
  }

  function statusBadge(status) {
    var map = {
      Active: "success",
      Inactive: "neutral",
      "On Leave": "warning",
      Suspended: "danger",
      Invited: "info"
    };
    return (
      '<span class="badge badge--' +
      (map[status] || "neutral") +
      ' badge--dot">' +
      escapeHtml(status) +
      "</span>"
    );
  }

  function downloadCSV(filename, rows) {
    try {
      var csv = rows
        .map(function (row) {
          return row
            .map(function (cell) {
              var val = String(cell == null ? "" : cell);
              return /[",\n]/.test(val) ? '"' + val.replace(/"/g, '""') + '"' : val;
            })
            .join(",");
        })
        .join("\r\n");
      var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1500);
      return true;
    } catch (e) {
      return false;
    }
  }

  function queryParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }

  function go(path) {
    window.location.href = BASE + path;
  }

  /* -------------------------------------------------------------------------
     Shell actions (logout, support, notifications, global search)
     ------------------------------------------------------------------------- */

  function initShellActions() {
    document.addEventListener("click", function (e) {
      var actionEl = e.target.closest("[data-action]");
      if (!actionEl) return;
      var action = actionEl.getAttribute("data-action");

      if (action === "logout") {
        closeDropdowns();
        confirmDialog({
          title: "Sign out of EduCore?",
          desc: "You will be returned to the login screen. Any unsaved changes will be lost.",
          icon: "log-out",
          tone: "warning",
          confirmText: "Sign out",
          confirmClass: "btn--danger",
          onConfirm: function () {
            DB.logout().then(function(result){if(!result.ok){toast({type:"danger",title:"Sign out failed",message:result.error||"Please try again."});return;}toast({type:"info",title:"Signed out",message:"Redirecting to the login page…"});setTimeout(function(){window.location.href=BASE+"index.php";},350);});
          }
        });
      }

      if (action === "help") {
        openModal({
          title: "EduCore support",
          desc: "We are here to help you get the most out of the portal.",
          icon: "life-buoy",
          size: "md",
          body:
            '<div class="detail-list">' +
            '<div class="detail-item"><span class="detail-item__icon"><i data-lucide="mail"></i></span><div><div class="detail-item__label">Email</div><div class="detail-item__value">ict-support@northfield.edu</div></div></div>' +
            '<div class="detail-item"><span class="detail-item__icon"><i data-lucide="phone"></i></span><div><div class="detail-item__label">Help desk</div><div class="detail-item__value">+1 (800) 555-0142 — Mon to Fri, 8am–6pm</div></div></div>' +
            '<div class="detail-item"><span class="detail-item__icon"><i data-lucide="book-open"></i></span><div><div class="detail-item__label">Documentation</div><div class="detail-item__value">Admin handbook available on the intranet</div></div></div>' +
            "</div>",
          confirmText: "Got it"
        });
      }

      if (action === "mark-read") {
        closeDropdowns();
        qsa("#notifList .notif").forEach(function (n) {
          n.classList.remove("is-unread");
        });
        var count = qs("#notifCount");
        if (count) {
          count.textContent = "0";
          count.style.display = "none";
        }
        var head = qs(".dropdown__head span", actionEl.closest(".dropdown__menu"));
        if (head) head.textContent = "You are all caught up";
        toast({ type: "success", title: "Notifications cleared", message: "All notifications marked as read." });
      }
    });

    /* Notification items open a toast with their content */
    document.addEventListener("click", function (e) {
      var notif = e.target.closest("[data-notif]");
      if (!notif) return;
      notif.classList.remove("is-unread");
      var title = qs("strong", notif);
      toast({
        type: "info",
        title: title ? title.textContent : "Notification",
        message: qs("time", notif) ? "Received " + qs("time", notif).textContent : ""
      });
      closeDropdowns();
    });

    /* Global search */
    var form = qs("#globalSearchForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var value = qs("#globalSearch").value.trim();
        window.location.href = BASE + "pages/students.php" + (value ? "?q=" + encodeURIComponent(value) : "");
      });
    }

    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        var input = qs("#globalSearch");
        if (input) {
          e.preventDefault();
          input.focus();
          input.select();
        }
      }
    });
  }

  /* -------------------------------------------------------------------------
     Page meta (title + document title)
     ------------------------------------------------------------------------- */

  function applyPageMeta() {
    var title = document.body.getAttribute("data-title") || "Dashboard";
    document.title = title + " · EduCore Student Management";
  }

  /* -------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------- */

  function boot() {
    if (window.DB && DB.ready && !window.__eduCoreShellReady) {
      window.__eduCoreShellReady = true;
      DB.ready.then(boot).catch(function (error) {
        var page = document.querySelector("main.main .page");
        if (page) page.insertAdjacentHTML("afterbegin", "<div class=\"alert alert--danger\"><div class=\"alert__body\">" + escapeHtml(error.message || "Backend unavailable") + "</div></div>");
        hidePageLoader();
      });
      return;
    }
    ensurePageLoader();
    applyPageMeta();
    renderShell();
    initSidebar();
    initDropdowns();
    initPasswordToggles();
    initShellActions();
    icons(document);
  }

  var API = {
    BASE: BASE,
    qs: qs,
    qsa: qsa,
    icons: icons,
    escapeHtml: escapeHtml,
    debounce: debounce,
    currentUser: currentUser,
    openModal: openModal,
    closeModal: closeModal,
    confirmDialog: confirmDialog,
    toast: toast,
    withLoading: withLoading,
    hidePageLoader: hidePageLoader,
    validateForm: validateForm,
    validateControl: validateControl,
    showControlError: showControlError,
    initLiveValidation: initLiveValidation,
    renderPagination: renderPagination,
    paginationState: paginationState,
    avatarHTML: avatarHTML,
    statusBadge: statusBadge,
    downloadCSV: downloadCSV,
    queryParam: queryParam,
    go: go
  };

  window.App = API;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.addEventListener("load", function () {
    setTimeout(hidePageLoader, 250);
  });
})();
