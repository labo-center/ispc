# CLAUDE.md — Projet Profilys (repo : ispc)

> Fichier de contexte pour Claude Code et le Projet Claude.
> À placer à la racine du repo. Mettre à jour après chaque décision technique majeure.

---

## 🎯 Description du projet

**Profilys** est une application web de suivi de santé personnel.
Elle permet à un utilisateur authentifié de :
- Saisir et visualiser ses **bilans biologiques** (biomarqueurs)
- Faire des **check-ins quotidiens** (humeur, sommeil, stress, poids, fatigue, écrans)
- Consulter des **scores de santé** calculés (global, métabolique, sommeil, stress, nutrition, activité, inflammation)
- Accéder à des **guides thématiques** (aliments, compléments, métabolismes...)
- Remplir un **questionnaire contextuel** avant bilan

**URL production :** https://ispc-five.vercel.app
**Repo GitHub :** https://github.com/labo-center/ispc (branche `main`)
**Développeur :** Olivier (solo)

---

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Frontend | HTML5 / CSS3 / JavaScript vanilla (ES6+, pas de framework) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Hébergement | Vercel (déploiement auto depuis GitHub main) |
| Auth | Supabase Auth (email + password) |
| CDN Supabase | `cdn.jsdelivr.net/npm/@supabase/supabase-js@2` |

**Pas de bundler, pas de TypeScript, pas de npm.** Tout est du JS natif chargé via `<script>`.

---

## 📁 Structure des fichiers

```
ispc/
├── CLAUDE.md                              ← ce fichier
├── vercel.json                            ← config routing Vercel
├── supabase-client.js                     ← ⚠️ FICHIER CENTRAL — client Supabase + tous les modules
├── supabase.min.js                        ← lib Supabase (ne pas modifier)
│
├── index.html                             ← landing page / login / inscription
├── app.html                               ← dashboard principal (post-login)
├── checkin.html                           ← check-in quotidien (mobile-first)
├── monitoring.html                        ← graphiques biomarqueurs + check-ins
├── bilan_coaching_premium.html            ← vue bilan enrichi / coaching
├── exemple_bilan_augmente.html            ← exemple/démo bilan
├── questionnaire_contexte_bilan_v6.html   ← questionnaire pré-bilan (18 champs)
│
├── assets/
│   ├── css/
│   │   └── style.css                      ← styles globaux partagés
│   └── js/
│       ├── supabase-client.js             ← copie/alias ? vérifier lequel est utilisé
│       ├── components.js                  ← composants UI réutilisables
│       └── config.js                      ← config globale (constantes, thème...)
│
├── guides/                                ← guides santé en HTML
│   ├── guide-aliments-fonctionnels.html
│   ├── guide-analyses-biologiques.html
│   ├── guide-complements-alimentaires.html
│   ├── guide-metabolismes.html
│   └── guide-previo-longevite.html
│
├── legal/                                 ← pages légales
│   ├── avertissement.html
│   ├── confidentialite.html
│   └── mentions-legales.html
│
└── favicons/                              ← icônes (ne pas modifier)
```

> ⚠️ **Attention :** `supabase-client.js` existe à la racine ET dans `assets/js/`. Vérifier lequel est réellement chargé par chaque page HTML pour éviter les divergences.

---

## 🏗️ Architecture du client Supabase (`supabase-client.js`)

Le fichier central expose **7 modules globaux** via `window.*` :

| Module | Rôle |
|---|---|
| `PrevioAuth` | signUp, signIn, signOut, getUser, getProfile, requireAuth |
| `PrevioCheckin` | save (upsert), loadDay, history, streak, weekCalendar |
| `PrevioBio` | saveBilan, history, latest, bilanDates |
| `PrevioScores` | save, latest, history |
| `PrevioProfil` | save, load, completionStatus (3 modules max) |
| `PrevioDashboard` | load() — charge tout en parallel (Promise.all) |
| `PrevioMonitoring` | loadAllCharts, loadCheckinCharts |

**Pattern d'authentification :** chaque méthode appelle `PrevioAuth.getUser()` en premier. Si `null` → retourne `{}`, `[]`, `0` ou `null` selon le contexte (jamais d'exception silencieuse côté UI).

**Tables Supabase utilisées :**
- `profiles` — données profil utilisateur
- `checkins` — signaux quotidiens (clé unique : `user_id, date, signal_id`)
- `biomarqueurs` — résultats bilans (clé unique : `user_id, bilan_date, marker_id`)
- `scores` — scores calculés (clé unique : `user_id, computed_at`)
- `profil_sante` — réponses questionnaires (clé unique : `user_id, module_id`)

