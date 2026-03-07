/* ═══════════════════════════════════════════════════════════
   Profilys — supabase-client.js
   Client centralisé : Auth + Checkins + Bilans + Scores
   Remplace localStorage par Supabase, avec fallback offline
═══════════════════════════════════════════════════════════ */

const SUPABASE_URL  = 'https://nwkgiabchkaabfixxgla.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53a2dpYWJjaGthYWJmaXh4Z2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjgxNzgsImV4cCI6MjA4ODEwNDE3OH0.vOFGsvR9sJZMZ0K_wLxkDiAE0BgF_vVZvrSOGYZAj5g';

/* Initialisation du client Supabase (lib chargée via supabase.min.js) */
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

function _err(context, error) {
  console.warn(`[Profilys/${context}]`, error?.message || error);
}

/* ═══════════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════════ */
const ProfilysAuth = {

  async signUp(email, password, name) {
    const { data, error } = await _sb.auth.signUp({
      email, password,
      options: { data: { name } }
    });
    if (error) { _err('signUp', error); return { error }; }
    return { user: data.user, session: data.session };
  },

  async signIn(email, password) {
    const { data, error } = await _sb.auth.signInWithPassword({ email, password });
    if (error) { _err('signIn', error); return { error }; }
    return { user: data.user, session: data.session };
  },

  async signOut() {
    const { error } = await _sb.auth.signOut();
    if (error) _err('signOut', error);
    localStorage.removeItem(PROFILYS.keys.session);
    return { error };
  },

  async getSession() {
    const { data, error } = await _sb.auth.getSession();
    if (error) { _err('getSession', error); return null; }
    return data.session;
  },

  async getUser() {
    const { data, error } = await _sb.auth.getUser();
    if (error) { _err('getUser', error); return null; }
    return data.user;
  },

  onAuthChange(callback) {
    return _sb.auth.onAuthStateChange((event, session) => callback(event, session));
  },

  async resetPassword(email) {
    const { error } = await _sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/app.html`
    });
    if (error) { _err('resetPassword', error); return { error }; }
    return { ok: true };
  }
};

/* ═══════════════════════════════════════════════════════════
   BASE DE DONNÉES
═══════════════════════════════════════════════════════════ */
const ProfilysDB = {

  /* ── Profil ─────────────────────────────────────────────── */
  async getProfil() {
    const { data, error } = await _sb.from('profils').select('*').single();
    if (error) { _err('getProfil', error); return null; }
    return data;
  },

  async updateProfil(updates) {
    const { data, error } = await _sb.from('profils').update(updates).select().single();
    if (error) { _err('updateProfil', error); return { error }; }
    return { data };
  },

  async getProfilState() {
    const { data, error } = await _sb.from('profils').select('profil_state').single();
    if (error) { _err('getProfilState', error); return {}; }
    return data?.profil_state || {};
  },

  async saveProfilState(state) {
    const { error } = await _sb.from('profils').update({ profil_state: state });
    if (error) { _err('saveProfilState', error); return false; }
    return true;
  },

  /* ── Checklist ──────────────────────────────────────────── */
  async getChecklist() {
    const { data, error } = await _sb.from('profils').select('checklist').single();
    if (error) { _err('getChecklist', error); return {}; }
    return data?.checklist || {};
  },

  async saveChecklist(checklist) {
    const { error } = await _sb.from('profils').update({ checklist });
    if (error) { _err('saveChecklist', error); return false; }
    return true;
  },

  /* ── Scores ─────────────────────────────────────────────── */
  async getScores() {
    const { data, error } = await _sb.from('scores').select('data, answers').single();
    if (error) { _err('getScores', error); return {}; }
    return { scores: data?.data || {}, answers: data?.answers || {} };
  },

  async saveScores(scores, answers) {
    const user = await ProfilysAuth.getUser();
    if (!user) return false;
    const { error } = await _sb.from('scores').upsert({
      user_id: user.id,
      data: scores,
      answers: answers || {},
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    if (error) { _err('saveScores', error); return false; }
    return true;
  },

  /* ── Checkins ───────────────────────────────────────────── */
  async getCheckins() {
    const { data, error } = await _sb
      .from('checkins').select('*').order('date', { ascending: false });
    if (error) { _err('getCheckins', error); return {}; }
    const map = {};
    (data || []).forEach(row => { map[row.date] = { d: row.date, ts: row.ts, s: row.signals }; });
    return map;
  },

  async getCheckin(date) {
    const { data, error } = await _sb
      .from('checkins').select('*').eq('date', date).single();
    if (error) return null;
    return data ? { d: data.date, ts: data.ts, s: data.signals } : null;
  },

  async saveCheckinSignal(date, signalId, value) {
    const { data: existing } = await _sb
      .from('checkins').select('signals').eq('date', date).single();
    const signals = { ...(existing?.signals || {}), [signalId]: value };
    const user = await ProfilysAuth.getUser();
    if (!user) return false;
    const { error } = await _sb.from('checkins').upsert({
      user_id: user.id,
      date,
      signals,
      ts: new Date().toISOString()
    }, { onConflict: 'user_id,date' });
    if (error) { _err('saveCheckinSignal', error); return false; }
    return true;
  },

  async getStreak() {
    const { data, error } = await _sb
      .from('checkins').select('date').order('date', { ascending: false }).limit(365);
    if (error || !data?.length) return 0;
    let streak = 0;
    let cursor = new Date(); cursor.setHours(0,0,0,0);
    for (const row of data) {
      const rowDate = new Date(row.date + 'T00:00:00');
      const diff = Math.round((cursor - rowDate) / 86400000);
      if (diff === 0 || diff === 1) { streak++; cursor = rowDate; }
      else break;
    }
    return streak;
  },

  /* ── Bilans biologiques ─────────────────────────────────── */
  async getBilans() {
    const { data, error } = await _sb
      .from('bilans').select('*').order('date', { ascending: false });
    if (error) { _err('getBilans', error); return {}; }
    const map = {};
    (data || []).forEach(row => { map[row.id] = { id: row.id, date: row.date, ...row.data }; });
    return map;
  },

  async saveBilan(date, bilanData) {
    const user = await ProfilysAuth.getUser();
    if (!user) return false;
    const { error } = await _sb.from('bilans').insert({ user_id: user.id, date, data: bilanData });
    if (error) { _err('saveBilan', error); return false; }
    return true;
  },

  async deleteBilan(id) {
    const { error } = await _sb.from('bilans').delete().eq('id', id);
    if (error) { _err('deleteBilan', error); return false; }
    return true;
  }
};

/* ── Exposition globale ──────────────────────────────────── */
window.ProfilysAuth = ProfilysAuth;
window.ProfilysDB   = ProfilysDB;
window._sb          = _sb;
