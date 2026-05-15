const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('#navLinks');
const navAnchors = [...document.querySelectorAll('.nav-links a')];

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  document.body.classList.toggle('menu-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

navAnchors.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const sections = navAnchors
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

const phrases = [
  'SOC clarity. Secure delivery.',
  'Automation for analyst focus.',
  'Secure software, shipped well.',
  'Founder drive. Consultant rigor.'
];
const typingLine = document.querySelector('#typingLine');
let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typingLine || prefersReducedMotion) return;
  const phrase = phrases[phraseIndex];
  typingLine.textContent = phrase.slice(0, characterIndex);

  if (!deleting && characterIndex < phrase.length) {
    characterIndex += 1;
    setTimeout(typeLoop, 58);
    return;
  }
  if (!deleting && characterIndex === phrase.length) {
    deleting = true;
    setTimeout(typeLoop, 1500);
    return;
  }
  if (deleting && characterIndex > 0) {
    characterIndex -= 1;
    setTimeout(typeLoop, 28);
    return;
  }
  deleting = false;
  phraseIndex = (phraseIndex + 1) % phrases.length;
  setTimeout(typeLoop, 260);
}
typeLoop();

const track = document.querySelector('.project-track');
const cards = track ? [...track.querySelectorAll('.project-card')] : [];
const prevButton = document.querySelector('[data-carousel-prev]');
const nextButton = document.querySelector('[data-carousel-next]');
const dotsWrap = document.querySelector('.carousel-dots');
let carouselFrame = null;
let carouselTimer = null;
let activeProjectIndex = 0;

function normalizeIndex(index) {
  if (cards.length === 0) return 0;
  return (index + cards.length) % cards.length;
}

function currentIndex() {
  if (!track || cards.length === 0) return activeProjectIndex;
  const trackRect = track.getBoundingClientRect();
  const trackCenter = trackRect.left + trackRect.width / 2;
  let closest = activeProjectIndex;
  let closestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;
    const distance = Math.abs(trackCenter - cardCenter);
    if (distance < closestDistance) {
      closest = index;
      closestDistance = distance;
    }
  });

  return closest;
}

function updateCarousel(forcedIndex) {
  const active = typeof forcedIndex === 'number' ? normalizeIndex(forcedIndex) : currentIndex();
  activeProjectIndex = active;
  const dots = dotsWrap ? [...dotsWrap.querySelectorAll('.dot')] : [];
  dots.forEach((dot, index) => {
    const isActive = index === active;
    dot.classList.toggle('is-active', isActive);
    if (isActive) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
}

function scrollToCard(index) {
  if (!track || cards.length === 0) return;
  const targetIndex = normalizeIndex(index);
  activeProjectIndex = targetIndex;
  updateCarousel(targetIndex);
  cards[targetIndex].scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'nearest',
    inline: 'start'
  });
  window.setTimeout(() => updateCarousel(targetIndex), prefersReducedMotion ? 0 : 120);
  window.setTimeout(() => updateCarousel(targetIndex), prefersReducedMotion ? 0 : 360);
}

