import { useState, useEffect, useCallback } from 'react';
import { WalletItem } from '../lib/cards';

const STORAGE_KEY = 'cardxs_wallet_items';

export function useWallet() {
  const [walletItems, setWalletItems] = useState<WalletItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration logic if needed
        const migrated = parsed.map((item: WalletItem) => {
          if (item.cardId === 'bilt-mastercard') {
            return { ...item, cardId: 'bilt-blue' };
          }
          return item;
        });
        setWalletItems(migrated);
      } catch (e) {
        console.error('Failed to parse wallet items', e);
        setWalletItems([]);
      }
    } else {
      // Initialize with neutral demo cards if empty
      const demoCards: WalletItem[] = [
        { instanceId: Math.random().toString(36).substring(2, 9), cardId: 'chase-sapphire-preferred' },
        { instanceId: Math.random().toString(36).substring(2, 9), cardId: 'freedom-unlimited' }
      ];
      setWalletItems(demoCards);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCards));
    }
    setIsLoaded(true);
  }, []);

  const addCard = useCallback((cardId: string) => {
    setWalletItems(prev => {
      // Prevent duplicates
      if (prev.some(item => item.cardId === cardId)) {
        return prev;
      }

      const newItem: WalletItem = {
        instanceId: Math.random().toString(36).substring(2, 9),
        cardId
      };
      const next = [...prev, newItem];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeCard = useCallback((instanceId: string) => {
    setWalletItems(prev => {
      const next = prev.filter(item => item.instanceId !== instanceId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateCard = useCallback((instanceId: string, nickname: string) => {
    setWalletItems(prev => {
      const next = prev.map(item => 
        item.instanceId === instanceId 
          ? { ...item, nickname: nickname.trim() || undefined } 
          : item
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    walletItems,
    isLoaded,
    addCard,
    removeCard,
    updateCard
  };
}
