export type Category = 'dining' | 'grocery' | 'gas' | 'travel' | 'drugstore' | 'walmart' | 'amazon' | 'target' | 'online_shopping' | 'rent' | 'general';

export interface CardCap {
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  category?: Category;
}

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  baseRate: number;
  categoryRates: Partial<Record<Category, number>>;
  caps?: CardCap[];
  requiresEnrollment?: boolean;
  selectedCategory?: Category; // If the card has a user-selected category
  portalOnly?: Category[]; // Categories that only apply if booked through portal
  rotatingCategory?: Category[]; // Current rotating categories
  sourceUrl: string;
  lastVerified: string;
  network: string;
  annualFee: number;
  description: string;
  keywords?: string[];
  supportsRent?: boolean;
  redemptionValue?: number; // Value per point (e.g. 1.0, 1.25, 1.5)
  notes?: string;
}

export interface WalletItem {
  instanceId: string;
  cardId: string;
  nickname?: string;
}

export const CATEGORIES: Category[] = [
  'dining', 'grocery', 'gas', 'travel', 'drugstore', 'walmart', 'amazon', 'target', 'online_shopping', 'rent', 'general'
];

export const CATEGORY_DISPLAY_NAMES: Record<Category, string> = {
  'dining': 'Dining',
  'grocery': 'Grocery',
  'gas': 'Gas',
  'travel': 'Travel',
  'drugstore': 'Drugstore',
  'walmart': 'Walmart',
  'amazon': 'Amazon',
  'target': 'Target',
  'online_shopping': 'Online Shopping',
  'rent': 'Rent',
  'general': 'Other'
};

