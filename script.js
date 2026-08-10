const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Scrollspy: highlight active nav link
const sections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => spyObserver.observe(s));

// Stagger sibling reveals within the same grid so cards in a row don't pop in as one flat block
['.card-grid', '.depth-grid', '.stack-grid'].forEach(sel => {
  document.querySelectorAll(sel).forEach(grid => {
    [...grid.children].forEach((child, i) => {
      child.style.transitionDelay = `${Math.min(i, 3) * 90}ms`;
    });
  });
});

// Count-up animation for metric numbers, e.g. "60+" -> counts 0..60 then settles on "60+"
function animateCount(el) {
  if (prefersReducedMotion || el.dataset.counted) return;
  const text = el.textContent.trim();
  const match = text.match(/^([<>-]?)(\d+)(.*)$/);
  if (!match) return;
  const [, prefix, numStr, suffix] = match;
  const target = parseInt(numStr, 10);
  if (Number.isNaN(target)) return;
  el.dataset.counted = 'true';
  const duration = 800;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = text;
  }
  requestAnimationFrame(tick);
}

// Fill a progress-style bar from 0 to its data-w value
function animateBar(el) {
  const w = el.dataset.w;
  if (!w || el.dataset.filled) return;
  el.dataset.filled = 'true';
  if (prefersReducedMotion) { el.style.width = w; return; }
  requestAnimationFrame(() => { el.style.width = w; });
}

// Pop each trajectory node in sequence, drawing the path left to right
function animateStepper(container) {
  if (container.dataset.animated) return;
  container.dataset.animated = 'true';
  const nodes = container.querySelectorAll('.traj-node');
  if (prefersReducedMotion) { nodes.forEach(n => n.classList.add('in')); return; }
  nodes.forEach((node, i) => setTimeout(() => node.classList.add('in'), i * 180));
}

// Reveal-on-scroll, with section-specific flourishes layered on top
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      el.classList.add('in');
      revealObserver.unobserve(el);

      el.querySelectorAll('.stat-tile b, .card .stat b, .hp-facts .f b').forEach(animateCount);
      el.querySelectorAll('.comp-seg, .compare-track .after').forEach(animateBar);
      if (el.classList.contains('traj-path')) animateStepper(el);
    }
  });
}, { threshold: 0.01, rootMargin: '0px 0px 150px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// The hero panel is above the fold, so its numbers count up shortly after load rather than on scroll
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelectorAll('.hp-facts .f b').forEach(animateCount);
  }, 400);
});
