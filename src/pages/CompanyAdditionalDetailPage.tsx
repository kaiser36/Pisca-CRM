"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CompanyAdditionalExcelData, Company } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { showSuccess, showError } from '@/utils/toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function CompanyAdditionalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<CompanyAdditionalExcelData>>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isNew = location.pathname.includes('/new');

  const fetchCompanies = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('companies')
      .select('id, company_name, company_email'); // Use snake_case

    if (error) {
      console.error('Error fetching companies:', error);
      showError('Erro ao carregar empresas para associação.');
    } else {
      setCompanies(data || []);
    }
  }, [user]);

  const fetchAdditionalData = useCallback(async () => {
    if (!id || isNew) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('company_additional_excel_data')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching additional data:', error);
      showError('Erro ao carregar dados adicionais.');
      navigate('/company-additional-data');
    } else {
      setFormData(data || {});
    }
    setLoading(false);
  }, [id, isNew, navigate]);

  useEffect(() => {
    fetchCompanies();
    fetchAdditionalData();
  }, [fetchCompanies, fetchAdditionalData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError('Utilizador não autenticado.');
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading(isNew ? 'A criar registo...' : 'A atualizar registo...');

    try {
      let result;
      if (isNew) {
        result = await supabase
          .from('company_additional_excel_data')
          .insert({ ...formData, user_id: user.id })
          .select()
          .single();
      } else {
        result = await supabase
          .from('company_additional_excel_data')
          .update(formData)
          .eq('id', id)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      showSuccess(isNew ? 'Registo criado com sucesso!' : 'Registo atualizado com sucesso!');
      navigate('/company-additional-data');
    } catch (error: any) {
      console.error('Error saving additional data:', error);
      showError(`Erro ao guardar registo: ${error.message}`);
    } finally {
      toast.dismiss(toastId);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> A carregar...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {isNew ? 'Adicionar Novo Dado Adicional da Empresa' : `Editar Dados Adicionais: ${formData["Nome Comercial"] || formData.excel_company_id}`}
          </h2>
          <Button variant="outline" onClick={() => navigate('/company-additional-data')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="excel_company_id">ID Excel da Empresa</Label>
              <Input
                id="excel_company_id"
                name="excel_company_id"
                value={formData.excel_company_id || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="company_db_id">Empresa Associada (CRM)</Label>
              <Select
                name="company_db_id"
                value={formData.company_db_id || ''}
                onValueChange={(value) => handleSelectChange('company_db_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.company_name} ({company.company_email}) {/* Use snake_case */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="Nome Comercial">Nome Comercial</Label>
              <Input
                id="Nome Comercial"
                name="Nome Comercial"
                value={formData["Nome Comercial"] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Email da empresa">Email da empresa</Label>
              <Input
                id="Email da empresa"
                name="Email da empresa"
                type="email"
                value={formData["Email da empresa"] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="STAND_POSTAL_CODE">Código Postal do Stand</Label>
              <Input
                id="STAND_POSTAL_CODE"
                name="STAND_POSTAL_CODE"
                value={formData.STAND_POSTAL_CODE || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Distrito">Distrito</Label>
              <Input
                id="Distrito"
                name="Distrito"
                value={formData.Distrito || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Cidade">Cidade</Label>
              <Input
                id="Cidade"
                name="Cidade"
                value={formData.Cidade || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Morada">Morada</Label>
              <Input
                id="Morada"
                name="Morada"
                value={formData.Morada || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="AM_OLD">AM Antigo</Label>
              <Input
                id="AM_OLD"
                name="AM_OLD"
                value={formData.AM_OLD || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="AM">AM</Label>
              <Input
                id="AM"
                name="AM"
                value={formData.AM || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Stock STV">Stock STV</Label>
              <Input
                id="Stock STV"
                name="Stock STV"
                type="number"
                value={formData["Stock STV"] || 0}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="API">API</Label>
              <Input
                id="API"
                name="API"
                value={formData.API || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Site">Site</Label>
              <Input
                id="Site"
                name="Site"
                value={formData.Site || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Stock na empresa">Stock na empresa</Label>
              <Input
                id="Stock na empresa"
                name="Stock na empresa"
                type="number"
                value={formData["Stock na empresa"] || 0}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Logotipo">Logotipo</Label>
              <Input
                id="Logotipo"
                name="Logotipo"
                value={formData.Logotipo || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Classificação">Classificação</Label>
              <Input
                id="Classificação"
                name="Classificação"
                value={formData.Classificação || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Percentagem de Importados">Percentagem de Importados</Label>
              <Input
                id="Percentagem de Importados"
                name="Percentagem de Importados"
                type="number"
                value={formData["Percentagem de Importados"] || 0}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Onde compra as viaturas">Onde compra as viaturas</Label>
              <Input
                id="Onde compra as viaturas"
                name="Onde compra as viaturas"
                value={formData["Onde compra as viaturas"] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Concorrencia">Concorrência</Label>
              <Input
                id="Concorrencia"
                name="Concorrencia"
                value={formData.Concorrencia || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Investimento redes sociais">Investimento redes sociais</Label>
              <Input
                id="Investimento redes sociais"
                name="Investimento redes sociais"
                type="number"
                value={formData["Investimento redes sociais"] || 0}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Investimento em portais">Investimento em portais</Label>
              <Input
                id="Investimento em portais"
                name="Investimento em portais"
                type="number"
                value={formData["Investimento em portais"] || 0}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="Mercado b2b"
                name="Mercado b2b"
                checked={formData["Mercado b2b"] || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="Mercado b2b">Mercado B2B</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="Utiliza CRM"
                name="Utiliza CRM"
                checked={formData["Utiliza CRM"] || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="Utiliza CRM">Utiliza CRM</Label>
            </div>
            <div>
              <Label htmlFor="Qual o CRM">Qual o CRM</Label>
              <Input
                id="Qual o CRM"
                name="Qual o CRM"
                value={formData["Qual o CRM"] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Plano Indicado">Plano Indicado</Label>
              <Input
                id="Plano Indicado"
                name="Plano Indicado"
                value={formData["Plano Indicado"] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="Mediador de credito"
                name="Mediador de credito"
                checked={formData["Mediador de credito"] || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="Mediador de credito">Mediador de crédito</Label>
            </div>
            <div>
              <Label htmlFor="Link do Banco de Portugal">Link do Banco de Portugal</Label>
              <Input
                id="Link do Banco de Portugal"
                name="Link do Banco de Portugal"
                value={formData["Link do Banco de Portugal"] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Financeiras com acordo">Financeiras com acordo</Label>
              <Input
                id="Financeiras com acordo"
                name="Financeiras com acordo"
                value={formData["Financeiras com acordo"] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Data ultima visita">Data ultima visita</Label>
              <Input
                id="Data ultima visita"
                name="Data ultima visita"
                value={formData["Data ultima visita"] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Grupo">Grupo</Label>
              <Input
                id="Grupo"
                name="Grupo"
                value={formData.Grupo || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Marcas representadas">Marcas representadas</Label>
              <Input
                id="Marcas representadas"
                name="Marcas representadas"
                value={formData["Marcas representadas"] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="Tipo de empresa">Tipo de empresa</Label>
              <Input
                id="Tipo de empresa"
                name="Tipo de empresa"
                value={formData["Tipo de empresa"] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="Quer CT"
                name="Quer CT"
                checked={formData["Quer CT"] || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="Quer CT">Quer CT</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="Quer ser parceiro Credibom"
                name="Quer ser parceiro Credibom"
                checked={formData["Quer ser parceiro Credibom"] || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="Quer ser parceiro Credibom">Quer ser parceiro Credibom</Label>
            </div>
            <div>
              <Label htmlFor="Autobiz">Autobiz</Label>
              <Input
                id="Autobiz"
                name="Autobiz"
                value={formData.Autobiz || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isNew ? 'Criar Registo' : 'Guardar Alterações'}
          </Button>
        </form>
      </div>
    </Layout>
  );
}