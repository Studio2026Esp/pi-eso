(function () {
  'use strict';

  const ANALYTICS_ID = 'G-5HLJ0094EX';
  const ADSENSE_CLIENT = 'ca-pub-2667269605695109';
  let analyticsLoaded = false;
  let tcfListenerAdded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // Estado más restrictivo hasta que la CMP certificada de Google comunique la elección.
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 2000
  });

  function addScript(src, attributes) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    Object.keys(attributes || {}).forEach(function (name) {
      script.setAttribute(name, attributes[name]);
    });
    document.head.appendChild(script);
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    addScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ANALYTICS_ID));
  }

  function clearAnalyticsCookies() {
    document.cookie.split(';').map(function (cookie) {
      return cookie.split('=')[0].trim();
    }).filter(function (name) {
      return name === '_ga' || name.indexOf('_ga_') === 0;
    }).forEach(function (name) {
      document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
      document.cookie = name + '=; Max-Age=0; path=/; domain=.pieso.es; SameSite=Lax';
    });
  }

  function handleConsent(tcData, success) {
    if (!success || !tcData) return;

    if (tcData.gdprApplies === false) {
      loadAnalytics();
      return;
    }

    if (tcData.eventStatus !== 'tcloaded' && tcData.eventStatus !== 'useractioncomplete') return;
    const analyticsGranted = Boolean(tcData.purpose && tcData.purpose.consents && tcData.purpose.consents['1']);
    window.gtag('consent', 'update', { analytics_storage: analyticsGranted ? 'granted' : 'denied' });
    if (analyticsGranted) loadAnalytics();
    else clearAnalyticsCookies();
  }

  function connectToCmp() {
    if (tcfListenerAdded || typeof window.__tcfapi !== 'function') return false;
    tcfListenerAdded = true;
    window.__tcfapi('addEventListener', 2, handleConsent);
    return true;
  }

  // La etiqueta de AdSense carga la CMP publicada y, tras la aprobación, los anuncios.
  addScript(
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(ADSENSE_CLIENT),
    { crossorigin: 'anonymous' }
  );

  if (!connectToCmp()) {
    let attempts = 0;
    const cmpTimer = window.setInterval(function () {
      attempts += 1;
      if (connectToCmp() || attempts >= 40) window.clearInterval(cmpTimer);
    }, 250);
  }
}());
