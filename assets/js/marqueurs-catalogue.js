// assets/js/marqueurs-catalogue.js
// Catalogue des marqueurs biologiques — Profilys
// Structure : { id, nom, categorie, unite, ref_min, ref_max, description }
// Unités : SI uniquement. Valeurs de référence : plages larges (MVP).
// Dernière mise à jour : avril 2026

const MARQUEURS_CATALOGUE = [

  // ── MÉTABOLISME GLUCIDIQUE ──────────────────────────────────────────
  { id: 'glycemie_a_jeun',   nom: 'Glycémie à jeun',        categorie: 'Métabolisme glucidique', unite: 'mmol/L', ref_min: 3.9,  ref_max: 5.6,  description: 'Taux de glucose sanguin à jeun' },
  { id: 'hba1c',             nom: 'HbA1c',                   categorie: 'Métabolisme glucidique', unite: '%',      ref_min: null, ref_max: 5.7,  description: 'Hémoglobine glyquée — moyenne 3 mois' },
  { id: 'insuline',          nom: 'Insuline à jeun',         categorie: 'Métabolisme glucidique', unite: 'µUI/mL', ref_min: 2.6,  ref_max: 24.9, description: null },

  // ── BILAN LIPIDIQUE ─────────────────────────────────────────────────
  { id: 'cholesterol_total', nom: 'Cholestérol total',       categorie: 'Bilan lipidique',        unite: 'mmol/L', ref_min: null, ref_max: 5.2,  description: null },
  { id: 'hdl',               nom: 'HDL-cholestérol',         categorie: 'Bilan lipidique',        unite: 'mmol/L', ref_min: 1.0,  ref_max: null, description: 'Bon cholestérol' },
  { id: 'ldl',               nom: 'LDL-cholestérol',         categorie: 'Bilan lipidique',        unite: 'mmol/L', ref_min: null, ref_max: 3.4,  description: 'Mauvais cholestérol' },
  { id: 'triglycerides',     nom: 'Triglycérides',           categorie: 'Bilan lipidique',        unite: 'mmol/L', ref_min: null, ref_max: 1.7,  description: null },

  // ── FONCTION HÉPATIQUE ──────────────────────────────────────────────
  { id: 'alat',              nom: 'ALAT (GPT)',               categorie: 'Fonction hépatique',     unite: 'U/L',    ref_min: null, ref_max: 41,   description: 'Alanine aminotransférase' },
  { id: 'asat',              nom: 'ASAT (GOT)',               categorie: 'Fonction hépatique',     unite: 'U/L',    ref_min: null, ref_max: 40,   description: 'Aspartate aminotransférase' },
  { id: 'ggt',               nom: 'GGT',                     categorie: 'Fonction hépatique',     unite: 'U/L',    ref_min: null, ref_max: 55,   description: 'Gamma-glutamyltransférase' },
  { id: 'bilirubine_totale', nom: 'Bilirubine totale',        categorie: 'Fonction hépatique',     unite: 'µmol/L', ref_min: null, ref_max: 17,   description: null },

  // ── FONCTION RÉNALE ─────────────────────────────────────────────────
  { id: 'creatinine',        nom: 'Créatinine',               categorie: 'Fonction rénale',        unite: 'µmol/L', ref_min: 62,   ref_max: 106,  description: 'Plage large H+F' },
  { id: 'uree',              nom: 'Urée',                     categorie: 'Fonction rénale',        unite: 'mmol/L', ref_min: 2.5,  ref_max: 7.5,  description: null },
  { id: 'acide_urique',      nom: 'Acide urique',             categorie: 'Fonction rénale',        unite: 'µmol/L', ref_min: null, ref_max: 420,  description: null },

  // ── INFLAMMATION ────────────────────────────────────────────────────
  { id: 'crp',               nom: 'CRP ultrasensible',        categorie: 'Inflammation',           unite: 'mg/L',   ref_min: null, ref_max: 3.0,  description: 'Protéine C-réactive' },
  { id: 'ferritine',         nom: 'Ferritine',                categorie: 'Inflammation',           unite: 'µg/L',   ref_min: 30,   ref_max: 400,  description: 'Plage large H+F' },

  // ── HÉMOGRAMME (NFS) ────────────────────────────────────────────────
  { id: 'hemoglobine',       nom: 'Hémoglobine',              categorie: 'Hémogramme (NFS)',       unite: 'g/dL',   ref_min: 12.0, ref_max: 17.5, description: 'Plage large H+F' },
  { id: 'hematocrite',       nom: 'Hématocrite',              categorie: 'Hémogramme (NFS)',       unite: '%',      ref_min: 36,   ref_max: 52,   description: null },
  { id: 'globules_blancs',   nom: 'Globules blancs (GB)',     categorie: 'Hémogramme (NFS)',       unite: 'G/L',    ref_min: 4.0,  ref_max: 10.0, description: null },
  { id: 'plaquettes',        nom: 'Plaquettes',               categorie: 'Hémogramme (NFS)',       unite: 'G/L',    ref_min: 150,  ref_max: 400,  description: null },

  // ── VITAMINES & MINÉRAUX ────────────────────────────────────────────
  { id: 'vitamine_d',        nom: 'Vitamine D (25-OH)',       categorie: 'Vitamines & Minéraux',   unite: 'nmol/L', ref_min: 75,   ref_max: 200,  description: null },
  { id: 'vitamine_b12',      nom: 'Vitamine B12',             categorie: 'Vitamines & Minéraux',   unite: 'pmol/L', ref_min: 148,  ref_max: 738,  description: null },
  { id: 'folates',           nom: 'Folates (B9)',             categorie: 'Vitamines & Minéraux',   unite: 'nmol/L', ref_min: 8.8,  ref_max: null, description: null },
  { id: 'magnesium',         nom: 'Magnésium',                categorie: 'Vitamines & Minéraux',   unite: 'mmol/L', ref_min: 0.75, ref_max: 1.0,  description: null },
  { id: 'zinc',              nom: 'Zinc',                     categorie: 'Vitamines & Minéraux',   unite: 'µmol/L', ref_min: 11,   ref_max: 18,   description: null },

  // ── THYROÏDE ────────────────────────────────────────────────────────
  { id: 'tsh',               nom: 'TSH',                      categorie: 'Thyroïde',               unite: 'mUI/L',  ref_min: 0.27, ref_max: 4.2,  description: 'Thyréostimuline' },
  { id: 't4_libre',          nom: 'T4 libre (FT4)',           categorie: 'Thyroïde',               unite: 'pmol/L', ref_min: 12,   ref_max: 22,   description: null },
  { id: 't3_libre',          nom: 'T3 libre (FT3)',           categorie: 'Thyroïde',               unite: 'pmol/L', ref_min: 3.1,  ref_max: 6.8,  description: null },

  // ── HORMONES ────────────────────────────────────────────────────────
  { id: 'testosterone',      nom: 'Testostérone totale',      categorie: 'Hormones',               unite: 'nmol/L', ref_min: null, ref_max: null, description: 'Normes H/F distinctes — à affiner en phase 2' },
  { id: 'cortisol',          nom: 'Cortisol matin',           categorie: 'Hormones',               unite: 'nmol/L', ref_min: 166,  ref_max: 507,  description: 'Prélèvement le matin' },
  { id: 'dhea_s',            nom: 'DHEA-S',                   categorie: 'Hormones',               unite: 'µmol/L', ref_min: null, ref_max: null, description: 'Varie selon âge et sexe — à affiner en phase 2' },
];

