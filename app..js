/*  MOKA — app.js
    Shared JavaScript. All pages also embed this inline for self-sufficiency.
    ======================================================================== */

/* ── TOUCH DETECTION ─────────────────────────────────────── */
const IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

/* ── CURSOR (desktop only) ────────────────────────────────── */
function initCursor() {
  if (IS_TOUCH) return; // skip on phones/tablets
  const dot  = document.querySelector('.cursor__dot');
  const ring = document.querySelector('.cursor__ring');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('click'));

  (function tick() {
    rx += (mx - rx) * .11; ry += (my - ry) * .11;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a,button,[data-hover],.menu-card,.feature-item,.team-card,.value-card,.bean-card,.social-card,.info-card,.step').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

/* ── NAVBAR ──────────────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const u = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', u, { passive: true }); u();

  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
}

/* ── BURGER MENU ─────────────────────────────────────────── */
function initBurger() {
  const burger  = document.getElementById('nav-burger');
  const mNav    = document.getElementById('mobile-nav');
  const overlay = document.getElementById('mobile-overlay');
  const close   = document.getElementById('mobile-close');
  if (!burger || !mNav) return;

  const open  = () => { burger.classList.add('open'); mNav.classList.add('open'); overlay?.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const shut  = () => { burger.classList.remove('open'); mNav.classList.remove('open'); overlay?.classList.remove('open'); document.body.style.overflow = ''; };

  burger.addEventListener('click', open);
  close?.addEventListener('click', shut);
  overlay?.addEventListener('click', shut);
  document.querySelectorAll('.mobile-nav-links a').forEach(a => a.addEventListener('click', shut));
}

/* ── LANGUAGE TOGGLE ─────────────────────────────────────── */
const MARQUEE_EN = ['Specialty Coffee','Single Origin','Ethically Sourced','Small Batch Roasted','Direct Trade','Est. 2018','Jeddah KSA'];
const MARQUEE_AR = ['قهوة متخصصة','مصدر مباشر','تجارة عادلة','تحميص صغير','جدة، المملكة','منذ ٢٠١٨','موكا ☕'];

function switchLang(lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir  = lang === 'ar' ? 'rtl' : 'ltr';

  // Update .i18n elements
  document.querySelectorAll('[data-en][data-ar]').forEach(el => {
    el.textContent = lang === 'ar' ? el.dataset.ar : el.dataset.en;
  });

  // Update all lang toggle buttons
  document.querySelectorAll('.lang-toggle, .mobile-lang-btn').forEach(btn => {
    btn.textContent = lang === 'ar' ? 'EN' : 'عربي';
  });

  // Rebuild marquee for the new lang
  const track = document.getElementById('marquee-track');
  if (track) {
    track.innerHTML = '';
    const words = lang === 'ar' ? MARQUEE_AR : MARQUEE_EN;
    for (let i = 0; i < 5; i++) {
      words.forEach(w => {
        const el = document.createElement('div');
        el.className = 'marquee-item';
        el.innerHTML = w + '<span class="marquee-dot"></span>';
        track.appendChild(el);
      });
    }
  }

  // Cursor: disable in Arabic/touch-like RTL experience
  const cursor = document.getElementById('cursor');
  if (cursor) cursor.style.display = lang === 'ar' ? 'none' : '';
  document.body.style.cursor = lang === 'ar' ? 'auto' : (IS_TOUCH ? 'auto' : 'none');

  localStorage.setItem('moka-lang', lang);
}

function initLang() {
  document.querySelectorAll('.lang-toggle, .mobile-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = document.documentElement.lang || 'en';
      switchLang(cur === 'ar' ? 'en' : 'ar');
    });
  });

  const saved = localStorage.getItem('moka-lang');
  if (saved === 'ar') switchLang('ar');
}

/* ── MARQUEE ─────────────────────────────────────────────── */
function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const words = MARQUEE_EN;
  for (let i = 0; i < 5; i++) {
    words.forEach(w => {
      const el = document.createElement('div');
      el.className = 'marquee-item';
      el.innerHTML = w + '<span class="marquee-dot"></span>';
      track.appendChild(el);
    });
  }
}

/* ── SCROLL REVEALS ──────────────────────────────────────── */
function initReveals() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
}

/* ── TESTIMONIALS ────────────────────────────────────────── */
function initTestimonials() {
  const slides = document.querySelectorAll('.testimonial');
  const dots   = document.querySelectorAll('.t-dot');
  if (!slides.length) return;
  let cur = 0;
  const goTo = i => {
    slides[cur].classList.remove('active'); dots[cur]?.classList.remove('active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('active'); dots[cur]?.classList.add('active');
  };
  let t = setInterval(() => goTo(cur + 1), 5000);
  dots.forEach(d => d.addEventListener('click', () => { clearInterval(t); goTo(+d.dataset.i); t = setInterval(() => goTo(cur + 1), 5000); }));
}

/* ── MENU FILTER ─────────────────────────────────────────── */
function initMenuFilter() {
  const tabs  = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.menu-card[data-cat]');
  if (!tabs.length) return;
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.cat;
    cards.forEach(c => { c.style.display = (cat === 'all' || c.dataset.cat === cat) ? '' : 'none'; });
  }));
}

/* ── COUNTERS ────────────────────────────────────────────── */
function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '';
      let cur = 0; const inc = end / 80;
      const tick = setInterval(() => { cur = Math.min(cur + inc, end); el.textContent = (Number.isInteger(end) ? Math.round(cur) : cur.toFixed(1)) + suffix; if (cur >= end) clearInterval(tick); }, 16);
      io.unobserve(el);
    });
  }, { threshold: .5 });
  els.forEach(el => io.observe(el));
}

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initBurger();
  initMarquee();
  initLang();
  initReveals();
  initTestimonials();
  initMenuFilter();
  initCounters();
});