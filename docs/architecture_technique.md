# Architecture Technique — Profilys

## Stack

| Couche | Technologie | Remarques |
|---|---|---|
| Frontend | HTML5 / CSS3 / JS vanilla ES6+ | Pas de framework, pas de bundler |
| Backend | Supabase (PostgreSQL + Auth) | PaaS managé, pas de serveur custom |
| Hébergement | Vercel | Deploy auto depuis GitHub `main` |
| Auth | Supabase Auth email/password | Session JWT côté client |
| CDN | jsdelivr (supabase-js@2) | Librairie Supabase chargée via `<script>` |

## Structure des fichiers

```
ispc/
├── supabase-client.js          ← CLIENT CENTRAL (ne pas dupliquer)
├── index.html                  ← Landing + auth
├── app.html                    ← Dashboard
├── checkin.html                ← Check-in quotidien (mobile-first)
├── monitoring.html             ← Graphiques biomarqueurs
├── bilan_coaching_premium.html ← Bilan enrichi
├── questionnaire_contexte_bilan_v6.html
├── assets/css/style.css        ← Styles globaux
├── assets/js/components.js     ← Composants UI
├── assets/js/config.js         ← Constantes globales
├── guides/                     ← 5 guides santé HTML
├── legal/                      ← CGU, confidentialité, avertissement
└── favicons/
```

## Flux de données

```
Utilisateur
    ↓ email + password
Supabase Auth  →  JWT token  →  localStorage (session)
    ↓
supabase-client.js (modules Previo*)
    ↓ requêtes RLS-protégées
Supabase PostgreSQL
    ↓
Tables : profiles / checkins / biomarqueurs / scores / profil_sante
```

## Modules client (`supabase-client.js`)

Exposés sur `window.*` pour accès global depuis toutes les pages HTML :

- `PrevioAuth` — authentification et profil
- `PrevioCheckin` — signaux quotidiens
- `PrevioBio` — bilans biologiques
- `PrevioScores` — scores de santé calculés
- `PrevioProfil` — questionnaires profil
- `PrevioDashboard` — agrégation parallèle (Promise.all)
- `PrevioMonitoring` — données graphiques

## Tables Supabase

| Table | Clé unique | Données |
|---|---|---|
| `profiles` | `id` (= auth.uid) | nom, prénom, date naissance, sexe, taille, poids |
| `checkins` | `user_id, date, signal_id` | valeur signal quotidien |
| `biomarqueurs` | `user_id, bilan_date, marker_id` | valeur, unité, ref_min/max, statut |
| `scores` | `user_id, computed_at` | scores globaux et par dimension |
| `profil_sante` | `user_id, module_id` | réponses questionnaires (JSONB) |

## Contraintes architecturales

- **Pas de backend custom** — toute logique métier dans Supabase (RLS + fonctions) ou côté client
- **Clé `anon` publique** — acceptable si RLS correctement configuré sur chaque table
- **Pas de `service_role` côté client** — règle absolue
- **Compatibilité localStorage** — sync maintenue pendant migration (à supprimer ensuite)
- **Vercel = fichiers statiques** — pas de SSR, pas d'API routes

## Points de vigilance

- `supabase-client.js` existe à la racine ET dans `assets/js/` — vérifier lequel est chargé par chaque page
- Le droit à l'effacement RGPD n'est pas encore implémenté
- Aucun test automatisé — validation manuelle uniquement

*Mis à jour : avril 2026*
