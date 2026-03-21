import { CreditCard, Category, WalletItem, CARD_CATALOG } from './cards';

export interface Transaction {
  amount: number;
  category: Category;
  merchant?: string;
  recurring?: boolean;
}

export interface RewardResult {
  cardId: string;
  cardName: string;
  score: number;
  estimatedRate: number;
  estimatedReward: number;
  reasons: string[];
  isBase: boolean;
  appliedCap?: boolean;
}

export interface Recommendation {
  winner: RewardResult;
  runnerUp: RewardResult | null;
  confidence: 'Very High' | 'High' | 'Medium' | 'Low';
  smartTag?: string;
  explanation: string;
  allResults: RewardResult[];
}

export interface CategoryRule {
  priorityCardIds?: string[];
  scoreBoost?: number;
  confidenceBoost?: number;
  reason?: string;
  smartTag?: string;
}

export const CATEGORY_RULES: Record<Category, CategoryRule> = {
  'rent': {
    priorityCardIds: ['bilt-blue', 'bilt-obsidian', 'bilt-palladium'],
    scoreBoost: 100,
    confidenceBoost: 2,
    reason: "Bilt is optimized for rent payments and allows earning points on rent without transaction fees.",
    smartTag: "Rent Specialist"
  },
  'dining': {
    priorityCardIds: ['bilt-blue', 'bilt-obsidian', 'bilt-palladium', 'chase-sapphire-reserve', 'chase-sapphire-preferred', 'amex-gold'],
    scoreBoost: 40,
    reason: "High-value dining multiplier detected.",
    smartTag: "Dining Optimized"
  },
  'grocery': {
    priorityCardIds: ['amex-gold', 'chase-freedom-unlimited'],
    scoreBoost: 30,
    reason: "Strong grocery rewards applied.",
    smartTag: "Grocery Specialist"
  },
  'gas': {
    priorityCardIds: ['chase-freedom-unlimited', 'citi-custom-cash'],
    scoreBoost: 30,
    reason: "Gas category bonus optimization.",
    smartTag: "Fuel Favorite"
  },
  'travel': {
    priorityCardIds: ['chase-sapphire-reserve', 'amex-platinum', 'capital-one-venture-x'],
    scoreBoost: 40,
    reason: "Premium travel rewards prioritized.",
    smartTag: "Travel Elite"
  },
  'general': {
    priorityCardIds: ['chase-freedom-unlimited', 'citi-double-cash', 'capital-one-venture-x'],
    scoreBoost: 10,
    reason: "Best-in-class catch-all rate.",
    smartTag: "Everyday Hero"
  },
  'drugstore': {
    priorityCardIds: ['chase-freedom-unlimited'],
    scoreBoost: 20
  },
  'walmart': {},
  'amazon': {
    priorityCardIds: ['amazon-prime-rewards'],
    scoreBoost: 50
  },
  'target': {
    priorityCardIds: ['target-redcard'],
    scoreBoost: 50
  },
  'online_shopping': {
    priorityCardIds: ['chase-sapphire-preferred'],
    scoreBoost: 20
  }
};

export function calculateReward(card: CreditCard, category: Category, amount: number): { rate: number; value: number; isBase: boolean; appliedCap?: boolean } {
  let rate = card.baseRate;
  let isBase = true;
  let appliedCap = false;

  // 1. Check category rates
  if (card.categoryRates[category] !== undefined) {
    if (card.selectedCategory && card.selectedCategory !== category) {
      // Not the selected category
    } else if (!card.portalOnly?.includes(category)) {
      rate = card.categoryRates[category]!;
      isBase = false;
    }
  }

  // 2. Check rotating categories
  if (card.rotatingCategory && card.categoryRates[category] !== undefined) {
    if (card.rotatingCategory.includes(category)) {
      rate = card.categoryRates[category]!;
      isBase = false;
    } else if (card.categoryRates[category] === 0.05) {
      rate = card.baseRate;
      isBase = true;
    }
  }

  // 3. Check caps
  let finalValue = rate * amount;
  if (card.caps && !isBase) {
    for (const cap of card.caps) {
      if (!cap.category || cap.category === category) {
        if (amount > cap.amount) {
          const cappedAmount = cap.amount;
          const uncappedAmount = amount - cap.amount;
          finalValue = (cappedAmount * rate) + (uncappedAmount * card.baseRate);
          rate = finalValue / amount;
          appliedCap = true;
        }
      }
    }
  }

  return {
    rate,
    value: finalValue,
    isBase,
    appliedCap
  };
}

export function getRecommendation(wallet: WalletItem[], transaction: Transaction): Recommendation | null {
  if (wallet.length === 0) return null;

  const results = wallet.map(item => {
    const card = CARD_CATALOG.find(c => c.id === item.cardId);
    if (!card) return null;

    const { rate, value, isBase, appliedCap } = calculateReward(card, transaction.category, transaction.amount);
    
    let score = rate * 100; // Base score from rate
    const reasons: string[] = [];

    // 1. Category Rule Bonus
    const rule = CATEGORY_RULES[transaction.category];
    if (rule) {
      if (rule.priorityCardIds?.includes(card.id)) {
        score += rule.scoreBoost || 0;
        if (rule.reason) reasons.push(rule.reason);
      } else if (!isBase) {
        // If it's a category match but not a priority card, still give a small boost
        score += 5;
        reasons.push(`Earns bonus rewards on ${transaction.category}.`);
      }
    }

    // 2. Redemption Value Bonus
    if (card.redemptionValue && card.redemptionValue > 1) {
      const bonus = (card.redemptionValue - 1) * 10;
      score += bonus;
      reasons.push(`Points are worth ${((card.redemptionValue - 1) * 100).toFixed(0)}% more when redeemed.`);
    }

    // 3. Recurring Purchase Bonus
    if (transaction.recurring && card.baseRate > 0.01) {
      score += 5;
      reasons.push("Strong base rate for recurring expenses.");
    }

    // 4. Restriction Penalty
    if (transaction.category === 'rent' && !card.supportsRent) {
      score -= 50;
      reasons.push("This card is not optimized for rent payments and may incur fees.");
    }

    const result: RewardResult = {
      cardId: card.id,
      cardName: item.nickname || card.name,
      score,
      estimatedRate: rate,
      estimatedReward: value,
      reasons,
      isBase,
      appliedCap
    };
    return result;
  }).filter((r): r is RewardResult => r !== null);

  if (results.length === 0) return null;

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  const winner = results[0];
  const runnerUp = results.length > 1 ? results[1] : null;

  // Confidence Engine
  let confidence: 'Very High' | 'High' | 'Medium' | 'Low' = 'Medium';
  const scoreGap = runnerUp ? winner.score - runnerUp.score : winner.score;
  
  if (scoreGap > 40) confidence = 'Very High';
  else if (scoreGap > 20) confidence = 'High';
  else if (scoreGap > 5) confidence = 'Medium';
  else confidence = 'Low';

  // Smart Tag & Explanation
  const rule = CATEGORY_RULES[transaction.category];
  const smartTag = rule?.smartTag;
  
  let explanation = "";
  if (winner.reasons.length > 0) {
    explanation = winner.reasons.join(" ");
  } else {
    explanation = `The ${winner.cardName} offers the best reward rate for this purchase.`;
  }

  // Override for specific high-value cases if needed
  if (transaction.category === 'rent' && winner.cardId.includes('bilt')) {
    explanation = "Bilt is specifically designed for rent payments, allowing you to earn rewards without the typical transaction fees associated with other cards.";
  }

  return {
    winner,
    runnerUp,
    confidence,
    smartTag,
    explanation,
    allResults: results
  };
}
