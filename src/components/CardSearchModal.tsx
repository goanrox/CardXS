import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Plus, Check } from 'lucide-react';
import { CARD_CATALOG } from '../lib/cards';
import { Input } from './ui';
import { toast } from 'sonner';

interface CardSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (cardId: string) => void;
  existingCardIds: string[];
}

export function CardSearchModal({ isOpen, onClose, onAdd, existingCardIds }: CardSearchModalProps) {
  const [query, setQuery] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCards = CARD_CATALOG.filter(card => {
    const searchStr = `${card.name} ${card.issuer} ${card.keywords?.join(' ') || ''}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  const handleAdd = (cardId: string, cardName: string) => {
    onAdd(cardId);
    toast.success(`${cardName} added to wallet`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-4 md:p-6 border-b border-app-border/50 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-text-secondary" size={18} />
            <Input 
              autoFocus
              placeholder="Search credit cards..." 
              className="pl-10 h-11 bg-[#F5F5F7] border-transparent focus:bg-white text-[15px]"
              value={query}
              onChange={(e: any) => setQuery(e.target.value)}
            />
          </div>
          <button onClick={onClose} className="w-11 h-11 rounded-full bg-[#F5F5F7] flex items-center justify-center text-app-text-secondary hover:text-app-text transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 text-app-text-secondary">
              <p className="text-[14px]">No cards found matching "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredCards.map(card => {
                const isAdded = existingCardIds.includes(card.id);
                return (
                  <div key={card.id} className="flex items-center justify-between p-3 rounded-[16px] hover:bg-[#F5F5F7] transition-colors border border-transparent hover:border-app-border/50">
                    <div className="pr-3">
                      <p className="text-[14px] font-semibold text-app-text">{card.name}</p>
                      <p className="text-[12px] text-app-text-secondary mt-0.5 line-clamp-1">{card.issuer} • {card.description}</p>
                    </div>
                    <button 
                      onClick={() => handleAdd(card.id, card.name)}
                      disabled={isAdded}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1 ${isAdded ? 'bg-[#00C805]/10 text-[#00C805] cursor-default' : 'bg-app-primary/10 text-app-primary hover:bg-app-primary hover:text-white'}`}
                    >
                      <AnimatePresence mode="wait">
                        {isAdded ? (
                          <motion.div
                            key="added"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-1"
                          >
                            <Check size={14} /> Added
                          </motion.div>
                        ) : (
                          <motion.div
                            key="add"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-1"
                          >
                            <Plus size={14} /> Add
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
