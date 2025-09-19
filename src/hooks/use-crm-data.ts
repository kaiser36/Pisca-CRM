import { useContext } from 'react';
import { CrmDataContext } from '@/context/CrmDataContext'; // Import the context

export function useCrmData() {
  const context = useContext(CrmDataContext);
  if (context === undefined) {
    throw new Error('useCrmData must be used within a CrmDataProvider');
  }
  return context;
}