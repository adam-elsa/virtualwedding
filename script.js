(() => {
  'use strict';

  // ---------- CONFIG ----------
  // TODO: paste your deployed Google Apps Script Web App URL here (see gas/rsvp-endpoint.gs + README).
  const RSVP_ENDPOINT_URL = '';
  // RSVPs also go to the RSVP form (Fluent Forms #705) on our NgantenStory invitation,
  // inv.nstory.id/adam-elsa, so they land in the same entries list as RSVPs made there.
  // Set to '' to stop sending there.
  const NSTORY_AJAX_URL = 'https://inv.nstory.id/wp-admin/admin-ajax.php';
  const NSTORY_FORM_ID = '705';
  const NSTORY_POST_ID = '25279687'; // the adam-elsa page
  // Guestbook messages also go to the invitation's guestbook (CommentPress = WordPress comments
  // on that page), where they show publicly with the others. Set to '' to stop.
  const NSTORY_COMMENTS_URL = 'https://inv.nstory.id/wp-comments-post.php';
  const WEDDING_DATE = new Date('2026-10-24T12:30:00+07:00'); // Akad time, used for countdown

  // ---------- guest name from URL ----------
  const params = new URLSearchParams(window.location.search);
  const guest = params.get('to') || params.get('nama');
  if (guest) {
    // the 3D opener's greeting, and "Dear, <name>" on the 2D cover
    document.querySelectorAll('[data-guest], [data-guest-dear]').forEach((el) => { el.textContent = guest; });
  }

  // ---------- opening ----------
  const gate = document.getElementById('gate');
  const openBtn = document.getElementById('openBtn');
  const welcomeGate = document.getElementById('welcomeGate');
  const siteMain = document.getElementById('siteMain');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = musicToggle.querySelector('.music-icon');
  const bgm = document.getElementById('bgm');

  // music has to start inside a tap
  function startMusic() {
    musicToggle.hidden = false;
    bgm.volume = 0.5;
    bgm.play().then(
      () => musicIcon.classList.remove('paused'),
      () => musicIcon.classList.add('paused') // autoplay blocked; the guest can tap the disc
    );
  }

  let opening = false;
  function openInvitation() {
    if (opening) return;
    opening = true;
    startMusic();
    // 3D gate (gate3d.js): the walk up to the hotel with the verse and our story —
    // resolves as the doors open (or right away if the scene never loaded)
    const scene3d = window.weddingGate;
    Promise.resolve(scene3d ? scene3d.flyIn() : null).then(revealSite, revealSite);
  }

  function revealSite() {
    gate.classList.add('gate-hidden');
    siteMain.hidden = false;
    document.body.style.overflow = '';
    window.scrollTo(0, 0);
    setTimeout(() => {
      if (window.weddingGate) window.weddingGate.dispose();
      gate.remove();
    }, 900);
    initReveal();
  }

  musicToggle.addEventListener('click', () => {
    if (bgm.paused) {
      bgm.play().then(() => musicIcon.classList.remove('paused'), () => {});
    } else {
      bgm.pause();
      musicIcon.classList.add('paused');
    }
  });

  // ---------- entrance animations ----------
  let revealObserver;
  function initReveal() {
    if (revealObserver) return;
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.anim-up, .anim-left, .anim-fade, .anim-zoom, .anim-draw')
      .forEach((el) => revealObserver.observe(el));
  }

  // ---------- countdown ----------
  function tickCountdown() {
    let diff = WEDDING_DATE - new Date();
    if (diff < 0) diff = 0;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val).padStart(2, '0');
    };
    set('cd-days', days);
    set('cd-hours', hours);
    set('cd-mins', mins);
    set('cd-secs', secs);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  // ---------- guestbook ----------
  const wishesList = document.getElementById('wishesList');

  // "1 hour, 37 mins ago", like the template's comment plugin
  function timeAgo(date) {
    const mins = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
    if (mins < 1) return 'just now';
    if (mins < 60) return `${plural(mins, 'min')} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${plural(hours, 'hour')}, ${plural(mins % 60, 'min')} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${plural(days, 'day')}, ${plural(hours % 24, 'hour')} ago`;
    const weeks = Math.floor(days / 7);
    if (days < 30) return `${plural(weeks, 'week')}, ${plural(days % 7, 'day')} ago`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function renderWish(name, message, time, toTop) {
    if (!message) return;
    const item = document.createElement('li');
    item.className = 'inv-wish';
    const head = document.createElement('p');
    head.className = 'inv-wish-head';
    const nameEl = document.createElement('span');
    nameEl.className = 'inv-wish-name';
    nameEl.textContent = name || 'Tamu';
    head.appendChild(nameEl);
    const when = time ? new Date(time) : null;
    if (when && !isNaN(when)) {
      const timeEl = document.createElement('span');
      timeEl.className = 'inv-wish-time';
      timeEl.textContent = timeAgo(when);
      head.appendChild(timeEl);
    }
    item.appendChild(head);
    // first line dark, the rest a softer grey, as in the template
    String(message).split(/\n+/).filter(Boolean).forEach((line) => {
      const msgEl = document.createElement('p');
      msgEl.className = 'inv-wish-msg';
      msgEl.textContent = line;
      item.appendChild(msgEl);
    });
    if (toTop) wishesList.prepend(item); else wishesList.appendChild(item);
  }

  async function loadWishes() {
    if (!RSVP_ENDPOINT_URL) return;
    try {
      const res = await fetch(RSVP_ENDPOINT_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        // newest first
        data.filter((row) => row.message).reverse()
          .forEach((row) => renderWish(row.name, row.message, row.time, false));
      }
    } catch (err) {
      // silently ignore; guestbook is a nice-to-have
    }
  }
  loadWishes();

  async function send(payload) {
    if (!RSVP_ENDPOINT_URL) return 'preview';
    await fetch(RSVP_ENDPOINT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });
    return 'sent';
  }

  // Same request the invitation's own form makes: admin-ajax, action=fluentform_submit, the
  // form's fields serialized into `data`. Cross-site, so the reply can't be read ('no-cors'):
  // this only fails on a network error, not if the invitation turns the entry down.
  async function sendToNstory(rsvp) {
    if (!NSTORY_AJAX_URL) return;
    const fields = new URLSearchParams({
      __fluent_form_embded_post_id: NSTORY_POST_ID,
      _wp_http_referer: '/adam-elsa/',
      input_text: rsvp.name,
      input_radio: rsvp.attendance === 'Hadir' ? 'Saya akan hadir' : 'Maaf tidak hadir',
    });
    // the invitation only asks "Jumlah Tamu" (1 or 2) of guests who are coming
    if (rsvp.attendance === 'Hadir') fields.set('dropdown', rsvp.guests);
    await fetch(NSTORY_AJAX_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams({ data: fields.toString(), action: 'fluentform_submit', form_id: NSTORY_FORM_ID }),
    });
  }

  // Same fields the invitation's guestbook form posts, including its fixed anti-spam fields
  // (name=username, nombre and form-saic left empty). Also no-cors: the reply can't be read.
  async function sendWishToNstory(name, message) {
    if (!NSTORY_COMMENTS_URL) return;
    await fetch(NSTORY_COMMENTS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams({
        author: name.replace(/[?%$=\/]/g, '').slice(0, 80), // the guestbook refuses these characters
        email: 'anonymous@wordpress.com',
        comment: message,
        name: 'username',
        nombre: '',
        'form-saic': '',
        submit: 'Kirim',
        commentpress: 'true',
        comment_post_ID: NSTORY_POST_ID,
        comment_parent: '0',
        comment_press: 'true',
      }),
    });
  }

  // ---------- RSVP ----------
  const rsvpForm = document.getElementById('rsvpForm');
  if (guest && !rsvpForm.elements.name.value) rsvpForm.elements.name.value = guest;
  // "Jumlah Tamu" only for guests who are coming, as on the invitation
  const guestsGroup = rsvpForm.querySelector('.ff-guests');
  const syncGuests = () => { guestsGroup.hidden = rsvpForm.elements.attendance.value !== 'Hadir'; };
  rsvpForm.addEventListener('change', syncGuests);
  syncGuests();
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = rsvpForm.querySelector('.rsvp-status');
    const name = rsvpForm.elements.name.value.trim();
    if (!name) {
      status.textContent = 'Mohon isi nama Anda.';
      status.className = 'rsvp-status err';
      rsvpForm.elements.name.focus();
      return;
    }
    status.textContent = 'Mengirim...';
    status.className = 'rsvp-status';
    const rsvp = {
      name,
      attendance: rsvpForm.elements.attendance.value,
      guests: rsvpForm.elements.guests.value,
      message: '',
    };
    try {
      const [toSheet] = await Promise.all([send(rsvp), sendToNstory(rsvp)]);
      status.textContent = toSheet === 'preview' && !NSTORY_AJAX_URL
        ? 'Terima kasih! (mode pratinjau — belum tersambung ke Google Sheet)'
        : 'Terima kasih atas konfirmasinya!';
      status.className = 'rsvp-status ok';
    } catch (err) {
      status.textContent = 'Gagal mengirim. Silakan coba lagi.';
      status.className = 'rsvp-status err';
    }
  });

  const wishForm = document.getElementById('wishForm');
  if (guest && !wishForm.elements.name.value) wishForm.elements.name.value = guest;
  wishForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = wishForm.querySelector('.rsvp-status');
    const name = wishForm.elements.name.value.trim();
    const message = wishForm.elements.message.value.trim();
    if (!name || message.length < 2) return; // the invitation's guestbook needs 2+ characters
    status.textContent = 'Mengirim...';
    status.className = 'rsvp-status';
    try {
      const [toSheet] = await Promise.all([
        send({ name, attendance: '', guests: '', message }),
        sendWishToNstory(name, message),
      ]);
      renderWish(name, message, new Date().toISOString(), true);
      wishForm.elements.message.value = '';
      status.textContent = toSheet === 'preview' && !NSTORY_COMMENTS_URL ? 'Terima kasih! (mode pratinjau)' : '';
      status.className = 'rsvp-status ok';
    } catch (err) {
      status.textContent = 'Gagal mengirim. Silakan coba lagi.';
      status.className = 'rsvp-status err';
    }
  });

  // ---------- bank transfer popup ----------
  const giftPopup = document.getElementById('giftPopup');
  const openGift = document.getElementById('openGift');
  function showGift() {
    giftPopup.hidden = false;
    requestAnimationFrame(() => giftPopup.classList.add('is-open'));
    giftPopup.querySelector('.inv-popup-close').focus();
  }
  function hideGift() {
    giftPopup.classList.remove('is-open');
    setTimeout(() => { giftPopup.hidden = true; }, 400);
    openGift.focus();
  }
  openGift.addEventListener('click', showGift);
  giftPopup.addEventListener('click', (e) => {
    if (e.target === giftPopup || e.target.closest('.inv-popup-close')) hideGift();
  });

  const copyBtn = document.getElementById('copyGift');
  copyBtn.addEventListener('click', async () => {
    const label = copyBtn.querySelector('span');
    try {
      await navigator.clipboard.writeText(document.getElementById('giftNumber').textContent.trim());
      label.textContent = 'Copied!';
      setTimeout(() => (label.textContent = 'Copy'), 1500);
    } catch (err) {
      // clipboard blocked — no-op
    }
  });

  // ---------- gallery lightbox ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('img');
  document.querySelectorAll('.inv-gallery-item').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      lightboxImg.src = link.getAttribute('href');
      lightbox.hidden = false;
    });
  });
  lightbox.addEventListener('click', () => { lightbox.hidden = true; lightboxImg.removeAttribute('src'); });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!giftPopup.hidden) hideGift();
    if (!lightbox.hidden) lightbox.click();
  });

  // ---------- which cover ----------
  if (params.has('simple')) {
    // ?simple (e.g. ?to=Nama+Tamu&simple): no 3D opener; the template's own 2D cover instead
    // (runs before gate3d.js, which then finds no gate). Tapping anywhere on it slides it up
    // and starts the music.
    gate.remove();
    siteMain.hidden = false;
    welcomeGate.hidden = false;
    document.body.style.overflow = 'hidden';
    let opened = false;
    welcomeGate.addEventListener('click', () => {
      if (opened) return;
      opened = true;
      window.scrollTo(0, 0);
      welcomeGate.classList.add('move-gate');
      document.body.style.overflow = '';
      startMusic();
      initReveal();
      setTimeout(() => welcomeGate.remove(), 1100);
    });
  } else {
    welcomeGate.remove();
    document.body.style.overflow = 'hidden';
    openBtn.addEventListener('click', openInvitation);
    // if the 3D scene never shows up (no WebGL / CDN blocked), drop the loader
    setTimeout(() => {
      if (!gate.classList.contains('is-ready')) gate.classList.add('no-scene');
    }, 10000);
  }
})();
