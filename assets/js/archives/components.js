/* ═══════════════════════════════════════════════════════════
   Profilys — components.js
   Composants HTML partagés : nav, footer, logo SVG
   Usage : ProfilysComponents.injectNav('app') dans chaque page
═══════════════════════════════════════════════════════════ */

const ProfilysComponents = (() => {

  /* ── SVG Logo ─────────────────────────────────────────── */
  const LOGO_SVG_PROFILE = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="3.5" stroke="white" stroke-width="1.5" fill="rgba(255,255,255,0.1)"/>
      <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;

  const LOGO_SVG_SHIELD = `
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
      <path d="M10 1L2 5v5c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-4z"
        fill="rgba(255,255,255,.2)" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M10 14V8" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M7 11l3-3 3 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  /* ── Check-in nav button (partagé) ───────────────────── */
  const CHECKIN_BTN = `
    <button class="nav-checkin" id="navCI" onclick="openCI()">
      <span class="nc-dot"></span> Check-in
    </button>`;

  /* ══════════════════════════════════════════════════════
     NAVS
     Types disponibles :
       'landing' — page index.html (tabs Accueil / Profil / Bilans)
       'app'     — espace connecté (Dashboard, Monitoring, etc.)
       'simple'  — pages guides / legal (logo + retour)
  ══════════════════════════════════════════════════════ */

  function navLanding() {
    return `
<nav class="nav" role="navigation" aria-label="Navigation principale">
  <div class="nav-in">
    <a class="nav-logo" href="#" onclick="showPage('accueil');return false;">
      <div class="nav-mark">${LOGO_SVG_PROFILE}</div>
      <div class="nav-type">Profilys</div>
    </a>
    <div class="nav-links">
      <div class="nl on" id="nl-accueil" onclick="showPage('accueil')">Accueil</div>
      <div class="nl" id="nl-profil" onclick="showPage('profil')">Mon Profil</div>
      <div class="nl" id="nl-bilan" onclick="showPage('bilan')">Mes Bilans</div>
      <div class="nl" onclick="openModal('signup')">Rejoindre →</div>
    </div>
    <div class="nav-r">
      ${CHECKIN_BTN}
      <button class="nav-btn" onclick="openModal('signup')">Mon espace →</button>
    </div>
  </div>
</nav>`;
  }

  function navApp() {
    return `
<nav class="nav" role="navigation" aria-label="Navigation principale">
  <div class="nav-in">
    <a class="nav-logo" href="#" onclick="go('dash');return false;">
      <div class="nav-mark">${LOGO_SVG_SHIELD}</div>
      <div class="nav-type">Profilys</div>
    </a>
    <div class="nav-links">
      <div class="nl on" id="nl-dash"   onclick="go('dash')"   tabindex="0" role="button" onkeydown="if(event.key==='Enter')go('dash')">Dashboard</div>
      <div class="nl"    id="nl-mon"    onclick="window.location.href='monitoring.html'" tabindex="0" role="button">Monitoring</div>
      <div class="nl"    id="nl-profil" onclick="go('profil')" tabindex="0" role="button" onkeydown="if(event.key==='Enter')go('profil')">Profil Santé</div>
      <div class="nl"    id="nl-bio"    onclick="go('bio')"    tabindex="0" role="button" onkeydown="if(event.key==='Enter')go('bio')">Bilan Biologique</div>
      <div class="nav-dropdown" id="nav-dd-guides">
        <div class="nl" id="nl-guide">
          Guides
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="nav-dd-menu">
          <div class="nav-dd-menu-inner">
            <div class="nav-dd-item" onclick="goGuide('guide')"><span class="dd-icon">🔬</span>Guide Analyses biologiques</div>
            <div class="nav-dd-sep"></div>
            <div class="nav-dd-item" onclick="goGuide('guide-meta')"><span class="dd-icon">⚡</span>Guide des métabolismes</div>
            <div class="nav-dd-item" onclick="goGuide('guide-comp')"><span class="dd-icon">💊</span>Guide Compléments alimentaires</div>
            <div class="nav-dd-item" onclick="goGuide('guide-alim')"><span class="dd-icon">🥦</span>Guide Aliments fonctionnels</div>
          </div>
        </div>
      </div>
    </div>
    <div class="nav-r">
      ${CHECKIN_BTN}
      <div class="nav-user" onclick="go('data')" id="nav-user-pill">
        <div class="nav-user-avatar" id="nav-avatar">?</div>
        <span id="nav-username">Mon espace</span>
      </div>
    </div>
  </div>
</nav>`;
  }

  function navSimple({ backUrl = 'index.html', backLabel = '← Accueil' } = {}) {
    return `
<nav class="nav" role="navigation" aria-label="Navigation">
  <div class="nav-in">
    <a class="nav-logo" href="${backUrl}">
      <div class="nav-mark">${LOGO_SVG_PROFILE}</div>
      <div class="nav-type">Profilys</div>
    </a>
    <div class="nav-r">
      <a class="nav-back-link" href="${backUrl}">${backLabel}</a>
    </div>
  </div>
</nav>`;
  }

  function navCheckin() {
    return `
<nav class="nav">
  <div class="nav-in">
    <a class="nav-logo" href="app.html">
      <div class="nav-mark">${LOGO_SVG_SHIELD}</div>
      <div class="nav-type">Profilys</div>
    </a>
    <div class="nav-links">
      <div class="nl" onclick="window.location.href='app.html'">Dashboard</div>
      <div class="nl" onclick="window.location.href='monitoring.html'">Monitoring</div>
      <div class="nl" onclick="window.location.href='questionnaire_contexte_bilan_v6.html'">Profil Santé</div>
      <div class="nl" onclick="window.location.href='bilan_coaching_premium.html'">Bilan Bio</div>
    </div>
    <div class="nav-r">
      ${CHECKIN_BTN}
    </div>
  </div>
</nav>`;
  }

  /* ══════════════════════════════════════════════════════
     FOOTERS
     Types : 'landing' | 'app' | 'legal'
     basePath : chemin relatif vers /legal/ (ex: '../legal/' pour les guides)
  ══════════════════════════════════════════════════════ */

  function footer({ type = 'app', basePath = 'legal/' } = {}) {
    const disc = type === 'landing'
      ? `Outil de suivi personnel et d'aide à la compréhension de son hygiène de vie.
         Ne constitue pas un acte médical ni un diagnostic.
         Toute décision thérapeutique doit être prise avec un professionnel de santé qualifié.`
      : `Données stockées localement dans votre navigateur · Ne remplace pas un avis médical`;

    return `
<footer class="footer">
  <div class="footer-logo">Profilys</div>
  <p class="footer-disc">${disc}</p>
  <nav class="footer-links" aria-label="Liens légaux">
    <a href="${basePath}avertissement.html">Avertissement</a>
    <span class="footer-sep">·</span>
    <a href="${basePath}confidentialite.html">Confidentialité</a>
    <span class="footer-sep">·</span>
    <a href="${basePath}mentions-legales.html">Mentions légales</a>
  </nav>
</footer>`;
  }

  /* ══════════════════════════════════════════════════════
     INJECTION HELPERS
     Injecte dans un élément DOM existant ou crée un wrapper
  ══════════════════════════════════════════════════════ */

  function injectNav(type = 'app', options = {}) {
    const target = document.getElementById('nav-placeholder') || (() => {
      const el = document.createElement('div');
      document.body.prepend(el);
      return el;
    })();

    const navMap = { landing: navLanding, app: navApp, simple: navSimple, checkin: navCheckin };
    const fn = navMap[type] || navApp;
    target.outerHTML = fn(options);
  }

  function injectFooter(options = {}) {
    const target = document.getElementById('footer-placeholder');
    if (target) {
      target.outerHTML = footer(options);
    }
  }

  /* ── API publique ────────────────────────────────────── */
  return { injectNav, injectFooter, navLanding, navApp, navSimple, navCheckin, footer };

})();

window.ProfilysComponents = ProfilysComponents;
