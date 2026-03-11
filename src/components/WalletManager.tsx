import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Wallet, Trash2, Edit2, Check } from 'lucide-react';
import { Button, Input } from './ui';
import { CARD_CATALOG, WalletItem } from '../lib/cards';
import { CardSearchModal } from './CardSearchModal';

interface WalletManagerProps {
  walletItems: WalletItem[];
  onUpdateWallet: (items: WalletItem[]) => void;
}

export function WalletManager({ walletItems, onUpdateWallet }: WalletManagerProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddCard = (cardId: string) => {
    const newItem: WalletItem = {
      instanceId: Math.random().toString(36).substring(2, 9),
      cardId
    };
    onUpdateWallet([...walletItems, newItem]);
  };

  const handleRemoveCard = (instanceId: string) => {
    onUpdateWallet(walletItems.filter(item => item.instanceId !== instanceId));
  };

  const startEdit = (item: WalletItem) => {
    setEditingId(item.instanceId);
    setEditName(item.nickname || '');
  };

  const saveEdit = (instanceId: string) => {
    onUpdateWallet(walletItems.map(item => 
      item.instanceId === instanceId 
        ? { ...item, nickname: editName.trim() || undefined } 
        : item
    ));
    setEditingId(null);
  };

  return (
    <div className="p-5 md:p-6 rounded-[24px] bg-[#F5F5F7] border border-app-border/50 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[16px] font-semibold text-app-text flex items-center gap-2">
            <Wallet size={18} className="text-app-primary" /> My Wallet
          </h3>
          <p className="text-[13px] text-app-text-secondary mt-0.5">Manage your cards.</p>
        </div>
        <Button variant="outline" className="!px-4 !py-2 !rounded-xl bg-white flex gap-1.5 shrink-0 text-[13px] h-9" onClick={() => setIsSearchOpen(true)}>
          <Plus size={16} />
          <span>Add</span>
        </Button>
      </div>

      {walletItems.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-[20px] border border-dashed border-app-border">
          <p className="text-[14px] text-app-text-secondary">Your wallet is empty.</p>
          <button onClick={() => setIsSearchOpen(true)} className="text-app-primary font-medium text-[14px] mt-1.5 hover:underline">
            Add your first card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {walletItems.map(item => {
              const card = CARD_CATALOG.find(c => c.id === item.cardId);
              if (!card) return null;
              const isEditing = editingId === item.instanceId;

              return (
                <motion.div 
                  key={item.instanceId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 rounded-[16px] border border-app-border/60 shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            autoFocus
                            value={editName}
                            onChange={(e: any) => setEditName(e.target.value)}
                            placeholder="e.g. My Daily Driver"
                            className="!py-1.5 !px-2.5 !text-[13px] !rounded-lg h-8"
                            onKeyDown={(e: any) => e.key === 'Enter' && saveEdit(item.instanceId)}
                          />
                          <button onClick={() => saveEdit(item.instanceId)} className="w-8 h-8 rounded-lg bg-app-success/10 text-app-success flex items-center justify-center shrink-0 hover:bg-app-success hover:text-white transition-colors">
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[14px] font-semibold text-app-text truncate">
                            {item.nickname || card.name}
                          </p>
                          <p className="text-[12px] text-app-text-secondary mt-0.5 truncate">
                            {card.issuer} {item.nickname ? `• ${card.name}` : ''}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {!isEditing && (
                        <button onClick={() => startEdit(item)} className="w-7 h-7 rounded-full flex items-center justify-center text-app-text-secondary hover:bg-[#F5F5F7] hover:text-app-text transition-colors">
                          <Edit2 size={14} />
                        </button>
                      )}
                      <button onClick={() => handleRemoveCard(item.instanceId)} className="w-7 h-7 rounded-full flex items-center justify-center text-app-text-secondary hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

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
    </div>
  );
}
