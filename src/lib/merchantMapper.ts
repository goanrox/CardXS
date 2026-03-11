import { Category } from './cards';

const exactMatches: Record<string, Category> = {
  'amazon': 'amazon',
  'aws': 'amazon',
  'walmart': 'walmart',
  'target': 'target',
  'costco': 'grocery',
  'sams club': 'grocery',
  'bjs': 'grocery',
  'shell': 'gas',
  'chevron': 'gas',
  'exxon': 'gas',
  'mobil': 'gas',
  'bp': 'gas',
  'speedway': 'gas',
  'arco': 'gas',
  'sunoco': 'gas',
  'starbucks': 'dining',
  'dunkin': 'dining',
  'peets': 'dining',
  'mcdonalds': 'dining',
  'wendys': 'dining',
  'burger king': 'dining',
  'taco bell': 'dining',
  'chickfila': 'dining',
  'subway': 'dining',
  'chipotle': 'dining',
  'panera': 'dining',
  'best buy': 'online_shopping',
  'apple': 'online_shopping',
  'cvs': 'drugstore',
  'walgreens': 'drugstore',
  'rite aid': 'drugstore',
  'kroger': 'grocery',
  'safeway': 'grocery',
  'whole foods': 'grocery',
  'publix': 'grocery',
  'aldi': 'grocery',
  'trader joes': 'grocery',
  'wegmans': 'grocery',
  'heb': 'grocery',
  'uber': 'travel',
  'lyft': 'travel',
  'delta': 'travel',
  'united': 'travel',
  'american airlines': 'travel',
  'southwest': 'travel',
  'marriott': 'travel',
  'hilton': 'travel',
  'airbnb': 'travel',
  'expedia': 'travel',
  'bookingcom': 'travel',
  'hertz': 'travel',
  'enterprise': 'travel',
  'doordash': 'dining',
  'ubereats': 'dining',
  'grubhub': 'dining',
};

const keywordMatches: { keyword: string; category: Category }[] = [
  { keyword: 'gas', category: 'gas' },
  { keyword: 'grocery', category: 'grocery' },
  { keyword: 'market', category: 'grocery' },
  { keyword: 'restaurant', category: 'dining' },
  { keyword: 'cafe', category: 'dining' },
  { keyword: 'steakhouse', category: 'dining' },
  { keyword: 'diner', category: 'dining' },
  { keyword: 'fast food', category: 'dining' },
  { keyword: 'pizza', category: 'dining' },
  { keyword: 'pharmacy', category: 'drugstore' },
  { keyword: 'drugstore', category: 'drugstore' },
  { keyword: 'hotel', category: 'travel' },
  { keyword: 'motel', category: 'travel' },
  { keyword: 'resort', category: 'travel' },
  { keyword: 'airlines', category: 'travel' },
  { keyword: 'flight', category: 'travel' },
  { keyword: 'taxi', category: 'travel' },
  { keyword: 'transit', category: 'travel' },
];

export function detectMerchantCategory(merchantName: string): Category {
  if (!merchantName) return 'general';

  // Normalize input: lower case, trim whitespace, remove punctuation
  const normalized = merchantName
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();

  if (!normalized) return 'general';

  // 1. Check for exact matches
  if (exactMatches[normalized]) {
    return exactMatches[normalized];
  }

  // 2. Check for partial matches in exactMatches keys (e.g., "amazon marketplace" -> "amazon")
  for (const [key, category] of Object.entries(exactMatches)) {
    if (normalized.includes(key)) {
      return category;
    }
  }

  // 3. Check for keyword matches
  for (const { keyword, category } of keywordMatches) {
    if (normalized.includes(keyword)) {
      return category;
    }
  }

  return 'general';
}
