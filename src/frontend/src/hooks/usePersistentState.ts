import { useState, useEffect } from 'react';

/**
 * Custom hook that syncs state with localStorage.
 * Automatically loads persisted data on mount and saves changes on update.
 */
export function usePersistentState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading persisted state for key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving persisted state for key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}
