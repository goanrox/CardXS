import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Label } from './ui';
import { CreditCard, Sparkles, Store, ShoppingCart, Fuel, Utensils, ShoppingBag, Target as TargetIcon, Plus, Loader2, Wallet, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CARD_CATALOG, CATEGORIES, CATEGORY_DISPLAY_NAMES, Category, WalletItem, CreditCard as CreditCardType } from '../lib/cards';
import { calculateReward, getRecommendation, Transaction, Recommendation } from '../lib/rewardEngine';
import { detectMerchantCategory } from '../lib/merchantMapper';
import { CardSearchModal } from './CardSearchModal';
import { InsightCard } from './InsightCard';
import { AnimatedCart, AnimatedStore, AnimatedFuel, AnimatedUtensils, AnimatedShoppingBag, AnimatedTarget } from './AnimatedQuickSpendIcons';
import { toast } from 'sonner';
import { useWallet } from '../hooks/useWallet';

import { SmartInsightStrip } from './SmartInsightStrip';
import { WalletEfficiencyScore } from './WalletEfficiencyScore';
import { SavingsPrediction } from './SavingsPrediction';
import { AdaptiveCoachPrompt } from './AdaptiveCoachPrompt';

function getCardColor(issuer: string, name: string) {
  const i = issuer.toLowerCase();
  const n = name.toLowerCase();
  
  if (i.includes('chase')) {
    if (n.includes('sapphire')) return '#0A3B7C';
    if (n.includes('freedom')) return '#117ACA';
    return '#005EB8';
  }
  if (i.includes('american express') || i.includes('amex')) {
    if (n.includes('gold')) return '#E5B758';
    if (n.includes('platinum')) return '#A3A8A8';
    if (n.includes('blue')) return '#006FCF';
    return '#006FCF';
  }
  if (i.includes('capital one')) {
    if (n.includes('venture')) return '#002B49';
    if (n.includes('savor')) return '#E35925';
    if (n.includes('quicksilver')) return '#8C8C8C';
    return '#004879';
  }
  if (i.includes('citi')) {
    if (n.includes('custom cash')) return '#00B4C5';
    if (n.includes('double cash')) return '#00A1E0';
    return '#002D72';
  }
  if (i.includes('discover')) {
    return '#FF6000';
  }
  if (i.includes('apple')) {
    return '#E5E5EA';
  }
  if (i.includes('bilt')) {
    return '#000000';
  }
  if (i.includes('wells fargo')) {
    return '#D71E28';
  }
  if (i.includes('bank of america')) {
    return '#012169';
  }
  if (i.includes('u.s. bank')) {
    return '#002B54';
  }
  
  const colors = ['#0062C3', '#E5B758', '#E35925', '#00B4C5', '#FF6000', '#8C8C8C', '#000000', '#D71E28', '#012169', '#002B54'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const WalletChip: React.FC<{ 
  item: WalletItem;
  card: CreditCardType;
  isWinner: boolean;
  isRevealing: boolean;
  isEditing: boolean;
  onClick: () => void;
}> = ({ 
  item, 
  card, 
  isWinner, 
  isRevealing,
  isEditing, 
  isOptimizing,
  onClick 
}) => {
  const cardColor = getCardColor(card.issuer, card.name);
  
  return (
    <motion.button
      whileTap="tap"
      initial="initial"
      animate={isOptimizing && isWinner ? "optimizing" : "animate"}
      exit="exit"
      variants={{
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        optimizing: { 
          y: [0, -4, 0],
          transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] }
        },
        tap: { scale: 0.96 },
        exit: { opacity: 0, scale: 0.8, width: 0, padding: 0, margin: 0 }
      }}
      transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
      onClick={onClick}
      className={`relative shrink-0 snap-start h-[34px] pl-1 pr-3 rounded-full text-[13px] font-medium transition-colors flex items-center gap-1.5
        ${(isWinner || isRevealing) && !isEditing
          ? `text-white shadow-[0_3px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-black/50 ${isRevealing ? 'animate-chip-darken' : 'bg-gradient-to-b from-[#2C2C2E] to-[#000000]'}` 
          : isEditing 
            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
            : 'bg-white border border-app-border/60 text-app-text hover:bg-[#F5F5F7] shadow-sm'
        }`}
    >
      {/* Mini Wallet Icon */}
      <div className="relative w-7 h-7 shrink-0 flex items-center justify-center [perspective:500px]">
        {/* Wallet Back Flap */}
        <div 
          className="absolute bottom-1 w-6 h-4 rounded-[4px]" 
          style={{ 
            background: 'linear-gradient(180deg, #7A4B29 0%, #4A2B15 100%)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)'
          }}
        />
        
        {/* Card Peeking Out */}
        <motion.div 
          layoutId={`card-visual-${item.instanceId}`}
          className={`absolute bottom-1.5 w-5 h-3.5 rounded-[3px] overflow-hidden ${isRevealing ? 'animate-card-hero animate-card-shadow' : ''}`}
          style={{ 
            background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
            border: `1px solid ${cardColor}40`,
            y: isWinner && !isEditing && !isRevealing ? -4 : -1,
            rotateZ: isWinner && !isEditing && !isRevealing ? -4 : -4,
            boxShadow: isWinner && !isEditing && !isRevealing ? '0 2px 4px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.2)'
          }}
        >
          {/* Premium light sweep effect */}
          {isRevealing && (
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-light-sweep" />
            </div>
          )}
        </motion.div>
        
        {/* Wallet Front Flap */}
        <div 
          className="absolute bottom-1 w-6 h-2.5 rounded-[3px] overflow-hidden"
          style={{ 
            background: 'linear-gradient(180deg, #A66D46 0%, #7A4B29 100%)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.25)'
          }}
        />
        
        {/* Badges */}
        {isEditing ? (
          <div className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full p-0.5 shadow-sm">
            <X size={10} className="text-white" strokeWidth={3} />
          </div>
        ) : isWinner ? (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles size={12} className="text-[#00C805]" fill="#00C805" />
          </motion.div>
        ) : null}
      </div>

      <span className="truncate max-w-[120px]">
        {item.nickname || card.name}
      </span>
    </motion.button>
  );
}

function AnimatedCounter({ value, duration = 400 }: { value: number, duration?: number }) {
  const [displayValue, setDisplayValue] = useState("0.00");

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentValue = value * easeProgress;
      setDisplayValue(currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setDisplayValue(value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      }
    };
    
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return <span>${displayValue}</span>;
}

const QUICK_SPEND_OPTIONS = [
  { name: 'Amazon', category: 'general', merchant: 'Amazon', icon: AnimatedCart },
  { name: 'Walmart', category: 'general', merchant: 'Walmart', icon: AnimatedStore },
  { name: 'Gas', category: 'gas', merchant: '', icon: AnimatedFuel },
  { name: 'Restaurants', category: 'dining', merchant: '', icon: AnimatedUtensils },
  { name: 'Grocery', category: 'grocery', merchant: '', icon: AnimatedShoppingBag },
  { name: 'Rent', category: 'rent', merchant: '', icon: AnimatedTarget },
];

const ANIMATION_STEPS = [
  "Analyzing wallet...",
  "Checking merchant category...",
  "Calculating rewards..."
];

export function BestCardTool({ onResult }: { onResult?: (isBest: boolean) => void }) {
  const { walletItems, addCard, removeCard } = useWallet();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  
  const [category, setCategory] = useState<Category | ''>('');
  const [customMerchant, setCustomMerchant] = useState('');
  const [amount, setAmount] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [revealingCardId, setRevealingCardId] = useState<string | null>(null);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [displayResult, setDisplayResult] = useState<Recommendation | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);

  const handleAddCard = (cardId: string) => {
    addCard(cardId);
    setResult(null);
  };

  const handleRemoveCard = (instanceId: string, cardName: string) => {
    removeCard(instanceId);
    setResult(null);
    toast.success(`${cardName} removed`);
    if (walletItems.length <= 1) {
      setIsEditingWallet(false);
    }
  };

  const detectedCategory = category === 'general' && customMerchant.trim() 
    ? detectMerchantCategory(customMerchant) 
    : null;

  const analyze = async (cat: Category | '', merch: string, amtStr: string, skipAnimation = false) => {
    if (!cat || !amtStr || walletItems.length === 0) return;
    if (cat === 'general' && !merch.trim()) return;
    
    const amt = parseFloat(amtStr);
    if (isNaN(amt) || amt <= 0) return;

    let effectiveCategory = cat;
    if (cat === 'general') {
      effectiveCategory = detectMerchantCategory(merch);
    }

    const transaction: Transaction = {
      amount: amt,
      category: effectiveCategory as Category,
      merchant: merch,
      recurring: isRecurring
    };

    const recommendation = getRecommendation(walletItems, transaction);

    if (!skipAnimation) {
      setIsAnalyzing(true);
      setResult(null);

      // Run analysis steps
      for (let i = 0; i < ANIMATION_STEPS.length; i++) {
        setAnimationStep(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (recommendation) {
        const winnerId = recommendation.winner.cardId;
        // We need to find the instanceId in walletItems that matches cardId
        // This is a bit tricky since multiple instances of same card could exist
        // For now, let's just use the first one found
        const walletItem = walletItems.find(item => item.cardId === winnerId);
        if (walletItem) {
          setRevealingCardId(walletItem.instanceId);
        }
        
        setResult(recommendation);
        setDisplayResult(recommendation);
        if (onResult) onResult(true);

        // Wait for the hero reveal animation duration (900ms)
        await new Promise(resolve => setTimeout(resolve, 900));
        
        setIsAnalyzing(false);
        setRevealingCardId(null);
      }
    } else if (recommendation) {
      setResult(recommendation);
      setDisplayResult(recommendation);
      if (onResult) onResult(true);
    }
  };

  const handleFindBestCard = () => {
    analyze(category, customMerchant, amount, false);
  };

  const [activeTab, setActiveTab] = useState<'result' | 'compare' | 'details'>('result');
  const [selectedCardDetails, setSelectedCardDetails] = useState<any>(null);

  // Clear result if wallet changes
  useEffect(() => {
    setResult(null);
    setActiveTab('result');
  }, [walletItems]);

  const getBestCardForOption = (optCategory: Category, optMerchant: string, amtVal: number) => {
    if (walletItems.length === 0) return null;
    
    const transaction: Transaction = {
      amount: amtVal,
      category: optCategory,
      merchant: optMerchant
    };
    
    const recommendation = getRecommendation(walletItems, transaction);
    return recommendation?.winner || null;
  };

  // Trigger Wallet Intelligence Float animation
  useEffect(() => {
    if (walletItems.length > 0) {
      setIsOptimizing(true);
      const timer = setTimeout(() => setIsOptimizing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [walletItems.length, result]);

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatRate = (rate: number) => `${(rate * 100).toFixed(1)}%`;

  return (
    <div className="w-full">
      <SmartInsightStrip onScrollToResult={() => {
        const resultSection = document.getElementById('best-card-result');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6 px-4 sm:px-0">
        <div className="mb-0 px-0 sm:mb-0">
          <WalletEfficiencyScore score={72} subtext="2 cards under-utilized" />
        </div>
        <div className="mb-0 px-0 sm:mb-0">
          <SavingsPrediction value={3.40} subtext="Dining category optimization" />
        </div>
      </div>
      <AdaptiveCoachPrompt />
      <Card className="max-w-2xl mx-auto w-full p-5 md:p-8">
        {/* Wallet Chip Bar */}
      <motion.div 
        animate={isOptimizing ? {
          y: [0, -6, 0],
          boxShadow: [
            '0 0 0 rgba(0,0,0,0)',
            '0 10px 25px rgba(0,0,0,0.08)',
            '0 0 0 rgba(0,0,0,0)'
          ]
        } : {}}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 relative"
      >
        <div className="flex items-center justify-between mb-3">
          <Label className="mb-0">Your Wallet</Label>
          <div className="flex items-center gap-3">
            {walletItems.length > 0 && (
              <button 
                onClick={() => setIsEditingWallet(!isEditingWallet)}
                className="text-[13px] font-medium text-app-text-secondary hover:text-app-text transition-colors"
              >
                {isEditingWallet ? 'Done' : 'Edit'}
              </button>
            )}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-[13px] font-semibold text-app-primary hover:text-app-primary/80 transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Card
            </button>
          </div>
        </div>
        <div className="relative flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 snap-x hide-scrollbar">
          {/* Shimmer Sweep Effect */}
          <AnimatePresence>
            {isOptimizing && (
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {walletItems.map(item => {
              const card = CARD_CATALOG.find(c => c.id === item.cardId);
              if (!card) return null;
              const isWinner = result?.winner?.cardId === item.cardId;
              
              return (
                <WalletChip 
                  key={item.instanceId}
                  item={item}
                  card={card}
                  isWinner={isWinner}
                  isRevealing={revealingCardId === item.instanceId}
                  isEditing={isEditingWallet}
                  isOptimizing={isOptimizing}
                  onClick={() => {
                    if (isEditingWallet) {
                      handleRemoveCard(item.instanceId, card.name);
                    } else {
                      setSelectedCardDetails(card);
                    }
                  }}
                />
              );
            })}
          </AnimatePresence>
        </div>
        {walletItems.length === 0 && (
          <div className="mt-2 p-4 bg-[#F5F5F7] rounded-xl border border-app-border/60 text-center">
            <p className="text-[14px] font-medium text-app-text mb-1">Your wallet is empty</p>
            <p className="text-[13px] text-app-text-secondary mb-3">
              Add your first card to get personalized recommendations.
            </p>
            <Button 
              variant="outline" 
              className="!py-2 !px-4 !h-auto !text-[13px] bg-white"
              onClick={() => setIsSearchOpen(true)}
            >
              <Plus size={14} className="mr-1.5" /> Add Card
            </Button>
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            key="inputs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            className="space-y-6"
          >
            <div className="relative">
              <Label>Quick Spend</Label>
              <div className="flex overflow-x-auto pb-5 -mx-5 px-5 md:-mx-8 md:px-8 gap-3 snap-x snap-mandatory hide-scrollbar mt-2">
                {QUICK_SPEND_OPTIONS.map(option => {
                  const isSelected = category === option.category && (option.category !== 'general' || customMerchant === option.merchant);
                  const amtVal = parseFloat(amount) || 100;
                  const bestCardInfo = getBestCardForOption(option.category as Category, option.merchant, amtVal);
                  
                  return (
                    <motion.button
                      key={option.name}
                      whileTap={{ scale: 0.94, y: 2 }}
                      onClick={() => {
                        const newCat = option.category as Category;
                        const newMerch = option.category === 'general' ? option.merchant : '';
                        setCategory(newCat);
                        setCustomMerchant(newMerch);
                        
                        if (amount && parseFloat(amount) > 0 && walletItems.length > 0) {
                          analyze(newCat, newMerch, amount, true);
                        } else {
                          setResult(null);
                        }
                      }}
                      className={`relative shrink-0 snap-start w-[116px] h-[132px] p-3.5 rounded-[22px] flex flex-col items-start justify-between text-left transition-all duration-300 ease-out ${
                        isSelected 
                          ? 'bg-[#141414] text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] border border-[#2A2A2A]' 
                          : 'bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-app-text'
                      }`}
                    >
                      <div className={`absolute inset-0 rounded-[22px] pointer-events-none ${isSelected ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]' : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'}`} />
                      
                      <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 ${isSelected ? 'bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'bg-[#F5F5F7] shadow-[inset_0_1px_0_rgba(255,255,255,1)]'}`}>
                        <option.icon isActive={isSelected} size={18} className={isSelected ? 'text-white' : 'text-app-text-secondary'} />
                      </div>
                      
                      <div className="w-full mt-auto relative z-10">
                        <p className={`text-[13px] font-semibold mb-1.5 tracking-tight leading-none ${isSelected ? 'text-white' : 'text-app-text'}`}>{option.name}</p>
                        
                        {bestCardInfo ? (
                          <div className="space-y-0.5">
                            <p className={`text-[10px] font-medium truncate ${isSelected ? 'text-white/60' : 'text-app-text-secondary/70'}`}>
                              Use {bestCardInfo.cardName.split(' ')[0]}
                            </p>
                            <motion.p 
                              key={`${amtVal}-${isSelected}`}
                              initial={{ opacity: 0.5, filter: 'brightness(1)' }}
                              animate={{ opacity: 1, filter: 'brightness(1.2)' }}
                              transition={{ duration: 0.3 }}
                              className={`text-[12px] font-bold tracking-tight ${isSelected ? 'text-[#00C805]' : 'text-app-primary'}`}
                            >
                              {parseFloat(amount) > 0 ? `+$${(bestCardInfo.estimatedRate * parseFloat(amount)).toFixed(2)}` : `${(bestCardInfo.estimatedRate * 100).toFixed(1)}% back`}
                            </motion.p>
                          </div>
                        ) : (
                          <p className={`text-[10px] font-medium ${isSelected ? 'text-white/40' : 'text-app-text-secondary/50'}`}>
                            Add cards to see
                          </p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Category</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      if (cat !== 'general') setCustomMerchant('');
                      setResult(null);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${category === cat ? 'bg-app-text text-white shadow-sm' : 'bg-[#F5F5F7] text-app-text-secondary hover:bg-[#E8E8ED] hover:text-app-text'}`}
                  >
                    {CATEGORY_DISPLAY_NAMES[cat]}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {category === 'general' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <Label>Merchant Name</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary">
                      <Store size={16} />
                    </span>
                    <Input 
                      type="text" 
                      placeholder="Type the merchant name" 
                      className="pl-10 h-11 text-[15px]"
                      value={customMerchant}
                      onChange={(e: any) => {
                        setCustomMerchant(e.target.value);
                        setResult(null);
                      }}
                    />
                  </div>
                  <AnimatePresence>
                    {customMerchant.trim() && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[12px] text-app-text-secondary mt-1.5 pl-1 font-medium"
                      >
                        {detectedCategory && detectedCategory !== 'general' 
                          ? `Detected category: ${CATEGORY_DISPLAY_NAMES[detectedCategory]}` 
                          : 'Using general purchase rewards.'}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label>Purchase Amount</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-secondary font-medium">$</span>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="pl-8 h-12 text-[16px]"
                  value={amount}
                  onChange={(e: any) => {
                    setAmount(e.target.value);
                    setResult(null);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="recurring" 
                checked={isRecurring} 
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  setResult(null);
                }}
                className="w-4 h-4 rounded border-gray-300 text-app-primary focus:ring-app-primary"
              />
              <Label htmlFor="recurring" className="mb-0 cursor-pointer">Recurring Purchase</Label>
            </div>

            <Button 
              className="w-full h-12 text-[15px]" 
              onClick={handleFindBestCard}
              disabled={!category || !amount || walletItems.length === 0 || (category === 'general' && !customMerchant.trim()) || isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={animationStep}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {ANIMATION_STEPS[animationStep]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              ) : (
                "Find Best Card"
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            id="best-card-result"
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-5">
              {/* Segmented Control */}
              <div className="flex p-1 bg-[#F5F5F7] rounded-xl">
                <button
                  onClick={() => setActiveTab('result')}
                  className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all ${activeTab === 'result' ? 'bg-white text-app-text shadow-sm' : 'text-app-text-secondary hover:text-app-text'}`}
                >
                  Result
                </button>
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all ${activeTab === 'compare' ? 'bg-white text-app-text shadow-sm' : 'text-app-text-secondary hover:text-app-text'}`}
                >
                  Compare
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-1.5 text-[13px] font-medium rounded-lg transition-all ${activeTab === 'details' ? 'bg-white text-app-text shadow-sm' : 'text-app-text-secondary hover:text-app-text'}`}
                >
                  Details
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'result' && displayResult && (
                  <motion.div
                    key={`result-${displayResult.winner.cardId}-${displayResult.winner.estimatedReward}`}
                    initial={{ opacity: 0, y: 12, scale: 0.96, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                    className="p-6 rounded-[32px] bg-white text-app-text relative overflow-hidden border border-app-border/40"
                  >
                    {/* Emerald Glow Sweep */}
                    <motion.div
                      initial={{ x: '-100%', opacity: 0 }}
                      animate={{ x: '100%', opacity: [0, 1, 0] }}
                      transition={{ duration: 0.9, delay: 0.1, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(16,185,129,0.18)] to-transparent pointer-events-none z-20"
                    />
                    
                    <div className="absolute top-0 right-0 w-32 h-32 bg-app-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        <div className="flex flex-col mb-1">
                          <p className="text-[11px] font-bold text-app-primary uppercase tracking-widest">Top Recommendation</p>
                          <p className="text-[10px] text-app-text-secondary font-medium">Smart category optimization applied</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold tracking-tight text-app-text">
                            {displayResult.winner.cardName}
                          </h3>
                          {displayResult.smartTag && (
                            <span className="px-1.5 py-0.5 rounded bg-app-primary/10 text-app-primary text-[9px] font-bold uppercase tracking-wider">
                              {displayResult.smartTag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            displayResult.confidence === 'Very High' ? 'bg-[#00C805]' :
                            displayResult.confidence === 'High' ? 'bg-[#00C805]/80' :
                            displayResult.confidence === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <p className="text-[10px] font-semibold text-app-text-secondary">
                            Confidence: <span className={
                              displayResult.confidence === 'Very High' || displayResult.confidence === 'High' ? 'text-[#00C805]' :
                              displayResult.confidence === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                            }>{displayResult.confidence}</span>
                          </p>
                        </div>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: [1, 1.12, 1] 
                        }}
                        transition={{ 
                          opacity: { duration: 0.4, delay: 0.2 },
                          scale: { 
                            duration: 0.42, 
                            delay: 0.45, // 450ms after card appears
                            ease: "easeInOut" 
                          }
                        }}
                        className="px-3 py-1 rounded-full bg-[#00C805]/10 text-[#00C805] text-[10px] font-bold tracking-wide uppercase border border-[#00C805]/20"
                      >
                        Best Value
                      </motion.div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start relative z-10">
                      {/* Featured Card Visual */}
                      <div className="relative shrink-0 [perspective:1000px]">
                        {(() => {
                          const winnerCard = CARD_CATALOG.find(c => c.id === displayResult.winner.cardId);
                          const cardColor = winnerCard ? getCardColor(winnerCard.issuer, winnerCard.name) : '#000';
                          return (
                            <motion.div 
                              key={`hero-${displayResult.winner.cardId}`}
                              layoutId={`card-visual-${walletItems.find(i => i.cardId === displayResult.winner.cardId)?.instanceId}`}
                              className="w-[160px] h-[100px] rounded-[12px] relative overflow-hidden animate-card-hero animate-card-shadow"
                              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                              style={{ 
                                background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                              }}
                            >
                              {/* Chip detail */}
                              <div className="absolute top-4 left-4 w-8 h-6 bg-gradient-to-br from-yellow-200/40 to-yellow-500/40 rounded-[4px] border border-white/20" />
                              
                              {/* Premium light sweep effect */}
                              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                                <div className="absolute inset-0 w-[30%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-light-sweep" />
                              </div>
                              
                              {/* Card details placeholder lines */}
                              <div className="absolute bottom-4 left-4 space-y-1.5">
                                <div className="w-20 h-1.5 bg-white/20 rounded-full" />
                                <div className="w-12 h-1.5 bg-white/10 rounded-full" />
                              </div>
                              
                              {/* Light sweep effect */}
                              <motion.div 
                                initial={{ x: '-150%' }}
                                animate={{ x: '150%' }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                                className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                              />
                            </motion.div>
                          );
                        })()}
                        
                        {/* Shadow depth */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/10 blur-xl rounded-full" />
                      </div>

                      <div className="flex-1 w-full grid grid-cols-2 gap-6">
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.0 }}
                        >
                          <p className="text-[11px] font-semibold text-app-text-secondary mb-1 uppercase tracking-wider">Reward Rate</p>
                          <p className="text-2xl font-bold text-app-text">{formatRate(displayResult.winner.estimatedRate)}</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1 }}
                        >
                          <p className="text-[11px] font-semibold text-app-text-secondary mb-1 uppercase tracking-wider">Estimated Reward</p>
                          <p className="text-3xl font-extrabold text-[#00C805]">
                            <AnimatedCounter value={displayResult.winner.estimatedReward} duration={600} />
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      className="mt-8 pt-6 border-t border-app-border/40"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-app-primary/10 flex items-center justify-center">
                            <Sparkles size={16} className="text-app-primary" />
                          </div>
                          <p className="text-[13px] text-app-text-secondary">
                            {displayResult.explanation}
                          </p>
                        </div>
                        
                        <div className="pl-10 space-y-1">
                          {displayResult.winner.reasons.map((reason, idx) => (
                            <p key={idx} className="text-[11px] text-app-text-secondary/80 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-app-primary/40" />
                              {reason}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {activeTab === 'compare' && displayResult && (
                  <motion.div
                    key="compare"
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="border border-app-border/60 rounded-[24px] overflow-hidden bg-[#F9FAFB] p-4 space-y-2"
                  >
                    {displayResult.allResults.map((res: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-[16px] bg-white border border-app-border/40 shadow-sm">
                        <div>
                          <p className="text-[14px] font-semibold text-app-text">{res.cardName}</p>
                          <p className="text-[12px] text-app-text-secondary">{formatRate(res.estimatedRate)} {res.isBase ? 'base rate' : 'category rate'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[14px] font-semibold text-app-text">{formatCurrency(res.estimatedReward)}</p>
                          <p className="text-[10px] text-app-text-secondary">Score: {res.score.toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'details' && displayResult && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="border border-app-border/60 rounded-[24px] p-5 space-y-4"
                  >
                    <div>
                      <p className="text-[12px] font-semibold text-app-text-secondary uppercase tracking-wider mb-1">Purchase Amount</p>
                      <p className="text-[16px] font-medium text-app-text">{formatCurrency(displayResult.allResults[0].estimatedReward / displayResult.allResults[0].estimatedRate)}</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-app-text-secondary uppercase tracking-wider mb-1">Category Used</p>
                      <p className="text-[16px] font-medium text-app-text">{CATEGORY_DISPLAY_NAMES[category as Category] || category}</p>
                    </div>
                    <div className="pt-3 border-t border-app-border/50">
                      <p className="text-[12px] font-semibold text-app-text-secondary uppercase tracking-wider mb-1">Annual Potential</p>
                      <p className="text-[15px] text-app-text">
                        {formatCurrency(displayResult.winner.estimatedReward * 12)} per year <span className="text-app-text-secondary font-normal">(if spent monthly)</span>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button variant="outline" className="w-full h-12 text-[15px]" onClick={() => setResult(null)}>
                Calculate Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <CardSearchModal 
            isOpen={isSearchOpen} 
            onClose={() => setIsSearchOpen(false)} 
            onAdd={handleAddCard}
            existingCardIds={walletItems.map(i => i.cardId)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCardDetails && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedCardDetails(null)}
            />
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-app-border/50">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
                <h3 className="text-xl font-semibold text-app-text">{selectedCardDetails.name}</h3>
                <p className="text-[14px] text-app-text-secondary mt-1">{selectedCardDetails.issuer}</p>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                <div>
                  <h4 className="text-[12px] font-semibold text-app-text-secondary uppercase tracking-wider mb-3">Rewards Structure</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedCardDetails.categoryRates || {}).map(([cat, rate], i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-[16px] bg-[#F5F5F7]">
                        <span className="text-[14px] font-medium text-app-text capitalize">{CATEGORY_DISPLAY_NAMES[cat as Category] || cat}</span>
                        <span className="text-[14px] font-semibold text-app-primary">{formatRate(rate as number)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 rounded-[16px] bg-[#F5F5F7]">
                      <span className="text-[14px] font-medium text-app-text capitalize">All Other Purchases</span>
                      <span className="text-[14px] font-semibold text-app-primary">{formatRate(selectedCardDetails.baseRate)}</span>
                    </div>
                  </div>
                </div>

                {selectedCardDetails.annualFee !== undefined && (
                  <div>
                    <h4 className="text-[12px] font-semibold text-app-text-secondary uppercase tracking-wider mb-2">Annual Fee</h4>
                    <p className="text-[15px] font-medium text-app-text">${selectedCardDetails.annualFee}</p>
                  </div>
                )}
                
                {selectedCardDetails.description && (
                  <div>
                    <h4 className="text-[12px] font-semibold text-app-text-secondary uppercase tracking-wider mb-2">Details</h4>
                    <p className="text-[14px] text-app-text-secondary leading-relaxed">{selectedCardDetails.description}</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-app-border/50 bg-[#F9FAFB]">
                <Button className="w-full h-12 text-[15px]" onClick={() => setSelectedCardDetails(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </Card>
    </div>
  );
}
