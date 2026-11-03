(function () {
  'use strict';
  if (!window.DB) return;

  var page = document.body;
  var mode = page.dataset.cardMode;
  var reg = page.dataset.registrationNumber || '';
  var pair = document.getElementById('cardPair');
  var empty = document.getElementById('cardEmpty');
  var downloadButton = document.getElementById('downloadCard');

  function byId(id) { return document.getElementById(id); }
  function set(id, value) { byId(id).textContent = value || '—'; }
  function date(value) {
    if (!value) return '—';
    var d = new Date(value + 'T00:00:00');
    return isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function unavailable(message) {
    byId('emptyMessage').textContent = message;
    empty.hidden = false;
    pair.hidden = true;
  }
  function notice(message, type) {
    var alert = byId('cardAlert');
    if (window.App && typeof App.toast === 'function') {
      App.toast({ type: type === 'error' ? 'danger' : 'success', title: type === 'error' ? 'PDF download failed' : 'PDF ready', message: message });
    } else if (alert) {
      alert.textContent = message;
      alert.className = 'id-card-alert id-card-alert--' + (type || 'success');
      alert.hidden = false;
    }
  }
  function waitForImage(image) {
    if (image.hidden || !image.src || image.complete) return Promise.resolve();
    return new Promise(function (resolve) {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }

  async function load() {
    if (mode === 'student' && (!DB.currentUser || DB.currentUser.role !== 'Student')) {
      location.href = DB.BASE + 'index.php';
      return;
    }
    var url = mode === 'student'
      ? 'api/student-id-cards.php?action=mine'
      : 'api/student-id-cards.php?action=card&registration_number=' + encodeURIComponent(reg);
    var response = await DB.request(url);
    if (!response.ok) {
      unavailable(response.error || 'This ID card is not available.');
      return;
    }
    var c = response.card;
    set('cardName', c.full_name);
    set('cardNumber', c.card_number);
    set('cardReg', c.registration_number);
    set('cardDepartment', c.department);
    set('cardProgram', c.program);
    set('cardSemester', c.semester);
    set('cardSession', c.session_year);
    set('cardIssue', date(c.issue_date));
    set('cardExpiry', date(c.expiry_date));
    set('backCardNumber', c.card_number);
    set('cardStatus', c.card_status);
    byId('cardStatus').className = 'id-status id-status--' + c.card_status.toLowerCase();

    var initials = DB.initials(c.full_name);
    byId('photoFallback').textContent = initials;
    if (c.photo_path) {
      var photo = byId('cardPhoto');
      photo.src = DB.BASE + c.photo_path;
      photo.hidden = false;
      photo.onerror = function () { photo.hidden = true; byId('photoFallback').hidden = false; };
      await waitForImage(photo);
    } else {
      byId('cardPhoto').hidden = true;
    }
    byId('photoFallback').hidden = Boolean(c.photo_path && !byId('cardPhoto').hidden);

    var verifyUrl = new URL(DB.BASE + 'pages/verify-student-id.php?token=' + encodeURIComponent(c.qr_token), location.href).href;
    byId('verifyLink').href = verifyUrl;
    if (typeof window.qrcode === 'function') {
      var qr = window.qrcode(0, 'H');
      qr.addData(verifyUrl);
      qr.make();
      byId('qrCode').innerHTML = qr.createSvgTag({ cellSize: 3, margin: 2, scalable: true });
    } else {
      byId('qrCode').textContent = 'QR code could not be loaded. Check your internet connection and refresh.';
      byId('qrCode').classList.add('qr-error');
    }
    pair.hidden = false;
    if (window.lucide) lucide.createIcons();
    var query = new URLSearchParams(location.search);
    if (query.get('print') === '1') setTimeout(function () { window.print(); }, 450);
    else if (query.get('download') === '1') setTimeout(downloadPdf, 450);
  }

  async function downloadPdf() {
    if (!downloadButton || downloadButton.disabled) return;
    if (typeof window.html2canvas !== 'function' || !window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
      notice('The PDF tools could not be loaded. Check your internet connection and try again.', 'error');
      return;
    }

    var originalMarkup = downloadButton.innerHTML;
    downloadButton.disabled = true;
    downloadButton.textContent = 'Preparing PDF…';
    page.classList.add('id-card-pdf-mode');

    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      var cards = Array.prototype.slice.call(pair.querySelectorAll('.id-card'));
      if (cards.length !== 2) throw new Error('Both sides of the student ID card must be visible before downloading.');
      var images = Array.prototype.slice.call(pair.querySelectorAll('img')).filter(function (image) { return !image.hidden; });
      await Promise.all(images.map(waitForImage));
      await new Promise(function (resolve) { requestAnimationFrame(function () { requestAnimationFrame(resolve); }); });

      var cardWidth = 85.6;
      var cardHeight = 54;
      var gap = 5;
      var pdf = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: [cardWidth * 2 + gap, cardHeight], compress: true });
      for (var i = 0; i < cards.length; i++) {
        var canvas = await window.html2canvas(cards[i], {
          scale: 3,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: false,
          logging: false
        });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.96), 'JPEG', i * (cardWidth + gap), 0, cardWidth, cardHeight, undefined, 'FAST');
      }

      var safeName = (byId('cardReg').textContent + '_' + byId('cardName').textContent)
        .replace(/[^a-z0-9._-]+/gi, '_').replace(/^_+|_+$/g, '');
      pdf.save((safeName || 'student-id-card') + '.pdf');
      notice('Your PDF contains the front and back of the ID card.', 'success');
    } catch (error) {
      notice(error && error.message ? error.message : 'The ID card PDF could not be created. Please try again.', 'error');
    } finally {
      page.classList.remove('id-card-pdf-mode');
      downloadButton.disabled = false;
      downloadButton.innerHTML = originalMarkup;
      if (window.lucide) lucide.createIcons({ root: downloadButton });
    }
  }

  DB.ready.then(load).catch(function (error) { unavailable(error.message || 'The ID card could not be loaded.'); });
  var printButton = byId('printCard');
  if (printButton) printButton.addEventListener('click', function () { window.print(); });
  if (downloadButton) downloadButton.addEventListener('click', downloadPdf);
})();
