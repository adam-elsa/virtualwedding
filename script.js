(() => {
  'use strict';

  // ---------- CONFIG ----------
  // TODO: paste your deployed Google Apps Script Web App URL here (see gas/rsvp-endpoint.gs + README).
  const RSVP_ENDPOINT_URL = '';
  const WEDDING_DATE = new Date('2026-10-24T12:30:00+07:00'); // Akad time, used for countdown

  // ---------- guest name from URL ----------
  const params = new URLSearchParams(window.location.search);
  const guest = params.get('to') || params.get('nama');
  if (guest) {
    const el = document.getElementById('guestName');
    if (el) el.textContent = guest;
  }

  // ---------- gate / open invitation ----------
  const gate = document.getElementById('gate');
  const openBtn = document.getElementById('openBtn');
  const siteMain = document.getElementById('siteMain');
  const musicToggle = document.getElementById('musicToggle');
  const bgm = document.getElementById('bgm');
  // phones & tablets (touch is the main input) get the guitar version; computers the orchestra
  const onTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  bgm.src = onTouchDevice ? 'assets/audio/backsound-guitar.mp3' : 'assets/audio/backsound-orchestra.mp3';

  let opening = false;
  function openInvitation() {
    if (opening) return;
    opening = true;
    // music has to start inside the click gesture, before the fly-in
    musicToggle.hidden = false;
    bgm.volume = 0.5;
    bgm.play().catch(() => {
      // autoplay blocked; user can tap the music button manually
      musicToggle.querySelector('.music-icon').classList.add('paused');
    });
    // 3D gate (gate3d.js): the walk up to the hotel with the verse and our story —
    // resolves as the doors open (or right away if the scene never loaded)
    const scene3d = window.weddingGate;
    Promise.resolve(scene3d ? scene3d.flyIn() : null).then(revealSite, revealSite);
  }

  function revealSite() {
    gate.classList.add('gate-hidden');
    siteMain.hidden = false;
    document.body.style.overflow = '';
    setTimeout(() => {
      if (window.weddingGate) window.weddingGate.dispose();
      gate.remove();
    }, 900);
    initReveal();
    updateParallax();
  }

  document.body.style.overflow = 'hidden';
  openBtn.addEventListener('click', openInvitation);
  // if the 3D scene never shows up (no WebGL / CDN blocked), drop the loader
  setTimeout(() => {
    if (!gate.classList.contains('is-ready')) gate.classList.add('no-scene');
  }, 10000);

  musicToggle.addEventListener('click', () => {
    const icon = musicToggle.querySelector('.music-icon');
    if (bgm.paused) {
      bgm.play().catch(() => {});
      icon.classList.remove('paused');
    } else {
      bgm.pause();
      icon.classList.add('paused');
    }
  });

  // ---------- reveal on scroll ----------
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
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  }

  // ---------- parallax (bg layers + floating fx) ----------
  const parallaxEls = () => document.querySelectorAll('[data-parallax]');
  const fxEls = document.querySelectorAll('.fx');
  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY || window.pageYOffset;

    parallaxEls().forEach((el) => {
      const rect = el.parentElement.getBoundingClientRect();
      const offset = (rect.top) * 0.25;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    const pad = 40;
    const span = window.innerHeight + pad * 2;
    fxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.speed || '0.2');
      const base = el.offsetTop; // untransformed position
      // drift upward with scroll, re-entering from the bottom once off the top
      const y = ((((base - scrollY * speed + pad) % span) + span) % span) - pad;
      el.style.transform = `translate3d(0, ${y - base}px, 0)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateParallax);

  // ---------- countdown ----------
  function tickCountdown() {
    const now = new Date();
    let diff = WEDDING_DATE - now;
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

  // ---------- RSVP submit ----------
  const rsvpForm = document.getElementById('rsvpForm');
  const wishesList = document.getElementById('wishesList');

  function renderWish(name, message) {
    if (!message) return;
    const empty = wishesList.querySelector('.wishes-empty');
    if (empty) empty.remove();
    const item = document.createElement('div');
    item.className = 'wish-item';
    const nameEl = document.createElement('p');
    nameEl.className = 'wish-name';
    nameEl.textContent = name;
    const msgEl = document.createElement('p');
    msgEl.className = 'wish-msg';
    msgEl.textContent = message;
    item.appendChild(nameEl);
    item.appendChild(msgEl);
    wishesList.prepend(item);
  }

  async function loadWishes() {
    if (!RSVP_ENDPOINT_URL) return;
    try {
      const res = await fetch(RSVP_ENDPOINT_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        data
          .filter((row) => row.message)
          .forEach((row) => renderWish(row.name, row.message));
      }
    } catch (err) {
      // silently ignore; guestbook is a nice-to-have
    }
  }
  loadWishes();

  function wireRsvp(form) {
    if (!form) return;
    const status = form.querySelector('.rsvp-status');
    if (guest && form.elements.name && !form.elements.name.value) form.elements.name.value = guest;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const payload = {
        name: formData.get('name'),
        attendance: formData.get('attendance'),
        guests: formData.get('guests'),
        message: formData.get('message'),
      };

      status.textContent = 'Mengirim...';
      status.className = 'rsvp-status';

      if (!RSVP_ENDPOINT_URL) {
        // no backend configured yet — show locally so the form still feels alive
        renderWish(payload.name, payload.message);
        status.textContent = 'Terima kasih! (mode pratinjau — belum tersambung ke Google Sheet)';
        status.className = 'rsvp-status ok';
        form.reset();
        return;
      }

      try {
        await fetch(RSVP_ENDPOINT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload),
        });
        renderWish(payload.name, payload.message);
        status.textContent = 'Terima kasih atas konfirmasinya!';
        status.className = 'rsvp-status ok';
        form.reset();
      } catch (err) {
        status.textContent = 'Gagal mengirim. Silakan coba lagi.';
        status.className = 'rsvp-status err';
      }
    });
  }
  wireRsvp(rsvpForm);

  // ---------- copy gift number ----------
  function wireCopy(btn, numberEl) {
    if (!btn || !numberEl) return;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(numberEl.textContent.trim());
        btn.textContent = 'Tersalin!';
        setTimeout(() => (btn.textContent = 'Salin Nomor Rekening'), 1800);
      } catch (err) {
        // clipboard blocked — no-op
      }
    });
  }
  wireCopy(document.getElementById('copyGift'), document.getElementById('giftNumber'));
})();
