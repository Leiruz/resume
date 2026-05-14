/*
  Zuriel Shanley Tanyory - Cybersecurity Portfolio
  Vanilla JS only. Handles progressive enhancement, mobile navigation,
  scroll reveal, active section state, terminal text, and copy email.
*/

(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');
  const navLinks = Array.from(document.querySelectorAll('.nav-menu a'));
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const copyButton = document.querySelector('[data-copy]');
  const copyStatus = document.querySelector('[data-copy-status]');
  const yearTarget = document.querySelector('[data-year]');
  const terminalOutput = document.querySelector('[data-terminal-output]');

  if (yearTarget) {
    yearTarget.textContent = String(new Date().getFullYear());
  }

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  function closeMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation');
    navMenu.classList.remove('is-open');
  }

  function toggleMenu() {
    if (!navToggle || !navMenu) return;
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navMenu.classList.toggle('is-open', !isOpen);
  }

  if (navToggle) {
    navToggle.addEventListener('click', toggleMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${activeId}`;
          link.classList.toggle('is-active', isActive);
        });
      });
    }, { threshold: 0.36, rootMargin: '-20% 0px -55% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();

    try {
      return document.execCommand('copy');
    } finally {
      document.body.removeChild(input);
    }
  }

  if (copyButton && copyStatus) {
    copyButton.addEventListener('click', async () => {
      const text = copyButton.getAttribute('data-copy');
      if (!text) return;

      try {
        const ok = await copyToClipboard(text);
        copyStatus.textContent = ok ? 'Email copied to clipboard.' : 'Copy failed. Email: ' + text;
      } catch (error) {
        copyStatus.textContent = 'Copy failed. Email: ' + text;
      }
    });
  }

  function typeTerminalLines(target) {
    if (!target || prefersReducedMotion) return;

    const lines = [
      'information security + secure automation',
      'soc workflows + edr operations + soar thinking',
      'secure web development + digital forensics',
      'ai-assisted detection + practical defense'
    ];

    let lineIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const currentLine = lines[lineIndex];
      const visible = currentLine.slice(0, charIndex);
      target.textContent = visible + (charIndex % 2 === 0 ? '_' : '');

      if (!deleting && charIndex < currentLine.length) {
        charIndex += 1;
        window.setTimeout(tick, 42);
        return;
      }

      if (!deleting && charIndex >= currentLine.length) {
        deleting = true;
        window.setTimeout(tick, 1300);
        return;
      }

      if (deleting && charIndex > 0) {
        charIndex -= 1;
        window.setTimeout(tick, 22);
        return;
      }

      deleting = false;
      lineIndex = (lineIndex + 1) % lines.length;
      window.setTimeout(tick, 220);
    }

    tick();
  }

  typeTerminalLines(terminalOutput);
})();