---

## 🎨 Design system

- **Background :** `#0A0F1E` (dark navy)
- **Accent primaire :** teal/cyan
- **Accent secondaire :** violet/purple
- **Typographie titres :** serif (style premium médical)
- **Approche :** mobile-first, dark theme permanent
- **CSS partagé :** `assets/css/style.css`
- **Pas de framework CSS** (pas de Bootstrap, Tailwind, etc.)

---

## ⚠️ Règles absolues (NE JAMAIS faire)

1. **JAMAIS exposer la clé `service_role` Supabase côté client** — seule la clé `anon` est autorisée
2. **JAMAIS désactiver RLS** sur une table contenant des données utilisateur
3. **JAMAIS stocker des données de santé en clair** dans localStorage (uniquement IDs/session)
4. **JAMAIS modifier `supabase.min.js`** — c'est une librairie externe
5. **JAMAIS créer de backend custom** (serveur Node, Python, etc.) — tout passe par Supabase
6. **JAMAIS faire de requête Supabase sans vérifier `auth.uid()`** côté RLS
7. **JAMAIS committer** sans avoir testé le flux auth (login → page → données → logout)

---

## ✅ Ce qui nécessite mon approbation avant modification

- Toute modification de `supabase-client.js` (impact sur toutes les pages)
- Ajout ou modification de tables/colonnes Supabase
- Modification des politiques RLS
- Changement de structure de `vercel.json` (risque de casser le routing prod)
- Ajout de scripts tiers (analytics, CDN externes)
- Toute modification touchant aux données de santé (RGPD art. 9)

---

## 🔁 Patterns de code établis

### Chargement d'une page protégée
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const user = await PrevioAuth.requireAuth(); // redirige si non connecté
  if (!user) return;
  // charger les données...
});
```

### Sauvegarde upsert (checkin)
```javascript
await PrevioCheckin.save('sommeil', 7.5); // date = aujourd'hui par défaut
```

### Chargement dashboard complet
```javascript
const data = await PrevioDashboard.load();
// data = { user, profile, scores, checkinToday, bioLatest, completion }
```

### Pattern de gestion d'erreur
```javascript
try {
  const data = await PrevioXxx.method();
  // traiter data
} catch (err) {
  console.error('Erreur:', err.message);
  // afficher message utilisateur (pas le message technique brut)
}
```

---

## 🔒 Contexte sécurité & RGPD

- **Données de santé = catégorie spéciale RGPD (art. 9)** — protection renforcée obligatoire
- RLS activé sur toutes les tables — vérifier après chaque migration Supabase
- La clé `anon` Supabase est publique par conception (OK tant que RLS est correct)
- Session stockée dans localStorage (`previo_session`) pour compatibilité — contient uniquement `id, email, name` (pas de données de santé)
- Pages légales présentes : `legal/confidentialite.html`, `legal/mentions-legales.html`, `legal/avertissement.html`
- Droit à l'effacement : **non encore implémenté** (à faire avant lancement public)

---

## 📖 Ordre de lecture recommandé pour comprendre le projet

1. `supabase-client.js` — architecture des données et auth
2. `index.html` — flux login/inscription
3. `app.html` — dashboard principal
4. `checkin.html` — UX mobile check-in
5. `questionnaire_contexte_bilan_v6.html` — formulaire complexe
6. `monitoring.html` — visualisation données
7. `assets/js/components.js` — composants réutilisables
8. `vercel.json` — routing

---

## 🗺️ État MVP (avril 2026)

**Fait :**
- [x] Landing page + auth Supabase
- [x] Questionnaire contextuel bilan (18 champs, v6)
- [x] Check-in quotidien (signaux : poids, sommeil, stress, fatigue, écrans)
- [x] Client Supabase centralisé (7 modules)
- [x] Scores de santé (global, métabolique, sommeil, stress, nutrition, activité, inflammation)
- [x] Guides thématiques (5 guides)
- [x] Pages légales
- [x] Design dark theme premium

**Reste à faire (MVP) :**
- [ ] Saisie manuelle bilan biologique (interface utilisateur)
- [ ] Historique bilans (liste + détail)
- [ ] Dashboard avec graphiques (monitoring)
- [ ] Export PDF bilan contextualisé
- [ ] Droit à l'effacement (RGPD)
- [ ] Tests flux complet en navigation privée

---

*Dernière mise à jour : avril 2026*
*Stack : HTML/CSS/JS vanilla + Supabase + Vercel*
