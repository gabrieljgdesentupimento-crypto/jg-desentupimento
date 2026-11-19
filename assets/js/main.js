/* ==========================================================================
   JG Desentupimento — main.js
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIGURAÇÃO DE CONTACTO
   Substituir pelos dados reais da JG Desentupimento antes de publicar.
   WHATSAPP_NUMBER: apenas dígitos, com indicativo do país (Portugal = 351).
   PHONE_NUMBER_TEL: formato usado no link tel: (sem espaços).
   PHONE_NUMBER_DISPLAY: formato usado apenas visualmente, se necessário.
   -------------------------------------------------------------------------- */
const CONTACT_CONFIG = {
  WHATSAPP_NUMBER: '351900000000',
  WHATSAPP_MESSAGE: 'Olá! Preciso de ajuda com um problema de desentupimento/hidráulica.',
  PHONE_NUMBER_TEL: '+351900000000',
  PHONE_NUMBER_DISPLAY: '+351 900 000 000',
};

document.addEventListener('DOMContentLoaded', () => {
  applyContactLinks();
  initHeaderScroll();
  initMobileNav();
  initFaqAccordion();
  initScrollSpy();
});

/* Preenche todos os links de WhatsApp e telefone a partir da configuração acima */
function applyContactLinks() {
  const waHref = `https://wa.me/${CONTACT_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(CONTACT_CONFIG.WHATSAPP_MESSAGE)}`;
  document.querySelectorAll('.js-whatsapp-link').forEach((el) => {
    el.setAttribute('href', waHref);
  });

  const telHref = `tel:${CONTACT_CONFIG.PHONE_NUMBER_TEL}`;
  document.querySelectorAll('.js-phone-link').forEach((el) => {
    el.setAttribute('href', telHref);
  });
}

/* Sombra no header ao rolar a página */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Menu mobile (drawer) */
function initMobileNav() {
  const toggle = document.querySelector('.js-nav-toggle');
  const close = document.querySelector('.js-nav-close');
  const backdrop = document.querySelector('.js-nav-backdrop');
  const nav = document.querySelector('.js-mobile-nav');
  const links = document.querySelectorAll('.js-nav-link');

  if (!toggle || !nav) return;

  const openNav = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', openNav);
  close?.addEventListener('click', closeNav);
  backdrop?.addEventListener('click', closeNav);
  links.forEach((link) => link.addEventListener('click', closeNav));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
}

/* Acordeão do FAQ */
function initFaqAccordion() {
  const items = document.querySelectorAll('.js-faq-list .faq-item');

  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const inner = item.querySelector('.faq-answer-inner');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = `${inner.offsetHeight}px`;
      }
    });
  });
}

/* Destaca o item de menu correspondente à secção visível */
function initScrollSpy() {
  const sections = document.querySelectorAll('main section[id], main[id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');

        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}
