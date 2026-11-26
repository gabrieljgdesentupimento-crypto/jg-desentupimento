/* ==========================================================================
   JG Desentupimento — medição (sem carregar scripts externos por omissão)
   Preencha os IDs quando existirem. Enquanto estiverem vazios, o gtag.js
   NÃO é carregado, mesmo que a pessoa aceite os cookies.
   ========================================================================== */
const TRACKING_CONFIG = {
  GA4_ID: '',
  ADS_ID: '',
  ADS_CONVERSION_LABEL: '',
};

/* Link da avaliação no Google. Vazio = o convite fica escondido. */
const REVIEW_URL = '';

const CONSENT_KEY = 'jg-consent-v1';

(function initTracking() {
  const lang = (document.documentElement.lang || 'pt-PT').toLowerCase();
  const english = lang.startsWith('en');

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

  /* Consent Mode v2: tudo negado até haver uma escolha. Isto só escreve no
     dataLayer; não pede nenhum ficheiro à Google. */
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  });

  function hasMeasurementId() {
    return Boolean(TRACKING_CONFIG.GA4_ID || TRACKING_CONFIG.ADS_ID);
  }

  function loadGoogleTags() {
    if (!hasMeasurementId()) return;
    if (window.__jgGtagLoaded) return;
    window.__jgGtagLoaded = true;

    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });

    const firstId = TRACKING_CONFIG.GA4_ID || TRACKING_CONFIG.ADS_ID;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(firstId)}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    if (TRACKING_CONFIG.GA4_ID) {
      window.gtag('config', TRACKING_CONFIG.GA4_ID, { anonymize_ip: true });
    }
    if (TRACKING_CONFIG.ADS_ID) {
      const sendTo = TRACKING_CONFIG.ADS_CONVERSION_LABEL
        ? `${TRACKING_CONFIG.ADS_ID}/${TRACKING_CONFIG.ADS_CONVERSION_LABEL}`
        : TRACKING_CONFIG.ADS_ID;
      window.gtag('config', TRACKING_CONFIG.ADS_ID);
      window.__jgAdsSendTo = sendTo;
    }
  }

  function readChoice() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (error) { return null; }
  }

  function storeChoice(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (error) { /* privado */ }
  }

  function applyChoice(value) {
    storeChoice(value);
    const banner = document.querySelector('.consent-banner');
    if (banner) banner.remove();
    document.body.classList.remove('has-consent-banner');
    if (value === 'granted') loadGoogleTags();
  }

  if (readChoice() === 'granted') {
    loadGoogleTags();
  } else if (!readChoice()) {
    mountBanner();
  }

  function mountBanner() {
    const privacyHref = english ? '/en/privacy/' : '/politica-de-privacidade/';
    const banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', english ? 'Cookies' : 'Cookies');
    banner.innerHTML = english
      ? `<p>We use optional analytics cookies only if you accept. The form is used only to reply to your request. <a href="${privacyHref}">Privacy and cookies</a></p>
         <div class="consent-actions">
           <button type="button" class="btn btn-green" data-consent="granted">Accept</button>
           <button type="button" class="btn btn-outline" data-consent="denied">Decline</button>
         </div>`
      : `<p>Usamos cookies de análise apenas se aceitar. Os dados do formulário servem só para responder ao seu pedido. <a href="${privacyHref}">Política de Privacidade</a></p>
         <div class="consent-actions">
           <button type="button" class="btn btn-green" data-consent="granted">Aceitar</button>
           <button type="button" class="btn btn-outline" data-consent="denied">Recusar</button>
         </div>`;
    document.body.appendChild(banner);
    document.body.classList.add('has-consent-banner');
    banner.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-consent]')?.getAttribute('data-consent');
      if (choice) applyChoice(choice);
    });
    banner.querySelector('button')?.focus();
  }

  function placeOf(link) {
    if (link.classList.contains('wa-float')) return 'floating';
    if (link.closest('.mobile-cta-bar')) return 'mobile-bar';
    if (link.closest('header, .site-header')) return 'header';
    if (link.closest('footer, .site-footer')) return 'footer';
    if (link.closest('.hero, .hero-carousel, .page-hero')) return 'hero';
    if (link.closest('.cta-final')) return 'cta';
    const section = link.closest('[id]');
    return section ? section.id : 'page';
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('tel:')) {
      window.dataLayer.push({
        event: 'click_call',
        phone_number: decodeURIComponent(href.slice(4)),
        link_location: placeOf(link),
      });
      return;
    }
    if (href.includes('wa.me')) {
      window.dataLayer.push({
        event: 'click_whatsapp',
        link_url: href,
        link_text: (link.getAttribute('aria-label') || link.textContent || '').replace(/\s+/g, ' ').trim(),
        link_location: placeOf(link),
      });
    }
  });

  function applyReviewLinks() {
    const url = (REVIEW_URL || '').trim();
    document.querySelectorAll('[data-review]').forEach((el) => {
      el.hidden = !url;
    });
    document.querySelectorAll('[data-review-link]').forEach((link) => {
      if (!url) return;
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.hidden = false;
    });
    document.querySelectorAll('[data-review-empty], [data-review-call]').forEach((el) => {
      el.hidden = Boolean(url);
    });
  }

  applyReviewLinks();

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.classList.contains('js-lead-form')) return;
    if (!form.checkValidity()) return;
    window.dataLayer.push({
      event: 'generate_lead',
      form_language: form.dataset.lang === 'en' || english ? 'en' : 'pt-PT',
      page_location: window.location.href,
    });
  });
}());
