import { useState, useEffect } from 'react';

export function usePersonalization() {
  const [userName, setUserName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('cardxs_user_name');
      return saved || 'there';
    } catch (e) {
      return 'there';
    }
  });

  const updateName = (newName: string) => {
    const formattedName = newName.trim() || 'there';
    setUserName(formattedName);
    try {
      localStorage.setItem('cardxs_user_name', formattedName);
    } catch (e) {
      console.error('Failed to save name to localStorage', e);
    }
  };

  return { userName, updateName };
}
