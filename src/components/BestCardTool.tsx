import { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Label } from './ui';
import { CreditCard, Sparkles, Store, ShoppingCart, Fuel, Utensils, ShoppingBag, Target as TargetIcon, Plus, Loader2, Wallet, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CARD_CATALOG, CATEGORIES, CATEGORY_DISPLAY_NAMES, Category, WalletItem } from '../lib/cards';
import { calculateReward } from '../lib/rewardEngine';
import { detectMerchantCategory } from '../lib/merchantMapper';
import { CardSearchModal } from './CardSearchModal';
import { InsightCard } from './InsightCard';
import { AnimatedCart, AnimatedStore, AnimatedFuel, AnimatedUtensils, AnimatedShoppingBag, AnimatedTarget } from './AnimatedQuickSpendIcons';
import { toast } from 'sonner';
import { useWallet } from '../hooks/useWallet';

function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState("0.00");

  useEffect(() => {
    let startTime: number;
    const duration = 400; // ms
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
  { name: 'Target', category: 'general', merchant: 'Target', icon: AnimatedTarget },
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
  const [animationStep, setAnimationStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [displayResult, setDisplayResult] = useState<any>(null);

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

    if (!skipAnimation) {
      setIsAnalyzing(true);
      setResult(null);

      // Run animation sequence
      for (let i = 0; i < ANIMATION_STEPS.length; i++) {
        setAnimationStep(i);
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    let effectiveCategory = cat;
    if (cat === 'general') {
      effectiveCategory = detectMerchantCategory(merch);
    }

    // Calculate rewards ONLY for wallet cards
    const walletResults = walletItems.map(item => {
      const card = CARD_CATALOG.find(c => c.id === item.cardId);
      if (!card) return null;
      const reward = calculateReward(card, effectiveCategory as Category, amt);
      return { item, card, reward };
    }).filter(Boolean).sort((a: any, b: any) => b.reward.value - a.reward.value);

    if (walletResults.length > 0) {
      const bestWallet = walletResults[0];
      const newResult = {
        walletResults,
        bestWallet,
        effectiveCategory,
        amount: amt
      };
      setResult(newResult);
      setDisplayResult(newResult);

      if (onResult) {
        onResult(true);
      }
    }

    if (!skipAnimation) {
      setIsAnalyzing(false);
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
    let effectiveCategory = optCategory;
    if (optCategory === 'general' && optMerchant) {
      effectiveCategory = detectMerchantCategory(optMerchant);
    }
    
    const walletResults = walletItems.map(item => {
      const card = CARD_CATALOG.find(c => c.id === item.cardId);
      if (!card) return null;
      const reward = calculateReward(card, effectiveCategory as Category, amtVal);
      return { item, card, reward };
    }).filter(Boolean).sort((a: any, b: any) => b.reward.value - a.reward.value);
    
    return walletResults.length > 0 ? walletResults[0] : null;
  };

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatRate = (rate: number) => `${(rate * 100).toFixed(1)}%`;

  return (
    <Card className="max-w-2xl mx-auto w-full p-5 md:p-8">
      {/* Wallet Chip Bar */}
      <div className="mb-6">
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
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 snap-x hide-scrollbar">
          <AnimatePresence>
            {walletItems.map(item => {
              const card = CARD_CATALOG.find(c => c.id === item.cardId);
              if (!card) return null;
              const isWinner = result?.bestWallet?.item.instanceId === item.instanceId;
              
              return (
                <motion.button 
                  key={item.instanceId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, width: 0, padding: 0, margin: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    if (isEditingWallet) {
                      handleRemoveCard(item.instanceId, card.name);
                    } else {
                      setSelectedCardDetails(card);
                    }
                  }}
                  className={`relative shrink-0 snap-start px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5
                    ${isWinner && !isEditingWallet
                      ? 'bg-app-text text-white shadow-sm ring-1 ring-app-text/20 ring-offset-1' 
                      : isEditingWallet 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        : 'bg-[#F5F5F7] text-app-text hover:bg-[#E8E8ED]'
                    }`}
                >
                  {isEditingWallet ? (
                    <X size={12} className="text-red-500" />
                  ) : isWinner ? (
                    <Sparkles size={12} className="text-[#00C805]" />
                  ) : null}
                  {item.nickname || card.name}
                </motion.button>
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
      </div>

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
                              Use {bestCardInfo.item.nickname || bestCardInfo.card.name.split(' ')[0]}
                            </p>
                            <motion.p 
                              key={`${amtVal}-${isSelected}`}
                              initial={{ opacity: 0.5, filter: 'brightness(1)' }}
                              animate={{ opacity: 1, filter: 'brightness(1.2)' }}
                              transition={{ duration: 0.3 }}
                              className={`text-[12px] font-bold tracking-tight ${isSelected ? 'text-[#00C805]' : 'text-app-primary'}`}
                            >
                              {parseFloat(amount) > 0 ? `+$${(bestCardInfo.reward.rate * parseFloat(amount)).toFixed(2)}` : `${(bestCardInfo.reward.rate * 100).toFixed(1)}% back`}
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
                    key={`result-${displayResult.bestWallet.item.instanceId}-${displayResult.amount}-${displayResult.effectiveCategory}`}
                    initial={{ opacity: 0, scale: 0.96, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="p-6 rounded-[32px] bg-gradient-to-br from-[#141414] to-[#2A2A2A] text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] relative overflow-hidden border border-white/10"
                  >
                    <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#00C805]" /> Top Recommendation
                      </p>
                      <div className="px-2.5 py-1 rounded-full bg-[#00C805]/20 text-[#00C805] text-[10px] font-bold tracking-wide uppercase border border-[#00C805]/30">
                        Best Value
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8">
                        {displayResult.bestWallet.item.nickname || displayResult.bestWallet.card.name}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] font-semibold text-white/50 mb-1 uppercase tracking-wider">Reward Rate</p>
                          <p className="text-xl font-medium text-white/90">{formatRate(displayResult.bestWallet.reward.rate)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-white/50 mb-1 uppercase tracking-wider">Estimated Reward</p>
                          <motion.p 
                            initial={{ filter: 'brightness(1.5)' }}
                            animate={{ filter: 'brightness(1)' }}
                            transition={{ duration: 0.5 }}
                            className="text-2xl font-bold text-[#00C805] drop-shadow-[0_0_10px_rgba(0,200,5,0.3)]"
                          >
                            <AnimatedCounter value={displayResult.bestWallet.reward.value} />
                          </motion.p>
                        </div>
                      </div>
                    </div>
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
                    {displayResult.walletResults.map((res: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-[16px] bg-white border border-app-border/40 shadow-sm">
                        <div>
                          <p className="text-[14px] font-semibold text-app-text">{res.item.nickname || res.card.name}</p>
                          <p className="text-[12px] text-app-text-secondary">{formatRate(res.reward.rate)} {res.reward.isBase ? 'base rate' : 'category rate'}</p>
                        </div>
                        <p className="text-[14px] font-semibold text-app-text">{formatCurrency(res.reward.value)}</p>
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
                      <p className="text-[16px] font-medium text-app-text">{formatCurrency(displayResult.amount)}</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-app-text-secondary uppercase tracking-wider mb-1">Category Used</p>
                      <p className="text-[16px] font-medium text-app-text">{CATEGORY_DISPLAY_NAMES[displayResult.effectiveCategory as Category] || displayResult.effectiveCategory}</p>
                    </div>
                    <div className="pt-3 border-t border-app-border/50">
                      <p className="text-[12px] font-semibold text-app-text-secondary uppercase tracking-wider mb-1">Annual Potential</p>
                      <p className="text-[15px] text-app-text">
                        {formatCurrency(displayResult.bestWallet.reward.value * 12)} per year <span className="text-app-text-secondary font-normal">(if spent monthly)</span>
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
  );
}
