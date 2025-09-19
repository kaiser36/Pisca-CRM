import React from 'react';
import { parseStandsExcel } from '@/lib/excel-parser';
import { Company } from '@/types/crm';

export function useCrmData() {
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await parseStandsExcel('/Stands_Pisca.xlsx');
        setCompanies(data);
      } catch (err) {
        console.error("Failed to load CRM data:", err);
        setError("Failed to load CRM data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return { companies, isLoading, error };
}