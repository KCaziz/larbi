import { FIN_DEEP_LINK_WHITELIST, FIN_FALLBACK_MAX_CATEGORIES } from '../constants/finAssistant.js';

// FINCLUDIA deterministic assistant (P3-19): keyword resolver and deep-link
// validation. No AI, no generation — matches a free-text query against the
// closed list of intents an administrator has published, using the keywords
// they wrote (client's words: "mots-clés, synonymes... vers une liste fermée").

// Accents and punctuation stripped, lower-cased: "Je n'ai pas compris." and
// "je nai pas compris" must compare equal.
export function normalise(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Highest-scoring published intent (number of its keywords found in the
// query), or null when nothing scores at least 1 — the resolver's own
// confidence threshold, kept here so it is the SAME rule everywhere it matters.
export function resolveIntent(query, intents) {
  const words = new Set(normalise(query).split(' ').filter(Boolean));
  if (words.size === 0) return null;
  let best = null;
  let bestScore = 0;
  for (const intent of intents) {
    const score = (intent.keywords ?? []).filter((kw) => {
      const needle = normalise(kw);
      return needle && (words.has(needle) || needle.split(' ').every((w) => words.has(w)));
    }).length;
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return best;
}

// A link is only ever offered if it points at a page that really exists today.
export const isKnownDeepLink = (path) => Boolean(path) && FIN_DEEP_LINK_WHITELIST.includes(path);

// Client's own words (screen C02/C26) for the fallback categories, when
// confidence is insufficient: "proposer 4 à 6 catégories".
export const fallbackCategories = (intents) => intents.slice(0, FIN_FALLBACK_MAX_CATEGORIES);
