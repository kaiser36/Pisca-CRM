"use client";

import * as React from "react";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useSession } from "@/context/SessionContext";
import { searchCompanyAdditionalExcelData } from "@/integrations/supabase/services/excelDataService";
import { CompanyAdditionalExcelData } from "@/types/crm";

export function CompanySearch() {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [results, setResults] = React.useState<CompanyAdditionalExcelData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const navigate = useNavigate();
  const { user } = useSession();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  React.useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm.length < 2 || !user) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await searchCompanyAdditionalExcelData(user.id, debouncedSearchTerm);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, user]);

  const handleSelect = (companyExcelId: string) => {
    if (companyExcelId) {
      navigate(`/company-additional-data/${companyExcelId}`);
      setOpen(false);
      setSearchTerm("");
      setResults([]);
    }
  };

  // This is a workaround to prevent cmdk's default filtering
  // since we are fetching results from the server.
  const filter = () => 1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] md:w-[300px] justify-start text-muted-foreground"
        >
          <Search className="mr-2 h-4 w-4 shrink-0" />
          Pesquisar empresa...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false} filter={filter}>
          <CommandInput 
            placeholder="Digite o nome ou ID da empresa..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 text-sm text-center text-muted-foreground flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A pesquisar...
              </div>
            )}
            {!isLoading && debouncedSearchTerm.length > 0 && debouncedSearchTerm.length < 2 && (
              <div className="p-4 text-sm text-center text-muted-foreground">
                Continue a digitar para pesquisar...
              </div>
            )}
            {!isLoading && results.length === 0 && debouncedSearchTerm.length >= 2 && (
              <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
            )}
            {!isLoading && results.length > 0 && (
              <CommandGroup heading={`Resultados para "${debouncedSearchTerm}"`}>
                {results.map((company) => (
                  <CommandItem
                    key={company.excel_company_id}
                    value={company.excel_company_id}
                    onSelect={() => handleSelect(company.excel_company_id)}
                  >
                    {company["Nome Comercial"] || company.excel_company_id}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}