/**
 * ============================================================
 *  PRÉVIO — previo-supabase.js
 *  Client centralisé : Auth + Check-in + Biomarqueurs + Scores
 *
 *  Usage dans chaque page HTML :
 *  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *  <script src="previo-supabase.js"></script>
 * ============================================================
 */

// ─────────────────────────────────────────
// CONFIG — remplacer par vos vraies valeurs
// (Supabase Dashboard → Settings → API)
// ─────────────────────────────────────────
const SUPABASE_URL  = 'https://nwkgiabchkaabfixxgla.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53a2dpYWJjaGthYWJmaXh4Z2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjgxNzgsImV4cCI6MjA4ODEwNDE3OH0.vOFGsvR9sJZMZ0K_wLxkDiAE0BgF_vVZvrSOGYZAj5g';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ─────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

function nDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
const PrevioAuth = {

  /** Inscription email + mot de passe */
  async signUp(email, password, name) {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    return data;
  },

  /** Connexion */
  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Garder compatibilité avec l'ancien système localStorage
    if (data.user) {
      const profile = await PrevioAuth.getProfile(data.user.id);
      localStorage.setItem('previo_session', JSON.stringify({
        id:    data.user.id,
        email: data.user.email,
        name:  profile?.name || data.user.email
      }));
    }
    return data;
  },

  /** Déconnexion */
  async signOut() {
    localStorage.removeItem('previo_session');
    const { error } = await sb.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html';
  },

  /** Utilisateur courant (depuis la session Supabase) */
  async getUser() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
  },

  /** Profil utilisateur */
  async getProfile(userId) {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  },

  /** Garde-fou : redirige si non connecté */
  async requireAuth(redirectTo = 'index.html') {
    const user = await PrevioAuth.getUser();
    if (!user) {
      window.location.href = redirectTo;
      return null;
    }
    return user;
  }
};


// ─────────────────────────────────────────
// CHECK-IN
// ─────────────────────────────────────────
const PrevioCheckin = {

  /**
   * Enregistre un signal (upsert = crée ou met à jour)
   * @param {string} signalId  — 'poids', 'sommeil', 'stress'...
   * @param {*}      value     — number | string | object
   * @param {string} date      — 'YYYY-MM-DD' (défaut: aujourd'hui)
   */
  async save(signalId, value, date = today()) {
    const user = await PrevioAuth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await sb
      .from('checkins')
      .upsert({
        user_id:   user.id,
        date,
        signal_id: signalId,
        value:     value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,date,signal_id' })
      .select()
      .single();

    if (error) throw error;

    // Garder compatibilité localStorage pour les pages non migrées
    _syncToLocalStorage(signalId, value, date);

    return data;
  },

  /**
   * Charge tous les signaux d'une journée
   * @returns {Object} — { poids: 72.5, sommeil: 4, ... }
   */
  async loadDay(date = today()) {
    const user = await PrevioAuth.getUser();
    if (!user) return {};

    const { data, error } = await sb
      .from('checkins')
      .select('signal_id, value')
      .eq('user_id', user.id)
      .eq('date', date);

    if (error) return {};

    return data.reduce((acc, row) => {
      acc[row.signal_id] = row.value;
      return acc;
    }, {});
  },

  /**
   * Historique d'un signal sur N jours
   * @returns {Array} — [{ date: '2025-03-01', value: 72.5 }, ...]
   */
  async history(signalId, days = 30) {
    const user = await PrevioAuth.getUser();
    if (!user) return [];

    const { data, error } = await sb
      .from('checkins')
      .select('date, value')
      .eq('user_id', user.id)
      .eq('signal_id', signalId)
      .gte('date', nDaysAgo(days))
      .order('date', { ascending: true });

    if (error) return [];
    return data.map(r => ({ date: r.date, value: r.value }));
  },

  /**
   * Streak actuel (jours consécutifs avec au moins 1 signal)
   */
  async streak() {
    const user = await PrevioAuth.getUser();
    if (!user) return 0;

    const { data } = await sb
      .from('checkins')
      .select('date')
      .eq('user_id', user.id)
      .gte('date', nDaysAgo(365))
      .order('date', { ascending: false });

    if (!data || data.length === 0) return 0;

    const dates = [...new Set(data.map(r => r.date))];
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (const dateStr of dates) {
      const d = new Date(dateStr);
      const diff = Math.round((cursor - d) / 86400000);
      if (diff <= 1) {
        streak++;
        cursor = d;
      } else {
        break;
      }
    }
    return streak;
  },

  /**
   * Données pour le graphique hebdomadaire (vue calendrier)
   * @returns {Array} — [{ date, hasData, isToday }, ...] pour 7 jours
   */
  async weekCalendar() {
    const user = await PrevioAuth.getUser();
    if (!user) return [];

    const { data } = await sb
      .from('checkins')
      .select('date')
      .eq('user_id', user.id)
      .gte('date', nDaysAgo(6))
      .order('date');

    const filledDates = new Set((data || []).map(r => r.date));
    const todayStr = today();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        date:    dateStr,
        day:     d.getDate(),
        label:   ['D','L','M','M','J','V','S'][d.getDay()],
        hasData: filledDates.has(dateStr),
        isToday: dateStr === todayStr
      });
    }
    return result;
  }
};


