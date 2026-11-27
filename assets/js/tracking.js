/* ==========================================================================
   JG Desentupimento — medição
   O gtag.js carrega uma vez (async) e configura o GA4 e o Google Ads.
   Cookies de análise e de publicidade só ficam ativos depois do consentimento.
   ADS_LABEL_CALL e ADS_LABEL_WHATSAPP são os rótulos das ações de conversão
   do Google Ads. Enquanto estiverem vazios, o clique segue para o Ads no
   próprio evento (send_to), sem conversão no carregamento da página.
   ========================================================================== */
const TRACKING_CONFIG = {
  GA4_ID: 'G-LWL9T9SXPH',
  ADS_ID: 'AW-18597294603',
  ADS_LABEL_CALL: '',
  ADS_LABEL_WHATSAPP: '',
};

/* Link da avaliação no Google. Vazio = o convite fica escondido. */
const REVIEW_URL = '';

const CONSENT_KEY = 'jg-consent-v1';

(function initTracking() {
  const lang = (document.documentElement.lang || 'pt-PT').toLowerCase();
  const english = lang.startsWith('en');

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };

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

  function ensureTags() {
    if (window.__jgGtagLoaded) return;
    const measurementId = TRACKING_CONFIG.GA4_ID || TRACKING_CONFIG.ADS_ID;
    if (!measurementId) return;
    window.__jgGtagLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    if (TRACKING_CONFIG.GA4_ID) {
      window.gtag('config', TRACKING_CONFIG.GA4_ID);
    }
    if (TRACKING_CONFIG.ADS_ID) {
      window.gtag('config', TRACKING_CONFIG.ADS_ID);
    }
  }

  function grantConsent() {
    const update = {};
    if (TRACKING_CONFIG.GA4_ID) update.analytics_storage = 'granted';
    if (TRACKING_CONFIG.ADS_ID) {
      update.ad_storage = 'granted';
      update.ad_user_data = 'granted';
      update.ad_personalization = 'granted';
    }
    if (Object.keys(update).length) window.gtag('consent', 'update', update);
  }

  ensureTags();

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
    if (value === 'granted') grantConsent();
  }

  if (readChoice() === 'granted') {
    grantConsent();
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
      ? `<p>We use optional analytics and advertising cookies only if you accept. The form is used only to reply to your request. <a href="${privacyHref}">Privacy and cookies</a></p>
         <div class="consent-actions">
           <button type="button" class="btn btn-green" data-consent="granted">Accept</button>
           <button type="button" class="btn btn-outline" data-consent="denied">Decline</button>
         </div>`
      : `<p>Usamos cookies de análise e de publicidade apenas se aceitar. Os dados do formulário servem só para responder ao seu pedido. <a href="${privacyHref}">Política de Privacidade</a></p>
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
    if (link.classList.contains('wa-float')) return 'flutuante';
    if (link.closest('.mobile-cta-bar')) return 'mobile';
    if (link.closest('header, .site-header')) return 'header';
    if (link.closest('.hero, .hero-carousel, .page-hero')) return 'hero';
    if (link.closest('#contacto, #contact, .lead-form')) return 'contacto';
    if (link.closest('.cta-final')) return 'cta';
    if (link.closest('footer, .site-footer')) return 'footer';
    const section = link.closest('[id]');
    return section ? section.id : 'page';
  }

  function isWhatsapp(href) {
    return href.includes('wa.me') || href.includes('api.whatsapp');
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const shared = {
      link_url: link.href,
      page_location: window.location.href,
      link_location: placeOf(link),
      transport_type: 'beacon',
    };
    if (href.startsWith('tel:')) {
      sendClick('click_call', TRACKING_CONFIG.ADS_LABEL_CALL, Object.assign({
        phone_number: decodeURIComponent(href.slice(4)),
      }, shared));
      return;
    }
    if (isWhatsapp(href)) {
      sendClick('click_whatsapp', TRACKING_CONFIG.ADS_LABEL_WHATSAPP, shared);
    }
  });

  function sendClick(eventName, label, params) {
    const adsId = (TRACKING_CONFIG.ADS_ID || '').trim();
    const conversionLabel = (label || '').trim();
    if (adsId && !conversionLabel) {
      params.send_to = [TRACKING_CONFIG.GA4_ID, adsId].filter(Boolean);
    }
    window.gtag('event', eventName, params);
    if (adsId && conversionLabel) {
      window.gtag('event', 'conversion', {
        send_to: `${adsId}/${conversionLabel}`,
        transport_type: 'beacon',
      });
    }
  }

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
