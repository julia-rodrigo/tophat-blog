/**
 * Prices agreed for Log Day5. Purchases are not wired up yet (Google Play Billing comes
 * with sign-in in version 2); the app shows these so people know what's coming.
 */
export interface Plan {
  id: string;
  name: string;
  price: string;
  per: 'month' | 'year' | null;
  ai: boolean;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    per: null,
    ai: false,
    features: [
      'Write or talk: speech turns into text (English, Japanese)',
      'Day pages, calendar, streaks, daily reminder',
      'Voice to-do list and stats',
      'Photos, videos, sounds and songs',
      'Backup on your phone',
      'Download each day (text + photos)',
    ],
  },
  {
    id: 'extras',
    name: 'Extras',
    price: '€4',
    per: 'month',
    ai: false,
    features: ['Everything in Free', 'Custom colour palettes and themes', 'Share card styles', 'Diary book export', 'Cloud backup'],
  },
  {
    id: 'ai',
    name: 'AI',
    price: '€7',
    per: 'month',
    ai: true,
    features: [
      'Everything in Extras',
      'Autocorrect and clean-up',
      'Your personality type each week',
      'Screenshot to diary text or to-do',
      '10 AI picture credits each month',
    ],
  },
  {
    id: 'ai-max',
    name: 'AI Max',
    price: '€10',
    per: 'month',
    ai: true,
    features: [
      'Everything in AI',
      'Week trailer video',
      'Deep monthly report',
      'English ⇄ Japanese translation',
      '30 AI picture credits each month',
    ],
  },
  { id: 'extras-year', name: 'Extras yearly', price: '€27.99', per: 'year', ai: false, features: ['Everything in Extras for a year'] },
  { id: 'ai-year', name: 'AI yearly', price: '€40', per: 'year', ai: true, features: ['Everything in AI for a year', 'Fair-use AI limit'] },
];

/** AI pictures. Your own photos are always free. */
export const CREDIT_PACKS = [
  { credits: 10, price: '€0.99' },
  { credits: 30, price: '€1.99' },
  { credits: 100, price: '€4.99' },
];

/** New accounts get AI free for 14 days, once per account (tied to sign-in so reinstalling doesn't reset it). */
export const AI_TRIAL_DAYS = 14;
