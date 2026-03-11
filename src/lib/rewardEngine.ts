import { CreditCard, Category } from './cards';

export interface RewardCalculation {
  rate: number;
  value: number;
  isBase: boolean;
  appliedCap?: boolean;
}

export function calculateReward(card: CreditCard, category: Category, amount: number): RewardCalculation {
  let rate = card.baseRate;
  let isBase = true;
  let appliedCap = false;

  // 1. Check if the category is a portal-only category
  // For now, we assume we are not booking through the portal, so we ignore portal-only rates
  // unless the app explicitly supports a "booked through portal" toggle.
  // We'll just use the base rate if it's a portal-only category and we don't have a regular category rate.
  
  // 2. Check category rates
  if (card.categoryRates[category] !== undefined) {
    // If the card has a selectedCategory model, only apply the category rate if it matches the selected category
    if (card.selectedCategory && card.selectedCategory !== category) {
      // It's a category the card *could* get a bonus on, but it's not the currently selected one.
      // So it gets the base rate.
    } else if (!card.portalOnly?.includes(category)) {
      rate = card.categoryRates[category]!;
      isBase = false;
    }
  }

  // 3. Check rotating categories
  // If the card has rotating categories, only apply the bonus if the category is currently rotating
  // Note: We assume that if a category is in categoryRates but NOT in rotatingCategory, it might be a permanent category.
  // However, for cards like Discover It, all categoryRates are rotating.
  // We need a way to distinguish. For now, if a card has rotatingCategory defined, we assume ALL 5% categories are rotating.
  if (card.rotatingCategory && card.categoryRates[category] !== undefined) {
    if (card.rotatingCategory.includes(category)) {
      rate = card.categoryRates[category]!;
      isBase = false;
    } else if (card.categoryRates[category] === 0.05) {
      // If it's a 5% category but not currently rotating, it gets base rate
      rate = card.baseRate;
      isBase = true;
    }
  }

  // 5. Check caps
  if (card.caps && !isBase) {
    // We check if the current transaction exceeds the cap.
    for (const cap of card.caps) {
      if (!cap.category || cap.category === category) {
        if (amount > cap.amount) {
          // The amount exceeds the cap.
          // The portion up to the cap gets the category rate, the rest gets the base rate.
          const cappedAmount = cap.amount;
          const uncappedAmount = amount - cap.amount;
          const value = (cappedAmount * rate) + (uncappedAmount * card.baseRate);
          return {
            rate: value / amount, // effective rate
            value,
            isBase: false,
            appliedCap: true
          };
        }
      }
    }
  }

  return {
    rate,
    value: rate * amount,
    isBase
  };
}