export const CARD_CATALOG: CreditCard[] = [
  {
    id: 'chase-sapphire-reserve',
    name: 'Sapphire Reserve',
    issuer: 'Chase',
    annualFee: 550,
    baseRate: 0.01,
    categoryRates: { 'travel': 0.03, 'dining': 0.03 },
    network: 'Visa',
    description: '3x points on travel and dining',
    sourceUrl: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve',
    lastVerified: '2026-03-09',
    redemptionValue: 1.5,
    notes: 'Points worth 50% more when redeemed for travel through Chase.'
  },
  {
    id: 'chase-sapphire-preferred',
    name: 'Sapphire Preferred',
    issuer: 'Chase',
    annualFee: 95,
    baseRate: 0.01,
    categoryRates: { 'travel': 0.02, 'dining': 0.03, 'online_shopping': 0.03 },
    network: 'Visa',
    description: '3x points on dining, 2x on travel',
    sourceUrl: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred',
    lastVerified: '2026-03-09',
    redemptionValue: 1.25,
    notes: 'Points worth 25% more when redeemed for travel through Chase.'
  },
  {
    id: 'chase-freedom-unlimited',
    name: 'Freedom Unlimited',
    issuer: 'Chase',
    annualFee: 0,
    baseRate: 0.015,
    categoryRates: { 'dining': 0.03, 'drugstore': 0.03, 'travel': 0.05 },
    portalOnly: ['travel'],
    network: 'Visa',
    description: '1.5% cash back on all purchases',
    sourceUrl: 'https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0,
    notes: 'Great catch-all card for non-category spend.'
  },
  {
    id: 'amex-gold',
    name: 'Gold Card',
    issuer: 'American Express',
    annualFee: 250,
    baseRate: 0.01,
    categoryRates: { 'dining': 0.04, 'grocery': 0.04, 'travel': 0.03 },
    caps: [{ amount: 25000, period: 'yearly', category: 'grocery' }],
    network: 'Amex',
    description: '4x points on dining and groceries',
    sourceUrl: 'https://www.americanexpress.com/us/credit-cards/card/gold-card/',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0,
    notes: 'Excellent for foodies and home cooks.'
  },
  {
    id: 'amex-platinum',
    name: 'Platinum Card',
    issuer: 'American Express',
    annualFee: 695,
    baseRate: 0.01,
    categoryRates: { 'travel': 0.05 },
    caps: [{ amount: 500000, period: 'yearly', category: 'travel' }],
    network: 'Amex',
    description: '5x points on flights and hotels',
    sourceUrl: 'https://www.americanexpress.com/us/credit-cards/card/platinum/',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0,
    notes: 'The ultimate travel luxury card.'
  },
  {
    id: 'citi-double-cash',
    name: 'Double Cash',
    issuer: 'Citi',
    annualFee: 0,
    baseRate: 0.02,
    categoryRates: {},
    network: 'Mastercard',
    description: '2% cash back on all purchases',
    sourceUrl: 'https://www.citi.com/credit-cards/citi-double-cash-credit-card',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0,
    notes: 'Simple 2% back on everything.'
  },
  {
    id: 'citi-custom-cash',
    name: 'Custom Cash',
    issuer: 'Citi',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { 'gas': 0.05, 'grocery': 0.05, 'dining': 0.05, 'travel': 0.05, 'drugstore': 0.05 },
    caps: [{ amount: 500, period: 'monthly' }],
    selectedCategory: 'dining', // This would dynamically change based on user spend, but we set a default or allow user to set
    network: 'Mastercard',
    description: '5% cash back in your top eligible spend category',
    sourceUrl: 'https://www.citi.com/credit-cards/citi-custom-cash-credit-card',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0,
    notes: '5% back on your highest spend category each month.'
  },
  {
    id: 'discover-it',
    name: 'Discover it Cash Back',
    issuer: 'Discover',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { 'amazon': 0.05, 'target': 0.05, 'walmart': 0.05, 'grocery': 0.05, 'gas': 0.05, 'dining': 0.05 },
    rotatingCategory: ['grocery'], // Example rotating category
    caps: [{ amount: 1500, period: 'quarterly' }],
    requiresEnrollment: true,
    network: 'Discover',
    description: '5% cash back on everyday purchases at different places each quarter',
    sourceUrl: 'https://www.discover.com/credit-cards/cash-back/it-card.html',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0
  },
  {
    id: 'capital-one-savor-one',
    name: 'SavorOne',
    issuer: 'Capital One',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { 'dining': 0.03, 'grocery': 0.03 },
    network: 'Mastercard',
    description: '3% cash back on dining, entertainment, and grocery stores',
    sourceUrl: 'https://www.capitalone.com/credit-cards/savorone-dining-rewards/',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0
  },
  {
    id: 'capital-one-venture-x',
    name: 'Venture X',
    issuer: 'Capital One',
    annualFee: 395,
    baseRate: 0.02,
    categoryRates: { 'travel': 0.10 },
    portalOnly: ['travel'],
    network: 'Visa',
    description: '2x miles on all purchases',
    sourceUrl: 'https://www.capitalone.com/credit-cards/venture-x/',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0
  },
  {
    id: 'capital-one-venture',
    name: 'Venture Rewards',
    issuer: 'Capital One',
    annualFee: 95,
    baseRate: 0.02,
    categoryRates: { 'travel': 0.05 },
    portalOnly: ['travel'],
    network: 'Visa',
    description: '2x miles on all purchases',
    sourceUrl: 'https://www.capitalone.com/credit-cards/venture/',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0
  },
  {
    id: 'capital-one-quicksilver',
    name: 'Quicksilver',
    issuer: 'Capital One',
    annualFee: 0,
    baseRate: 0.015,
    categoryRates: {},
    network: 'Visa',
    description: '1.5% cash back on all purchases',
    sourceUrl: 'https://www.capitalone.com/credit-cards/quicksilver/',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0
  },
  {
    id: 'bilt-blue',
    name: 'Bilt Blue',
    issuer: 'Wells Fargo',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { 'dining': 0.03, 'travel': 0.02, 'rent': 0.01 },
    network: 'Mastercard',
    description: '1x points on rent, 3x on dining, 2x on travel',
    keywords: ['bilt', 'blue', 'rent', 'wells fargo'],
    sourceUrl: 'https://www.biltrewards.com/card',
    lastVerified: '2026-03-09',
    supportsRent: true,
    redemptionValue: 1.25,
    notes: 'The only card that earns points on rent without fees.'
  },
  {
    id: 'bilt-obsidian',
    name: 'Bilt Obsidian',
    issuer: 'Wells Fargo',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { 'dining': 0.03, 'travel': 0.02, 'rent': 0.01 },
    network: 'Mastercard',
    description: '1x points on rent, 3x on dining, 2x on travel (Obsidian Status)',
    keywords: ['bilt', 'obsidian', 'rent', 'wells fargo'],
    sourceUrl: 'https://www.biltrewards.com/card',
    lastVerified: '2026-03-09',
    supportsRent: true,
    redemptionValue: 1.25,
    notes: 'The only card that earns points on rent without fees.'
  },
  {
    id: 'bilt-palladium',
    name: 'Bilt Palladium',
    issuer: 'Wells Fargo',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { 'dining': 0.03, 'travel': 0.02, 'rent': 0.01 },
    network: 'Mastercard',
    description: '1x points on rent, 3x on dining, 2x on travel (Palladium Status)',
    keywords: ['bilt', 'palladium', 'rent', 'wells fargo'],
    sourceUrl: 'https://www.biltrewards.com/card',
    lastVerified: '2026-03-09',
    supportsRent: true,
    redemptionValue: 1.25,
    notes: 'The only card that earns points on rent without fees.'
  },
  {
    id: 'amazon-prime-rewards',
    name: 'Prime Visa',
    issuer: 'Chase',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { 'amazon': 0.05, 'dining': 0.02, 'gas': 0.02 },
    network: 'Visa',
    description: '5% cash back at Amazon and Whole Foods',
    sourceUrl: 'https://creditcards.chase.com/cash-back-credit-cards/amazon/prime-visa',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0
  },
  {
    id: 'target-redcard',
    name: 'RedCard',
    issuer: 'Target',
    annualFee: 0,
    baseRate: 0.01,
    categoryRates: { 'target': 0.05 },
    network: 'Mastercard',
    description: '5% discount at Target',
    sourceUrl: 'https://www.target.com/redcard/about',
    lastVerified: '2026-03-09',
    redemptionValue: 1.0
  }
];
