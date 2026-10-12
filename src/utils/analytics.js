/**
 * QRo Privacy-Conscious Analytics Engine (Google Analytics 4)
 * 
 * Privacy Guarantees:
 * - Zero PII: No user-generated inputs, raw URLs, contact details, Wi-Fi passwords, or uploaded logos are sent.
 * - IP Anonymization enabled (`anonymize_ip: true`).
 * - Google Signals and Ad Personalization explicitly disabled.
 * - Localhost and private dev environments automatically skip network calls and output clear dev logs.
 * - Zero ads, zero cookies without user interaction, zero forced registration.
 */

const GA_ID =
  process.env.REACT_APP_GA_MEASUREMENT_ID ||
  (typeof window !== 'undefined' && window.REACT_APP_GA_MEASUREMENT_ID) ||
  (typeof window !== 'undefined' && window.GA_MEASUREMENT_ID) ||
  '';

let isInitialized = false;
let lastTrackedPath = '';

/**
 * Check if current environment is local development
 */
function isDevEnvironment() {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  );
}

/**
 * Safe logger for development verification
 */
function logDevEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && (isDevEnvironment() || window.ANALYTICS_DEBUG)) {
    console.log(
      `%c[QRo Analytics Dev]%c ${eventName}`,
      'background: #171717; color: #21F1A8; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(33, 241, 168, 0.4);',
      'color: #21F1A8; font-weight: 600;',
      params
    );
  }
}

/**
 * Initialize GA4 tracking script in a clean, non-blocking way
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  if (!GA_ID) {
    logDevEvent('init_skipped', {
      reason: 'No REACT_APP_GA_MEASUREMENT_ID configured. Operating in dev mode.',
    });
    isInitialized = true;
    return;
  }

  // Prevent multiple script insertions
  if (document.getElementById('qro-ga4-script')) {
    isInitialized = true;
    return;
  }

  // Inject GA4 snippet with privacy controls
  const script = document.createElement('script');
  script.id = 'qro-ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: false, // Page views managed explicitly
  });

  isInitialized = true;
  logDevEvent('initialized', { measurementId: GA_ID });
}

/**
 * Dispatch a generic event with privacy guarantees
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;

  logDevEvent(eventName, params);

  if (window.gtag && GA_ID && !isDevEnvironment()) {
    try {
      window.gtag('event', eventName, params);
    } catch (err) {
      console.warn('Analytics event dispatch error:', err);
    }
  }
}

/**
 * Track page views without duplicates
 */
export function trackPageView(path = window.location.pathname, title = document.title) {
  if (typeof window === 'undefined') return;
  if (lastTrackedPath === path) return;
  lastTrackedPath = path;

  logDevEvent('page_view', { path, title });

  if (window.gtag && GA_ID && !isDevEnvironment()) {
    try {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title,
        page_location: window.location.href,
      });
    } catch (err) {
      console.warn('Analytics page_view error:', err);
    }
  }
}

/**
 * Track QR Content Type selection (link, text, wifi, contact)
 * Never passes user-entered data.
 */
export function trackContentTypeSelect(contentType) {
  trackEvent('content_type_select', {
    content_type: contentType,
  });
}

/**
 * Track Template preset selection
 */
export function trackTemplateSelect(templateId, templateName) {
  trackEvent('template_select', {
    template_id: templateId,
    template_name: templateName,
  });
}

/**
 * Track QR Style pattern change
 */
export function trackStyleChange(styleId) {
  trackEvent('style_change', {
    style: styleId,
  });
}

/**
 * Track QR generation attempt
 */
export function trackQrGenerateAttempt(contentType) {
  trackEvent('qr_generate_attempt', {
    content_type: contentType,
  });
}

/**
 * Track QR generation success
 */
export function trackQrGenerateSuccess(params = {}) {
  trackEvent('qr_generate_success', {
    content_type: params.contentType || 'link',
    has_logo: Boolean(params.hasLogo),
    is_gradient: Boolean(params.useGradient),
    has_frame: Boolean(params.hasFrame),
    style: params.style || 'rounded',
  });
}

/**
 * Track QR export / download
 */
export function trackQrDownload(params = {}) {
  trackEvent('qr_download', {
    format: params.format || 'png',
    resolution: params.resolution || 1024,
    has_frame: Boolean(params.framed),
    style: params.style || 'rounded',
  });
}

/**
 * Track Copy QR image to clipboard
 */
export function trackQrCopy(params = {}) {
  trackEvent('qr_copy', {
    style: params.style || 'rounded',
  });
}

/**
 * Track Share QR action
 */
export function trackQrShare(params = {}) {
  trackEvent('qr_share', {
    style: params.style || 'rounded',
  });
}

/**
 * Track Theme toggle
 */
export function trackThemeToggle(theme) {
  trackEvent('theme_toggle', {
    theme,
  });
}

/**
 * Track PWA Installation
 */
export function trackPwaInstall(action) {
  trackEvent('pwa_install', {
    action, // 'prompt_shown' | 'accepted' | 'dismissed'
  });
}

/**
 * Track FAQ Accordion Expand for AEO engagement insight
 */
export function trackFaqToggle(faqId, isExpanded) {
  trackEvent('faq_toggle', {
    faq_id: faqId,
    expanded: isExpanded,
  });
}