if (dotsWrap) {
  dotsWrap.innerHTML = '';
  cards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `dot${index === 0 ? ' is-active' : ''}`;
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show project ${index + 1}`);
    if (index === 0) dot.setAttribute('aria-current', 'true');
    dot.addEventListener('click', () => scrollToCard(index));
    dotsWrap.appendChild(dot);
  });
}

prevButton?.addEventListener('click', (event) => {
  event.preventDefault();
  scrollToCard(activeProjectIndex - 2);
});

nextButton?.addEventListener('click', (event) => {
  event.preventDefault();
  scrollToCard(activeProjectIndex + 1);
});

track?.addEventListener('scroll', () => {
  if (carouselFrame) window.cancelAnimationFrame(carouselFrame);
  carouselFrame = window.requestAnimationFrame(updateCarousel);
  window.clearTimeout(carouselTimer);
  carouselTimer = window.setTimeout(updateCarousel, 90);
}, { passive: true });

track?.addEventListener('scrollend', updateCarousel);

track?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    scrollToCard(activeProjectIndex + 1);
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    scrollToCard(activeProjectIndex - 1);
  }
  if (event.key === 'Home') {
    event.preventDefault();
    scrollToCard(0);
  }
  if (event.key === 'End') {
    event.preventDefault();
    scrollToCard(cards.length - 1);
  }
});

window.addEventListener('resize', () => updateCarousel(activeProjectIndex), { passive: true });
updateCarousel(0);

const copyButton = document.querySelector('#copyEmail');
copyButton?.addEventListener('click', async () => {
  const email = copyButton.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    copyButton.textContent = 'Email copied';
    setTimeout(() => { copyButton.textContent = 'Copy email'; }, 1600);
  } catch {
    window.location.href = `mailto:${email}`;
  }
});



const aiConfig = window.ZURIEL_AI_CONFIG || {};
const aiEndpoint = typeof aiConfig.endpoint === 'string' ? aiConfig.endpoint.trim() : '';
const aiPanel = document.querySelector('#aiAssistant');
const aiOpenButtons = [...document.querySelectorAll('[data-ai-open]')];
const aiCloseButton = document.querySelector('[data-ai-close]');
const aiForm = document.querySelector('#aiForm');
const aiInput = document.querySelector('#aiInput');
const aiMessages = document.querySelector('#aiMessages');
const aiPromptButtons = [...document.querySelectorAll('[data-ai-prompt]')];
const aiConversation = [];

function setAIState(isOpen) {
  if (!aiPanel) return;
  aiPanel.classList.toggle('is-open', isOpen);
  aiPanel.setAttribute('aria-hidden', String(!isOpen));
  aiOpenButtons.forEach((button) => button.setAttribute('aria-expanded', String(isOpen)));
  if (isOpen) window.setTimeout(() => aiInput?.focus(), 80);
}

function appendAIMessage(role, text) {
  if (!aiMessages) return null;
  const message = document.createElement('div');
  message.className = `ai-message ${role}`;
  message.textContent = text;
  aiMessages.appendChild(message);
  aiMessages.scrollTop = aiMessages.scrollHeight;
  return message;
}

function setAIStatus(isBusy) {
  aiPanel?.setAttribute('data-busy', String(isBusy));
  const submit = aiForm?.querySelector('button[type="submit"]');
  if (submit) {
    submit.disabled = isBusy;
    submit.textContent = isBusy ? 'Thinking' : 'Ask';
  }
}

async function askPortfolioAI(question) {
  if (!question) return;
  setAIState(true);
  appendAIMessage('user', question);

  if (!aiEndpoint) {
    appendAIMessage('assistant', 'The AI Worker endpoint is not connected yet. Deploy the Cloudflare Worker in the worker folder, then paste its /chat URL into assets/ai/config.js.');
    return;
  }

  setAIStatus(true);
  const pending = appendAIMessage('assistant', 'Thinking...');

  try {
    const response = await fetch(aiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        history: aiConversation.slice(-6)
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'The assistant could not answer right now.');

    const answer = data.answer || 'I could not find a resume-backed answer for that.';
    if (pending) pending.textContent = answer;
    aiConversation.push({ role: 'user', content: question });
    aiConversation.push({ role: 'assistant', content: answer });
  } catch (error) {
    if (pending) pending.textContent = 'The AI assistant is unavailable right now. Please check the Worker URL, CORS origin, and Workers AI binding.';
    console.warn('AI assistant error:', error);
  } finally {
    setAIStatus(false);
  }
}

aiOpenButtons.forEach((button) => button.addEventListener('click', () => setAIState(true)));
aiCloseButton?.addEventListener('click', () => setAIState(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && aiPanel?.classList.contains('is-open')) setAIState(false);
});
aiPromptButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const prompt = button.dataset.aiPrompt || '';
    if (aiInput) aiInput.value = prompt;
    askPortfolioAI(prompt);
  });
});
aiForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const question = aiInput?.value.trim() || '';
  if (!question) return;
  aiInput.value = '';
  askPortfolioAI(question);
});

const backTop = document.querySelector('.back-top');
window.addEventListener('scroll', () => {
  backTop?.classList.toggle('is-visible', window.scrollY > 900);
}, { passive: true });
backTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

function revealImmediately() {
  document.querySelectorAll('.reveal').forEach((element) => {
    element.style.opacity = '1';
    element.style.transform = 'none';
  });
}

try {
  if (!prefersReducedMotion && window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.utils.toArray('.reveal').forEach((element) => {
      window.gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 86%' }
      });
    });
    window.gsap.to('.hero-stage img', {
      y: -18,
      rotate: 1.6,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  } else {
    revealImmediately();
  }
} catch (error) {
  revealImmediately();
  console.warn('Animation fallback activated:', error);
}
