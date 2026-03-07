/* ═══════════════════════════════════════════════════════════
   Profilys — config.js
   Constantes partagées : clés localStorage, URLs, version
   À inclure en premier dans chaque page
═══════════════════════════════════════════════════════════ */

const PROFILYS = {

  version: '1.2',

  /* ── Clés localStorage ──────────────────────────────────
     Toujours utiliser ces constantes, jamais les chaînes
     en dur, pour éviter les typos et simplifier une future
     migration vers Supabase (remplacer ici suffit).
  ────────────────────────────────────────────────────────── */
  keys: {
    session:        'profilys_session',
    profiles:       'profilys_profiles',
    demo:           'profilys_demo',

    // Check-in quotidien
    checkins:       'profilys_checkins',

    // Bilans biologiques
    bilans:         'profilys_bilans',

    // Questionnaires & scores
    scores:         'profilys_scores',
    profilState:    'profilys_profil_state',
    checklist:      'profilys_checklist',

    // Réponses modules (suffixe dynamique : + '_' + moduleId)
    answersPrefix:  'profilys_answers_',
  },

  /* ── URLs internes ─────────────────────────────────────── */
  urls: {
    app:             'app.html',
    checkin:         'checkin.html',
    monitoring:      'monitoring.html',
    bilan:           'bilan_coaching_premium.html',
    questionnaire:   'questionnaire_contexte_bilan_v6.html',
    guideAnalyses:   'guides/guide-analyses-biologiques.html',
    guideMeta:       'guides/guide-metabolismes.html',
    guideComplements:'guides/guide-complements-alimentaires.html',
    guideAliments:   'guides/guide-aliments-fonctionnels.html',
    guideLongevite:  'guides/guide-previo-longevite.html',
  },

  /* ── Helpers localStorage ──────────────────────────────── */
  get(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch(e) { return null; }
  },

  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch(e) { console.warn('Profilys.set failed:', key, e); return false; }
  },

  remove(key) {
    try { localStorage.removeItem(key); return true; }
    catch(e) { return false; }
  },

  getSession() {
    return this.get(this.keys.session);
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  /* ── postMessage event types ───────────────────────────── */
  events: {
    moduleDone:  'profilys-module-done',
    progress:    'profilys-progress',
  },
};

/* Rendre disponible globalement */
window.PROFILYS = PROFILYS;

/* ═══════════════════════════════════════════════════════════
   Supabase — credentials
   (clé anon publique, sécurité gérée par RLS côté Supabase)
═══════════════════════════════════════════════════════════ */
PROFILYS.supabase = {
  url:  'https://nwkgiabchkaabfixxgla.supabase.co',
  anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53a2dpYWJjaGthYWJmaXh4Z2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjgxNzgsImV4cCI6MjA4ODEwNDE3OH0.vOFGsvR9sJZMZ0K_wLxkDiAE0BgF_vVZvrSOGYZAj5g',
};
