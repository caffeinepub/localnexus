import { useState, useEffect, useRef } from 'react';

const TYPING_IDLE_TIMEOUT = 2000;

export function useTypingIdle() {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = () => {
    setIsTyping(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, TYPING_IDLE_TIMEOUT);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isTyping, handleTyping };
}
