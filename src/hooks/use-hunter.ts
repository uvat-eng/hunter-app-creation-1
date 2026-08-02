import { useContext } from 'react';
import { HunterContext } from '@/contexts/hunter-context-def';

export const useHunter = () => {
  const ctx = useContext(HunterContext);
  if (!ctx) throw new Error('useHunter must be used within HunterProvider');
  return ctx;
};