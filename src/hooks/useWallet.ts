import { useState, useEffect, useCallback } from 'react';
import { WalletItem } from '../lib/cards';
import { STORAGE_VERSION } from '../constants';

const STORAGE_KEY = `cardxs_wallet_items_${STORAGE_VERSION}`;
const OLD_STORAGE_KEYS = ['cardxs_wallet_items', 'wallet'];

export function useWallet() {
  const [walletItems, setWalletItems] = useState<WalletItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Clean up old storage keys to prevent stale seeded data from repopulating
      OLD_STORAGE_KEYS.forEach(key => {
        if (localStorage.getItem(key)) {
          console.log(`[useWallet] Clearing old storage key: ${key}`);
          localStorage.removeItem(key);
        }
      });

      let saved = localStorage.getItem(STORAGE_KEY);

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
        // Initialize with empty wallet
        console.log('[useWallet] Initializing with empty wallet');
        setWalletItems([]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
    } catch (e) {
      console.error('[useWallet] Failed to load or parse wallet items. Resetting storage.', e);
      // Clear potentially corrupted data
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        // Ignore errors during removal
      }
      
      setWalletItems([]);
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
