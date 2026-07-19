(function () {
  'use strict';

  const MEASUREMENT_ID = 'G-5HLJ0094EX';
  const STORAGE_KEY = 'pieso_cookie_consent_v1';
  let analyticsLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  function readChoice() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (error) { return null; }
  }

  function storeChoice(choice) {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (error) { /* Sin almacenamiento disponible */ }
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  function clearAnalyticsCookies() {
    const names = document.cookie.split(';').map(function (cookie) { return cookie.split('=')[0].trim(); });
    names.filter(function (name) { return name === '_ga' || name.indexOf('_ga_') === 0; }).forEach(function (name) {
      document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
      document.cookie = name + '=; Max-Age=0; path=/; domain=.pieso.es; SameSite=Lax';
    });
  }

  function applyChoice(choice) {
    const granted = choice === 'accepted';
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (granted) loadAnalytics();
    else clearAnalyticsCookies();
  }

  const ui = `
    <button class="cookie-settings-button" type="button" aria-label="Cambiar preferencias de cookies">Cookies</button>
    <section class="cookie-banner" role="dialog" aria-modal="true" aria-labelledby="cookie-title" hidden>
      <div class="cookie-banner__content">
        <div>
          <h2 id="cookie-title">Tu privacidad importa</h2>
          <p>Usamos cookies analíticas de Google Analytics únicamente si las aceptas para conocer el uso de PI ESO y mejorar sus contenidos. Puedes aceptar, rechazar o configurar tu elección.</p>
          <p><strong>Actualmente no usamos cookies publicitarias ni mostramos anuncios personalizados.</strong></p>
          <p class="cookie-banner__links"><a href="/politicas/cookies.html">Política de cookies</a> · <a href="/politicas/privacidad.html">Privacidad</a></p>
        </div>
        <div class="cookie-actions">
          <button class="cookie-btn cookie-btn--secondary" data-cookie-action="reject" type="button">Rechazar</button>
          <button class="cookie-btn cookie-btn--secondary" data-cookie-action="settings" type="button">Configurar</button>
          <button class="cookie-btn cookie-btn--primary" data-cookie-action="accept" type="button">Aceptar</button>
        </div>
      </div>
    </section>
    <div class="cookie-modal-backdrop" hidden>
      <section class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-settings-title">
        <button class="cookie-modal__close" type="button" aria-label="Cerrar">×</button>
        <h2 id="cookie-settings-title">Configurar cookies</h2>
        <div class="cookie-option">
          <div><strong>Cookies necesarias</strong><p>Permiten guardar tu elección. No se pueden desactivar.</p></div>
          <span class="cookie-always-on">Siempre activas</span>
        </div>
        <div class="cookie-option">
          <label for="analytics-consent"><strong>Cookies analíticas</strong><p>Google Analytics ayuda a conocer visitas, páginas consultadas y tipo de dispositivo.</p></label>
          <input id="analytics-consent" type="checkbox" />
        </div>
        <div class="cookie-option cookie-option--inactive">
          <div><strong>Cookies publicitarias</strong><p>No se utilizan actualmente. Si se incorporan anuncios, se pedirá un consentimiento específico antes de activarlas.</p></div>
          <span class="cookie-disabled">No activas</span>
        </div>
        <div class="cookie-actions cookie-actions--modal">
          <button class="cookie-btn cookie-btn--secondary" data-cookie-action="reject" type="button">Rechazar todas</button>
          <button class="cookie-btn cookie-btn--primary" data-cookie-action="save" type="button">Guardar selección</button>
        </div>
        <p class="cookie-banner__links"><a href="/politicas/cookies.html">Política de cookies</a> · <a href="/politicas/privacidad.html">Privacidad</a></p>
      </section>
    </div>`;

  function init() {
    document.body.insertAdjacentHTML('beforeend', ui);
    const banner = document.querySelector('.cookie-banner');
    const backdrop = document.querySelector('.cookie-modal-backdrop');
    const settingsButton = document.querySelector('.cookie-settings-button');
    const analyticsCheckbox = document.getElementById('analytics-consent');

    function closeAll() {
      banner.hidden = true;
      backdrop.hidden = true;
      document.body.classList.remove('cookie-modal-open');
    }

    function openSettings() {
      analyticsCheckbox.checked = readChoice() === 'accepted';
      backdrop.hidden = false;
      document.body.classList.add('cookie-modal-open');
      document.querySelector('.cookie-modal__close').focus();
    }

    function choose(choice) {
      storeChoice(choice);
      applyChoice(choice);
      closeAll();
      settingsButton.hidden = false;
    }

    document.addEventListener('click', function (event) {
      const action = event.target.closest('[data-cookie-action]');
      if (!action) return;
      if (action.dataset.cookieAction === 'accept') choose('accepted');
      if (action.dataset.cookieAction === 'reject') choose('rejected');
      if (action.dataset.cookieAction === 'settings') openSettings();
      if (action.dataset.cookieAction === 'save') choose(analyticsCheckbox.checked ? 'accepted' : 'rejected');
    });

    settingsButton.addEventListener('click', openSettings);
    document.querySelector('.cookie-modal__close').addEventListener('click', closeAll);
    backdrop.addEventListener('click', function (event) { if (event.target === backdrop) closeAll(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !backdrop.hidden) closeAll(); });

    const savedChoice = readChoice();
    if (savedChoice === 'accepted' || savedChoice === 'rejected') {
      applyChoice(savedChoice);
      settingsButton.hidden = false;
    } else {
      banner.hidden = false;
      settingsButton.hidden = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
