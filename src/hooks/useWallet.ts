import { useState, useEffect, useCallback } from 'react';
import { WalletItem } from '../lib/cards';
import { STORAGE_VERSION } from '../constants';

const STORAGE_KEY = `cardxs_wallet_items_${STORAGE_VERSION}`;
const OLD_STORAGE_KEY = 'cardxs_wallet_items';

export function useWallet() {
  const [walletItems, setWalletItems] = useState<WalletItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      let saved = localStorage.getItem(STORAGE_KEY);
      
      // Migration from v1 if needed
      if (!saved) {
        const oldData = localStorage.getItem(OLD_STORAGE_KEY);
        if (oldData) {
          console.log('[useWallet] Migrating data from old storage key');
          saved = oldData;
          // We keep it for now, but we'll save to new key
        }
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Validate data shape
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid wallet data format: not an array');
        }

        const migrated = parsed.map((item: any) => {
          // Ensure basic properties exist
          if (!item.instanceId || !item.cardId) {
            console.warn('[useWallet] Skipping invalid item:', item);
            return null;
          }

          // Specific migrations
          if (item.cardId === 'bilt-mastercard') {
            return { ...item, cardId: 'bilt-blue' };
          }
          if (item.cardId === 'freedom-unlimited') {
            return { ...item, cardId: 'chase-freedom-unlimited' };
          }
          return item;
        }).filter(Boolean) as WalletItem[];

        setWalletItems(migrated);
        
        // If we migrated or just loaded, ensure it's in the new key
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      } else {
        // Initialize with neutral demo cards if empty
        console.log('[useWallet] Initializing with default demo cards');
        const demoCards: WalletItem[] = [
          { instanceId: Math.random().toString(36).substring(2, 9), cardId: 'chase-sapphire-preferred' },
          { instanceId: Math.random().toString(36).substring(2, 9), cardId: 'chase-freedom-unlimited' }
        ];
        setWalletItems(demoCards);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCards));
      }
    } catch (e) {
      console.error('[useWallet] Failed to load or parse wallet items. Resetting storage.', e);
      // Clear potentially corrupted data
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(OLD_STORAGE_KEY);
      } catch (err) {
        // Ignore errors during removal
      }
      
      const defaultCards: WalletItem[] = [
        { instanceId: Math.random().toString(36).substring(2, 9), cardId: 'chase-sapphire-preferred' },
        { instanceId: Math.random().toString(36).substring(2, 9), cardId: 'chase-freedom-unlimited' }
      ];
      setWalletItems(defaultCards);
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
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
      }
      return next;
    });
  }, []);

  const removeCard = useCallback((instanceId: string) => {
    setWalletItems(prev => {
      const next = prev.filter(item => item.instanceId !== instanceId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
      }
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
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
      }
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
