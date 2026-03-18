/* ═══════════════════════════════════════════════════════════════════
   Motorsports Development Timeline — timeline.js
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Progress bar on scroll ─────────────────────────────────────── */
  const progressWrap = document.createElement('div');
  progressWrap.className = 'progress-bar-wrap';
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressWrap.appendChild(progressBar);
  document.body.prepend(progressWrap);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });

  /* ── Scroll-in animation via IntersectionObserver ───────────────── */
  const cards = Array.from(document.querySelectorAll('.phase-card'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  cards.forEach((card, i) => {
    card.style.transitionDelay = Math.min(i * 0.04, 0.3) + 's';
    observer.observe(card);
  });

  /* ── Filter buttons ─────────────────────────────────────────────── */
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const timeline   = document.getElementById('timeline');

  // Build or get empty-state element
  let emptyState = document.querySelector('.empty-state');
  if (!emptyState) {
    emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No phases match the selected filter.';
    timeline.after(emptyState);
  }

  function applyFilter(filter) {
    let visibleCount = 0;

    cards.forEach(card => {
      const status = card.dataset.status || '';
      const tags   = (card.dataset.tags || '').split(' ');

      let show = false;
      if (filter === 'all') {
        show = true;
      } else if (filter === 'completed') {
        show = status === 'completed';
      } else if (filter === 'wip') {
        show = status === 'wip';
      } else if (filter === 'planned') {
        show = status === 'planned';
      } else {
        // tag-based filter
        show = tags.includes(filter);
      }

      if (show) {
        card.classList.remove('hidden');
        visibleCount++;
        // Re-trigger animation if not yet visible
        if (!card.classList.contains('visible')) {
          observer.observe(card);
        }
      } else {
        card.classList.add('hidden');
      }
    });

    emptyState.classList.toggle('visible', visibleCount === 0);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  /* ── Live stats counter update ──────────────────────────────────── */
  function updateStats() {
    const completed = cards.filter(c => c.dataset.status === 'completed').length;
    const wip       = cards.filter(c => c.dataset.status === 'wip').length;
    const planned   = cards.filter(c => c.dataset.status === 'planned').length;

    const el = (id) => document.getElementById(id);
    if (el('completed-count')) el('completed-count').textContent = completed;
    if (el('wip-count'))       el('wip-count').textContent       = wip;
    if (el('planned-count'))   el('planned-count').textContent   = planned;
  }

  updateStats();

  /* ── Keyboard shortcut: press "/" to focus filter bar ───────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      filterBtns[0]?.focus();
    }
    // Escape resets to "all"
    if (e.key === 'Escape') {
      filterBtns.forEach(b => b.classList.remove('active'));
      filterBtns[0]?.classList.add('active');
      applyFilter('all');
    }
  });

  /* ── Smooth-scroll to first visible card on filter change ───────── */
  // Already handled by the filter logic above; the page scrolls naturally.

})();
