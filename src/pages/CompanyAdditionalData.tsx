"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CompanyAdditionalExcelData, Company } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'react-hot-toast';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Search, RefreshCw } from 'lucide-react';

export default function CompanyAdditionalData() {
  const { user } = useAuth();
  const [additionalData, setAdditionalData] = useState<CompanyAdditionalExcelData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdditionalData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('company_additional_excel_data')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching additional data:', error);
      setError(error.message);
      showError('Erro ao carregar dados adicionais das empresas.');
    } else {
      setAdditionalData(data || []);
    }
    setLoading(false);
  }, [user]);

  const fetchCompanies = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('companies')
      .select('id, company_name, company_email'); // Use snake_case

    if (error) {
      console.error('Error fetching companies:', error);
    } else {
      setCompanies(data || []);
    }
  }, [user]);

  useEffect(() => {
    fetchAdditionalData();
    fetchCompanies();
  }, [fetchAdditionalData, fetchCompanies]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja eliminar este registo de dados adicionais?')) return;
    const toastId = toast.loading('A eliminar...');
    try {
      const { error } = await supabase
        .from('company_additional_excel_data')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      showSuccess('Registo eliminado com sucesso!');
      fetchAdditionalData();
    } catch (error: any) {
      console.error('Error deleting additional data:', error);
      showError(`Erro ao eliminar registo: ${error.message}`);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const getCompanyName = (companyDbId: string | null) => {
    const company = companies.find(c => c.id === companyDbId);
    return company ? company.company_name : 'N/A'; // Use snake_case
  };

  const filteredData = additionalData.filter(item =>
    item.excel_company_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item["Nome Comercial"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item["Email da empresa"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCompanyName(item.company_db_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" /> A carregar dados adicionais...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] text-red-500">
          <RefreshCw className="h-6 w-6 mr-2" /> Erro: {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dados Adicionais das Empresas</h2>
          <div className="flex items-center space-x-2">
            <Link to="/company-additional-data/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Input
            placeholder="Pesquisar por ID, Nome Comercial ou Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" onClick={() => fetchAdditionalData()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Excel da Empresa</TableHead>
                <TableHead>Nome Comercial</TableHead>
                <TableHead>Email da Empresa</TableHead>
                <TableHead>Empresa Associada</TableHead>
                <TableHead>Distrito</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>AM</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.excel_company_id}</TableCell>
                    <TableCell>{item["Nome Comercial"]}</TableCell>
                    <TableCell>{item["Email da empresa"]}</TableCell>
                    <TableCell>{getCompanyName(item.company_db_id)}</TableCell>
                    <TableCell>{item.Distrito}</TableCell>
                    <TableCell>{item.Cidade}</TableCell>
                    <TableCell>{item.AM}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/company-additional-data/${item.id}`}>
                        <Button variant="ghost" size="icon" className="mr-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum dado adicional encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}