// ── Catégories dans l'ordre d'affichage ─────────────────────────────
const CATEGORIES_ORDRE = [
  'Métabolisme glucidique',
  'Bilan lipidique',
  'Fonction hépatique',
  'Fonction rénale',
  'Inflammation',
  'Hémogramme (NFS)',
  'Vitamines & Minéraux',
  'Thyroïde',
  'Hormones',
];

// ── Utilitaires ──────────────────────────────────────────────────────

function getMarqueurById(id) {
  return MARQUEURS_CATALOGUE.find(m => m.id === id) || null;
}

function getMarqueursByCategorie(categorie) {
  return MARQUEURS_CATALOGUE.filter(m => m.categorie === categorie);
}

function searchMarqueurs(query) {
  const q = query.toLowerCase().trim();
  if (!q) return MARQUEURS_CATALOGUE;
  return MARQUEURS_CATALOGUE.filter(m =>
    m.nom.toLowerCase().includes(q) ||
    m.categorie.toLowerCase().includes(q) ||
    (m.description && m.description.toLowerCase().includes(q))
  );
}

/**
 * Calcule le statut d'une valeur par rapport aux références.
 * @returns {'bas'|'normal'|'eleve'|'inconnu'}
 */
function getStatutMarqueur(marqueurId, valeur) {
  const m = getMarqueurById(marqueurId);
  if (!m || valeur === null || valeur === undefined) return 'inconnu';
  if (m.ref_min !== null && valeur < m.ref_min) return 'bas';
  if (m.ref_max !== null && valeur > m.ref_max) return 'eleve';
  if (m.ref_min !== null || m.ref_max !== null) return 'normal';
  return 'inconnu';
}
