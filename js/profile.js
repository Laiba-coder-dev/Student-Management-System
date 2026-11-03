/* ==========================================================================
   profile.js — profile settings: account details, security, notifications
   ========================================================================== */

(function () {
  "use strict";

  if (!window.App || !window.DB) return;

  var user = App.currentUser();
  var originalPhoto = null;

  var els = {
    avatar: document.getElementById("profileAvatar"),
    name: document.getElementById("profileName"),
    role: document.getElementById("profileRole"),
    email: document.getElementById("profileEmail"),
    since: document.getElementById("profileSince"),
    form: document.getElementById("accountForm"),
    passwordForm: document.getElementById("passwordForm"),
    fullName: document.getElementById("pName"),
    accountEmail: document.getElementById("pEmail"),
    phone: document.getElementById("pPhone"),
    department: document.getElementById("pDepartment"),
    bio: document.getElementById("pBio")
  };

  /* ---- Initial render -------------------------------------------------------- */

  function fillDepartment() {
    if (!els.department) return;
    els.department.innerHTML =
      '<option value="">Not assigned</option>' +
      DB.departments.map(function (d) {
        return '<option value="' + App.escapeHtml(d) + '">' + App.escapeHtml(d) + "</option>";
      }).join("");
  }

  function renderIdentity() {
    els.avatar.textContent = user.initials;
    els.avatar.style.background = user.color;
    if (user.photo) {
      els.avatar.innerHTML = '<img src="' + user.photo + '" alt="' + App.escapeHtml(user.name) + '" />';
    }
    els.name.textContent = user.name;
    els.role.textContent = user.role + " · " + DB.UNIVERSITY;
    els.email.textContent = user.email;
    if (els.since) els.since.textContent = DB.formatDate(user.joined, "long");

    /* Keep the topbar in sync */
    var triggerName = document.querySelector(".user-trigger__meta strong");
    if (triggerName) triggerName.textContent = user.name;
    var triggerRole = document.querySelector(".user-trigger__meta span");
    if (triggerRole) triggerRole.textContent = user.role;
    var head = document.querySelector(".dropdown__head strong");
    if (head) head.textContent = user.name;
  }

  function loadFormValues() {
    els.fullName.value = user.name || "";
    els.accountEmail.value = user.email || "";
    els.phone.value = user.phone || "";
    els.bio.value = user.bio || "";
    if (user.department) els.department.value = user.department;
    updateBioCount();
    updateStrength();
  }

  function updateBioCount() {
    var counter = document.getElementById("bioCount");
    if (counter) counter.textContent = String(els.bio.value.length);
  }

  function updateStrength() {
    var filled = 0;
    var total = 5;
    if (user.name) filled++;
    if (user.email) filled++;
    if (els.phone.value.trim()) filled++;
    if (els.bio.value.trim()) filled++;
    if (user.photo) filled++;

    var pct = Math.round((filled / total) * 100);
    var label = document.getElementById("strengthLabel");
    var bar = document.getElementById("strengthBar");
    if (label) label.textContent = pct + "%";
    if (bar) bar.style.width = pct + "%";
  }

  /* ---- Tabs ------------------------------------------------------------------- */

  function initTabs() {
    var tabs = document.querySelectorAll("[data-tab]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");
        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });
        document.querySelectorAll(".tab-panel").forEach(function (panel) {
          panel.classList.toggle("is-active", panel.id === "tab-" + target);
        });
      });
    });
  }

  /* ---- Account form ------------------------------------------------------------ */

  function initAccountForm() {
    App.initLiveValidation(els.form);

    els.bio.addEventListener("input", updateBioCount);

    els.form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!App.validateForm(els.form)) {
        App.toast({
          type: "danger",
          title: "Check your details",
          message: "Please correct the highlighted fields."
        });
        return;
      }

      var profileData={name:els.fullName.value.trim(),email:els.accountEmail.value.trim(),phone:els.phone.value.trim(),bio:els.bio.value.trim(),department:els.department.value};
      App.withLoading(document.getElementById("saveAccount"), "Saving…", 250, function () {
        DB.saveProfile(profileData).then(function(result){if(!result.ok){App.toast({type:"danger",title:"Profile not saved",message:result.error});return;}user.name=profileData.name;user.email=profileData.email;user.phone=profileData.phone;user.bio=profileData.bio;user.department=profileData.department;user.initials=DB.initials(user.name);renderIdentity();updateStrength();App.toast({type:"success",title:"Profile updated",message:"Your account details were saved."});}).catch(function(error){App.toast({type:"danger",title:"Profile not saved",message:error.message});});
      });
    });

    document.getElementById("cancelAccount").addEventListener("click", function () {
      loadFormValues();
      App.qsa(".field", els.form).forEach(function (f) {
        f.classList.remove("is-invalid", "is-valid");
      });
      App.toast({ type: "info", title: "Changes discarded", message: "Your saved details were restored." });
    });
  }

  /* ---- Security ----------------------------------------------------------------- */

  function initSecurity() {
    App.initLiveValidation(els.passwordForm);

    els.passwordForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!App.validateForm(els.passwordForm)) {
        App.toast({
          type: "danger",
          title: "Password not updated",
          message: "Review the highlighted fields and try again."
        });
        return;
      }

      var currentPassword=document.getElementById("currentPassword").value,newPassword=document.getElementById("newPassword").value;
      App.withLoading(document.getElementById("savePassword"), "Updating…", 250, function () {
        DB.saveProfile({name:user.name,email:user.email,phone:user.phone,bio:user.bio,department:user.department,currentPassword:currentPassword,newPassword:newPassword}).then(function(result){if(!result.ok){App.toast({type:"danger",title:"Password not updated",message:result.error});return;}els.passwordForm.reset();App.qsa(".field",els.passwordForm).forEach(function(f){f.classList.remove("is-invalid","is-valid");});App.toast({type:"success",title:"Password updated",message:"Use your new password the next time you sign in."});}).catch(function(error){App.toast({type:"danger",title:"Password not updated",message:error.message});});
      });
    });

    /* Protection switches */
    document.querySelectorAll("[data-switch-label]").forEach(function (input) {
      input.addEventListener("change", function () {
        var label = input.getAttribute("data-switch-label");
        App.toast({
          type: input.checked ? "success" : "info",
          title: label,
          message: input.checked ? "Enabled for your account." : "Disabled for your account.",
          duration: 2600
        });
      });
    });

    /* Sign out everywhere */
    var signOutAll = document.getElementById("signOutAll");
    if (signOutAll) {
      signOutAll.addEventListener("click", function () {
        App.confirmDialog({
          title: "Sign out on all devices?",
          desc: "Every active session will be closed immediately.",
          icon: "log-out",
          tone: "warning",
          confirmText: "Sign out everywhere",
          onConfirm: function () {
            DB.logout().then(function(result){if(!result.ok){App.toast({type:"danger",title:"Sign out failed",message:result.error});return;}App.toast({type:"success",title:"Signed out",message:"Your current session has ended."});setTimeout(function(){App.go("index.php");},350);});
          }
        });
      });
    }
  }

  /* ---- Notifications ------------------------------------------------------------- */

  function initPreferences() {
    var saveBtn = document.getElementById("savePrefs");
    if (!saveBtn) return;
    saveBtn.addEventListener("click", function () {
      App.withLoading(saveBtn, "Saving…", 800, function () {
        App.toast({
          type: "success",
          title: "Preferences saved",
          message: "Notification settings were updated."
        });
      });
    });
  }

  /* ---- Photo ---------------------------------------------------------------------- */

  function initPhoto() {
    var input = document.getElementById("profilePhoto");
    var remove = document.getElementById("removePhoto");

    if (input) {
      input.addEventListener("change", function () {
        var file = input.files && input.files[0];
        if (!file) return;
        if (!/^image\//.test(file.type) || file.size > 2 * 1024 * 1024) {
          App.toast({
            type: "warning",
            title: "Invalid photo",
            message: "Choose an image smaller than 2 MB."
          });
          input.value = "";
          return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
          user.photo = e.target.result;
          renderIdentity();
          updateStrength();
          App.toast({ type: "success", title: "Photo updated", message: "Your new picture is live." });
        };
        reader.readAsDataURL(file);
      });
    }

    if (remove) {
      remove.addEventListener("click", function () {
        if (!user.photo && !originalPhoto) {
          App.toast({ type: "info", title: "No photo", message: "Initials are already in use." });
          return;
        }
        user.photo = null;
        renderIdentity();
        updateStrength();
        App.toast({ type: "info", title: "Photo removed", message: "Your initials are shown instead." });
      });
    }
  }

  /* ---- Boot ------------------------------------------------------------------------ */

  function init() {
    fillDepartment();
    renderIdentity();
    loadFormValues();
    initTabs();
    initAccountForm();
    initSecurity();
    initPreferences();
    initPhoto();
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
