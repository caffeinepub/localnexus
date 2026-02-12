/**
 * Utility functions for localStorage operations with error handling.
 */

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage (key: "${key}"):`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (key: "${key}"):`, error);
    return false;
  }
}

export function removeFromStorage(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (key: "${key}"):`, error);
    return false;
  }
}
