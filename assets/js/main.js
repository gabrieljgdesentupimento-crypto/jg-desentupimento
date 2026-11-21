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
  initHeroCarousel();
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

/* Carrossel do hero: crossfade, pausa e leitura diferida das imagens */
function initHeroCarousel() {
  const hero = document.querySelector('.hero-carousel');
  if (!hero) return;

  const slides = [...hero.querySelectorAll('.hero-slide')];
  const headings = [...hero.querySelectorAll('.hero-heading .hero-line')];
  const subs = [...hero.querySelectorAll('.hero-sub .hero-line')];
  const dots = [...hero.querySelectorAll('.hero-dot')];
  const status = hero.querySelector('.hero-status');
  const pauseBtn = hero.querySelector('.hero-pause');
  const viewport = hero.querySelector('.hero-viewport');
  const total = slides.length;
  if (!total) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const INTERVAL = 5000;

  let index = 0;
  let timer = null;
  let pausedByUser = reduceMotion.matches;
  let hovering = false;
  let focusInside = false;

  const mod = (n) => (n + total) % total;

  const imageSource = (img) => (mobileQuery.matches ? img.dataset.srcMobile : img.dataset.srcDesktop);

  const ensureImage = (i) => {
    const img = slides[mod(i)]?.querySelector('img');
    if (!img || img.getAttribute('src') || !img.dataset.srcDesktop) return;
    img.src = imageSource(img);
    img.decoding = 'async';
    if ('fetchPriority' in img) img.fetchPriority = 'low';
  };

  const setPausedButton = (paused) => {
    if (!pauseBtn) return;
    pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', paused ? 'Retomar rotação automática' : 'Pausar rotação automática');
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  const shouldPlay = () => !pausedByUser && !hovering && !focusInside && !reduceMotion.matches && !document.hidden;

  const play = () => {
    stop();
    if (!shouldPlay()) return;
    timer = setInterval(() => show(index + 1, false), INTERVAL);
  };

  const show = (next, manual) => {
    index = mod(next);
    ensureImage(index);
    ensureImage(index + 1);

    slides.forEach((slide, i) => {
      const on = i === index;
      slide.classList.toggle('is-active', on);
      slide.setAttribute('aria-hidden', on ? 'false' : 'true');
    });

    [headings, subs].forEach((group) => {
      group.forEach((line, i) => {
        const on = i === index;
        line.classList.toggle('is-active', on);
        line.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
    });

    dots.forEach((dot, i) => {
      dot.setAttribute('aria-current', i === index ? 'true' : 'false');
    });

    if (manual && status) status.textContent = slides[index].dataset.announce || '';
    play();
  };

  hero.classList.add('is-ready');
  setPausedButton(pausedByUser);
  ensureImage(0);
  ensureImage(1);
  show(0, false);

  hero.querySelector('.hero-next')?.addEventListener('click', () => show(index + 1, true));
  hero.querySelector('.hero-prev')?.addEventListener('click', () => show(index - 1, true));

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => show(i, true));
  });

  pauseBtn?.addEventListener('click', () => {
    pausedByUser = !pausedByUser;
    hero.classList.toggle('is-paused', pausedByUser);
    setPausedButton(pausedByUser);
    if (pausedByUser) stop();
    else play();
  });

  hero.addEventListener('mouseenter', () => {
    hovering = true;
    stop();
  });

  hero.addEventListener('mouseleave', () => {
    hovering = false;
    play();
  });

  hero.addEventListener('focusin', () => {
    focusInside = true;
    stop();
  });

  hero.addEventListener('focusout', (event) => {
    if (hero.contains(event.relatedTarget)) return;
    focusInside = false;
    play();
  });

  hero.addEventListener('keydown', (event) => {
    if (!event.target.closest('.hero-dot, .hero-arrow, .hero-pause')) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1, true);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      show(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      show(total - 1, true);
    }
  });

  let startX = 0;
  let startY = 0;
  let tracking = false;

  const onTouchStart = (event) => {
    if (event.touches.length !== 1 || event.target.closest('a, button')) {
      tracking = false;
      return;
    }
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    tracking = true;
  };

  const onTouchEnd = (event) => {
    if (!tracking) return;
    tracking = false;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    show(dx < 0 ? index + 1 : index - 1, true);
  };

  (viewport || hero).addEventListener('touchstart', onTouchStart, { passive: true });
  (viewport || hero).addEventListener('touchend', onTouchEnd, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else play();
  });

  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) {
      pausedByUser = true;
      stop();
    }
    setPausedButton(pausedByUser);
  });
}