// ─────────────────────────────────────────
// BIOMARQUEURS
// ─────────────────────────────────────────
const PrevioBio = {

  /**
   * Enregistre un bilan complet
   * @param {string} bilanDate  — 'YYYY-MM-DD'
   * @param {Array}  markers    — [{ marker_id, marker_name, value, unit, category, ref_min, ref_max, status }]
   */
  async saveBilan(bilanDate, markers) {
    const user = await PrevioAuth.getUser();
    if (!user) throw new Error('Non authentifié');

    const rows = markers.map(m => ({
      user_id:     user.id,
      bilan_date:  bilanDate,
      marker_id:   m.marker_id,
      marker_name: m.marker_name,
      value:       m.value,
      unit:        m.unit       || null,
      category:    m.category   || null,
      ref_min:     m.ref_min    || null,
      ref_max:     m.ref_max    || null,
      status:      m.status     || null
    }));

    const { data, error } = await sb
      .from('biomarqueurs')
      .upsert(rows, { onConflict: 'user_id,bilan_date,marker_id' })
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Historique d'un biomarqueur pour les graphiques
   * @returns {Array} — [{ date: '2025-03-01', value: 103, status: 'limite' }, ...]
   */
  async history(markerId) {
    const user = await PrevioAuth.getUser();
    if (!user) return [];

    const { data, error } = await sb
      .from('biomarqueurs')
      .select('bilan_date, value, status, unit, ref_min, ref_max')
      .eq('user_id', user.id)
      .eq('marker_id', markerId)
      .order('bilan_date', { ascending: true });

    if (error) return [];
    return data.map(r => ({
      date:   r.bilan_date,
      value:  r.value,
      status: r.status,
      unit:   r.unit,
      refMin: r.ref_min,
      refMax: r.ref_max
    }));
  },

  /**
   * Dernier bilan complet
   * @returns {Object} — { glycemie: { value, date, status }, ... }
   */
  async latest() {
    const user = await PrevioAuth.getUser();
    if (!user) return {};

    // Date du bilan le plus récent
    const { data: latest } = await sb
      .from('biomarqueurs')
      .select('bilan_date')
      .eq('user_id', user.id)
      .order('bilan_date', { ascending: false })
      .limit(1)
      .single();

    if (!latest) return {};

    const { data } = await sb
      .from('biomarqueurs')
      .select('*')
      .eq('user_id', user.id)
      .eq('bilan_date', latest.bilan_date);

    return (data || []).reduce((acc, m) => {
      acc[m.marker_id] = {
        value:    m.value,
        unit:     m.unit,
        date:     m.bilan_date,
        status:   m.status,
        refMin:   m.ref_min,
        refMax:   m.ref_max,
        category: m.category
      };
      return acc;
    }, {});
  },

  /**
   * Toutes les dates de bilans disponibles
   */
  async bilanDates() {
    const user = await PrevioAuth.getUser();
    if (!user) return [];

    const { data } = await sb
      .from('biomarqueurs')
      .select('bilan_date')
      .eq('user_id', user.id)
      .order('bilan_date', { ascending: false });

    return [...new Set((data || []).map(r => r.bilan_date))];
  }
};


// ─────────────────────────────────────────
// SCORES santé
// ─────────────────────────────────────────
const PrevioScores = {

  /** Sauvegarde les scores calculés */
  async save(scores, rawData = null) {
    const user = await PrevioAuth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await sb
      .from('scores')
      .upsert({
        user_id:      user.id,
        computed_at:  today(),
        global:       scores.global       || null,
        metabolique:  scores.metabolique  || null,
        sommeil:      scores.sommeil      || null,
        stress:       scores.stress       || null,
        nutrition:    scores.nutrition    || null,
        activite:     scores.activite     || null,
        inflammation: scores.inflammation || null,
        raw_data:     rawData
      }, { onConflict: 'user_id,computed_at' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /** Scores les plus récents */
  async latest() {
    const user = await PrevioAuth.getUser();
    if (!user) return null;

    const { data } = await sb
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('computed_at', { ascending: false })
      .limit(1)
      .single();

    return data || null;
  },

  /** Historique des scores pour tendance */
  async history(days = 90) {
    const user = await PrevioAuth.getUser();
    if (!user) return [];

    const { data } = await sb
      .from('scores')
      .select('computed_at, global, metabolique, sommeil, stress, nutrition, activite, inflammation')
      .eq('user_id', user.id)
      .gte('computed_at', nDaysAgo(days))
      .order('computed_at', { ascending: true });

    return data || [];
  }
};


// ─────────────────────────────────────────
// PROFIL SANTÉ (questionnaires)
// ─────────────────────────────────────────
const PrevioProfil = {

  async save(moduleId, responses) {
    const user = await PrevioAuth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await sb
      .from('profil_sante')
      .upsert({
        user_id:   user.id,
        module_id: moduleId,
        responses,
        completed: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async load(moduleId) {
    const user = await PrevioAuth.getUser();
    if (!user) return null;

    const { data } = await sb
      .from('profil_sante')
      .select('responses, completed, updated_at')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .single();

    return data || null;
  },

  async completionStatus() {
    const user = await PrevioAuth.getUser();
    if (!user) return { completed: 0, total: 3, pct: 0 };

    const { data } = await sb
      .from('profil_sante')
      .select('module_id, completed')
      .eq('user_id', user.id)
      .eq('completed', true);

    const completed = (data || []).length;
    return { completed, total: 3, pct: Math.round((completed / 3) * 100) };
  }
};


// ─────────────────────────────────────────
// DASHBOARD — agrégation des données
// ─────────────────────────────────────────
const PrevioDashboard = {

  /**
   * Charge tout ce dont le dashboard a besoin en 1 appel parallèle
   */
  async load() {
    const user = await PrevioAuth.getUser();
    if (!user) return null;

    const [scores, profile, checkinToday, bioLatest, completion] = await Promise.all([
      PrevioScores.latest(),
      PrevioAuth.getProfile(user.id),
      PrevioCheckin.loadDay(),
      PrevioBio.latest(),
      PrevioProfil.completionStatus()
    ]);

    return {
      user,
      profile,
      scores,
      checkinToday,
      bioLatest,
      completion
    };
  }
};


// ─────────────────────────────────────────
// MONITORING — données pour les graphiques
// ─────────────────────────────────────────
const PrevioMonitoring = {

  /**
   * Charge l'historique de tous les biomarqueurs
   * pour alimenter drawAllCharts()
   */
  async loadAllCharts() {
    const user = await PrevioAuth.getUser();
    if (!user) return {};

    const { data } = await sb
      .from('biomarqueurs')
      .select('marker_id, bilan_date, value, ref_min, ref_max, status')
      .eq('user_id', user.id)
      .order('bilan_date', { ascending: true });

    // Regrouper par marker_id
    const grouped = {};
    for (const row of (data || [])) {
      if (!grouped[row.marker_id]) grouped[row.marker_id] = [];
      grouped[row.marker_id].push({
        date:   row.bilan_date,
        v:      row.value,
        refMin: row.ref_min,
        refMax: row.ref_max,
        status: row.status
      });
    }
    return grouped;
  },

  /**
   * Historique check-in pour afficher dans le monitoring
   * (poids, stress, sommeil sur courbe temporelle)
   */
  async loadCheckinCharts(days = 30) {
    const user = await PrevioAuth.getUser();
    if (!user) return {};

    const signals = ['poids', 'sommeil', 'stress', 'fatigue', 'ecran'];
    const result = {};

    for (const sig of signals) {
      result[sig] = await PrevioCheckin.history(sig, days);
    }

    return result;
  }
};


// ─────────────────────────────────────────
// COMPATIBILITÉ localStorage
//   (sync vers ancien système pendant migration)
// ─────────────────────────────────────────
function _syncToLocalStorage(signalId, value, date) {
  try {
    const key = 'previo_checkins';
    const history = JSON.parse(localStorage.getItem(key) || '{}');
    if (!history[date]) history[date] = { d: date, ts: new Date().toISOString(), s: {} };
    history[date].s[signalId] = value;
    history[date].ts = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(history));
  } catch (e) { /* ignore */ }
}


// ─────────────────────────────────────────
// EXPORTS globaux (utilisables dans HTML)
// ─────────────────────────────────────────
window.PrevioAuth       = PrevioAuth;
window.PrevioCheckin    = PrevioCheckin;
window.PrevioBio        = PrevioBio;
window.PrevioScores     = PrevioScores;
window.PrevioProfil     = PrevioProfil;
window.PrevioDashboard  = PrevioDashboard;
window.PrevioMonitoring = PrevioMonitoring;
window.sb               = sb; // accès direct si besoin

console.log('✅ Prévio Supabase client chargé');
