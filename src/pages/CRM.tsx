"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Terminal, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout'; // Corrigido para importação nomeada
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Company, CompanyAdditionalExcelData } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/integrations/supabase/auth';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';

export default function CRM() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [additionalData, setAdditionalData] = useState<CompanyAdditionalExcelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [additionalFormData, setAdditionalFormData] = useState<Partial<CompanyAdditionalExcelData>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const fetchCompanies = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching companies:', error);
      setError(error.message);
      showError('Erro ao carregar empresas.');
    } else {
      setCompanies(data || []);
    }
    setLoading(false);
  }, [user]);

  const fetchAdditionalData = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('company_additional_excel_data')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching additional data:', error);
      showError('Erro ao carregar dados adicionais.');
    } else {
      setAdditionalData(data || []);
    }
  }, [user]);

  useEffect(() => {
    fetchCompanies();
    fetchAdditionalData();
  }, [fetchCompanies, fetchAdditionalData]);

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setFormData(company);
    const companyAdditional = additionalData.find(ad => ad.company_db_id === company.id);
    setAdditionalFormData(companyAdditional || {});
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdditionalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdditionalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdditionalSelectChange = (name: string, value: string) => {
    setAdditionalFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAdditionalCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAdditionalFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    if (!user || !selectedCompany) return;

    const toastId = toast.loading('A guardar alterações...');

    try {
      // Update main company data
      const { error: companyError } = await supabase
        .from('companies')
        .update(formData)
        .eq('id', selectedCompany.id);

      if (companyError) {
        throw companyError;
      }

      // Update or insert additional company data
      if (additionalFormData.id) {
        const { error: additionalUpdateError } = await supabase
          .from('company_additional_excel_data')
          .update(additionalFormData)
          .eq('id', additionalFormData.id);

        if (additionalUpdateError) {
          throw additionalUpdateError;
        }
      } else if (Object.keys(additionalFormData).length > 0) {
        const { error: additionalInsertError } = await supabase
          .from('company_additional_excel_data')
          .insert({
            ...additionalFormData,
            user_id: user.id,
            company_db_id: selectedCompany.id,
            excel_company_id: selectedCompany.company_id,
          });

        if (additionalInsertError) {
          throw additionalInsertError;
        }
      }

      await fetchCompanies();
      await fetchAdditionalData();
      setSelectedCompany(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      showSuccess('Empresa atualizada com sucesso!');
    } catch (error: any) {
      console.error('Error saving company:', error);
      showError(`Erro ao guardar empresa: ${error.message}`);
    } finally {
      toast.dismiss(toastId);
    }
  };

  const paginatedCompanies = companies.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(companies.length / itemsPerPage);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Terminal className="h-6 w-6 animate-spin mr-2" /> A carregar empresas...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] text-red-500">
          <Terminal className="h-6 w-6 mr-2" /> Erro: {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Empresas CRM</h2>
          <Button onClick={() => navigate('/companies')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Empresas
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Lista de Empresas</CardTitle>
              <CardDescription>Selecione uma empresa para ver ou editar detalhes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {paginatedCompanies.length > 0 ? (
                  paginatedCompanies.map((company) => (
                    <Button
                      key={company.id}
                      variant={selectedCompany?.id === company.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleSelectCompany(company)}
                    >
                      {company.company_name}
                    </Button>
                  ))
                ) : (
                  <p>Nenhuma empresa encontrada.</p>
                )}
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>Página {currentPage + 1} de {totalPages}</span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1 || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedCompany && (
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{selectedCompany.company_name}</CardTitle>
                <Button onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancelar' : 'Editar'}</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Nome da Empresa</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_id">ID da Empresa</Label>
                    <Input
                      id="company_id"
                      name="company_id"
                      value={formData.company_id || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nif">NIF</Label>
                    <Input
                      id="nif"
                      name="nif"
                      value={formData.nif || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_email">Email da Empresa</Label>
                    <Input
                      id="company_email"
                      name="company_email"
                      type="email"
                      value={formData.company_email || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_contact_person">Pessoa de Contacto</Label>
                    <Input
                      id="company_contact_person"
                      name="company_contact_person"
                      value={formData.company_contact_person || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plafond">Plafond</Label>
                    <Input
                      id="plafond"
                      name="plafond"
                      type="number"
                      value={formData.plafond || 0}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supervisor">Supervisor</Label>
                    <Input
                      id="supervisor"
                      name="supervisor"
                      value={formData.supervisor || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_crb_partner"
                      name="is_crb_partner"
                      checked={formData.is_crb_partner || false}
                      onChange={handleCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="is_crb_partner">Parceiro CRB</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_apdca_partner"
                      name="is_apdca_partner"
                      checked={formData.is_apdca_partner || false}
                      onChange={handleCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="is_apdca_partner">Parceiro APDCA</Label>
                  </div>
                  <div>
                    <Label htmlFor="creation_date">Data de Criação</Label>
                    <Input
                      id="creation_date"
                      name="creation_date"
                      value={formData.creation_date || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_login_date">Último Login</Label>
                    <Input
                      id="last_login_date"
                      name="last_login_date"
                      value={formData.last_login_date || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="financing_simulator_on"
                      name="financing_simulator_on"
                      checked={formData.financing_simulator_on || false}
                      onChange={handleCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="financing_simulator_on">Simulador de Financiamento Ativo</Label>
                  </div>
                  <div>
                    <Label htmlFor="simulator_color">Cor do Simulador</Label>
                    <Input
                      id="simulator_color"
                      name="simulator_color"
                      type="color"
                      value={formData.simulator_color || '#000000'}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_plan">Último Plano</Label>
                    <Input
                      id="last_plan"
                      name="last_plan"
                      value={formData.last_plan || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan_price">Preço do Plano</Label>
                    <Input
                      id="plan_price"
                      name="plan_price"
                      type="number"
                      value={formData.plan_price || 0}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan_expiration_date">Data de Expiração do Plano</Label>
                    <Input
                      id="plan_expiration_date"
                      name="plan_expiration_date"
                      value={formData.plan_expiration_date || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="plan_active"
                      name="plan_active"
                      checked={formData.plan_active || false}
                      onChange={handleCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="plan_active">Plano Ativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="plan_auto_renewal"
                      name="plan_auto_renewal"
                      checked={formData.plan_auto_renewal || false}
                      onChange={handleCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="plan_auto_renewal">Renovação Automática do Plano</Label>
                  </div>
                  <div>
                    <Label htmlFor="current_bumps">Bumps Atuais</Label>
                    <Input
                      id="current_bumps"
                      name="current_bumps"
                      type="number"
                      value={formData.current_bumps || 0}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_bumps">Total de Bumps</Label>
                    <Input
                      id="total_bumps"
                      name="total_bumps"
                      type="number"
                      value={formData.total_bumps || 0}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="commercial_name">Nome Comercial</Label>
                    <Input
                      id="commercial_name"
                      name="commercial_name"
                      value={formData.commercial_name || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_postal_code">Código Postal</Label>
                    <Input
                      id="company_postal_code"
                      name="company_postal_code"
                      value={formData.company_postal_code || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">Distrito</Label>
                    <Input
                      id="district"
                      name="district"
                      value={formData.district || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_city">Cidade</Label>
                    <Input
                      id="company_city"
                      name="company_city"
                      value={formData.company_city || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_address">Morada</Label>
                    <Input
                      id="company_address"
                      name="company_address"
                      value={formData.company_address || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="am_old">AM Antigo</Label>
                    <Input
                      id="am_old"
                      name="am_old"
                      value={formData.am_old || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="am_current">AM Atual</Label>
                    <Input
                      id="am_current"
                      name="am_current"
                      value={formData.am_current || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_stv">Stock STV</Label>
                    <Input
                      id="stock_stv"
                      name="stock_stv"
                      type="number"
                      value={formData.stock_stv || 0}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_api_info">Informação API da Empresa</Label>
                    <Input
                      id="company_api_info"
                      name="company_api_info"
                      value={formData.company_api_info || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_stock">Stock da Empresa</Label>
                    <Input
                      id="company_stock"
                      name="company_stock"
                      type="number"
                      value={formData.company_stock || 0}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo_url">URL do Logotipo</Label>
                    <Input
                      id="logo_url"
                      name="logo_url"
                      value={formData.logo_url || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="classification">Classificação</Label>
                    <Input
                      id="classification"
                      name="classification"
                      value={formData.classification || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imported_percentage">Percentagem de Importados</Label>
                    <Input
                      id="imported_percentage"
                      name="imported_percentage"
                      type="number"
                      value={formData.imported_percentage || 0}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_source">Onde compra as viaturas</Label>
                    <Input
                      id="vehicle_source"
                      name="vehicle_source"
                      value={formData.vehicle_source || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="competition">Concorrência</Label>
                    <Input
                      id="competition"
                      name="competition"
                      value={formData.competition || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="social_media_investment">Investimento Redes Sociais</Label>
                    <Input
                      id="social_media_investment"
                      name="social_media_investment"
                      type="number"
                      value={formData.social_media_investment || 0}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="portal_investment">Investimento em Portais</Label>
                    <Input
                      id="portal_investment"
                      name="portal_investment"
                      type="number"
                      value={formData.portal_investment || 0}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="b2b_market"
                      name="b2b_market"
                      checked={formData.b2b_market || false}
                      onChange={handleCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="b2b_market">Mercado B2B</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="uses_crm"
                      name="uses_crm"
                      checked={formData.uses_crm || false}
                      onChange={handleCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="uses_crm">Utiliza CRM</Label>
                  </div>
                  <div>
                    <Label htmlFor="crm_software">Qual o CRM</Label>
                    <Input
                      id="crm_software"
                      name="crm_software"
                      value={formData.crm_software || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recommended_plan">Plano Indicado</Label>
                    <Input
                      id="recommended_plan"
                      name="recommended_plan"
                      value={formData.recommended_plan || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="credit_mediator"
                      name="credit_mediator"
                      checked={formData.credit_mediator || false}
                      onChange={handleCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="credit_mediator">Mediador de Crédito</Label>
                  </div>
                  <div>
                    <Label htmlFor="bank_of_portugal_link">Link do Banco de Portugal</Label>
                    <Input
                      id="bank_of_portugal_link"
                      name="bank_of_portugal_link"
                      value={formData.bank_of_portugal_link || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="financing_agreements">Financeiras com Acordo</Label>
                    <Input
                      id="financing_agreements"
                      name="financing_agreements"
                      value={formData.financing_agreements || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_visit_date">Data Última Visita</Label>
                    <Input
                      id="last_visit_date"
                      name="last_visit_date"
                      value={formData.last_visit_date || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_group">Grupo</Label>
                    <Input
                      id="company_group"
                      name="company_group"
                      value={formData.company_group || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="represented_brands">Marcas Representadas</Label>
                    <Input
                      id="represented_brands"
                      name="represented_brands"
                      value={formData.represented_brands || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_type">Tipo de Empresa</Label>
                    <Input
                      id="company_type"
                      name="company_type"
                      value={formData.company_type || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="wants_ct"
                      name="wants_ct"
                      checked={formData.wants_ct || false}
                      onChange={handleCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="wants_ct">Quer CT</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="wants_crb_partner"
                      name="wants_crb_partner"
                      checked={formData.wants_crb_partner || false}
                      onChange={handleCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="wants_crb_partner">Quer ser parceiro Credibom</Label>
                  </div>
                  <div>
                    <Label htmlFor="autobiz_info">Autobiz Info</Label>
                    <Input
                      id="autobiz_info"
                      name="autobiz_info"
                      value={formData.autobiz_info || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stand_name">Nome do Stand</Label>
                    <Input
                      id="stand_name"
                      name="stand_name"
                      value={formData.stand_name || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-4">Dados Adicionais do Excel</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="Nome Comercial">Nome Comercial (Adicional)</Label>
                    <Input
                      id="Nome Comercial"
                      name="Nome Comercial"
                      value={additionalFormData["Nome Comercial"] || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Email da empresa">Email da empresa (Adicional)</Label>
                    <Input
                      id="Email da empresa"
                      name="Email da empresa"
                      type="email"
                      value={additionalFormData["Email da empresa"] || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="STAND_POSTAL_CODE">Código Postal do Stand</Label>
                    <Input
                      id="STAND_POSTAL_CODE"
                      name="STAND_POSTAL_CODE"
                      value={additionalFormData.STAND_POSTAL_CODE || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Distrito">Distrito (Adicional)</Label>
                    <Input
                      id="Distrito"
                      name="Distrito"
                      value={additionalFormData.Distrito || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Cidade">Cidade (Adicional)</Label>
                    <Input
                      id="Cidade"
                      name="Cidade"
                      value={additionalFormData.Cidade || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Morada">Morada (Adicional)</Label>
                    <Input
                      id="Morada"
                      name="Morada"
                      value={additionalFormData.Morada || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="AM_OLD">AM Antigo (Adicional)</Label>
                    <Input
                      id="AM_OLD"
                      name="AM_OLD"
                      value={additionalFormData.AM_OLD || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="AM">AM (Adicional)</Label>
                    <Input
                      id="AM"
                      name="AM"
                      value={additionalFormData.AM || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Stock STV">Stock STV (Adicional)</Label>
                    <Input
                      id="Stock STV"
                      name="Stock STV"
                      type="number"
                      value={additionalFormData["Stock STV"] || 0}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="API">API (Adicional)</Label>
                    <Input
                      id="API"
                      name="API"
                      value={additionalFormData.API || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Site">Site (Adicional)</Label>
                    <Input
                      id="Site"
                      name="Site"
                      value={additionalFormData.Site || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Stock na empresa">Stock na empresa (Adicional)</Label>
                    <Input
                      id="Stock na empresa"
                      name="Stock na empresa"
                      type="number"
                      value={additionalFormData["Stock na empresa"] || 0}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Logotipo">Logotipo (Adicional)</Label>
                    <Input
                      id="Logotipo"
                      name="Logotipo"
                      value={additionalFormData.Logotipo || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Classificação">Classificação (Adicional)</Label>
                    <Input
                      id="Classificação"
                      name="Classificação"
                      value={additionalFormData.Classificação || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Percentagem de Importados">Percentagem de Importados (Adicional)</Label>
                    <Input
                      id="Percentagem de Importados"
                      name="Percentagem de Importados"
                      type="number"
                      value={additionalFormData["Percentagem de Importados"] || 0}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Onde compra as viaturas">Onde compra as viaturas (Adicional)</Label>
                    <Input
                      id="Onde compra as viaturas"
                      name="Onde compra as viaturas"
                      value={additionalFormData["Onde compra as viaturas"] || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Concorrencia">Concorrência (Adicional)</Label>
                    <Input
                      id="Concorrencia"
                      name="Concorrencia"
                      value={additionalFormData.Concorrencia || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Investimento redes sociais">Investimento redes sociais (Adicional)</Label>
                    <Input
                      id="Investimento redes sociais"
                      name="Investimento redes sociais"
                      type="number"
                      value={additionalFormData["Investimento redes sociais"] || 0}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Investimento em portais">Investimento em portais (Adicional)</Label>
                    <Input
                      id="Investimento em portais"
                      name="Investimento em portais"
                      type="number"
                      value={additionalFormData["Investimento em portais"] || 0}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="Mercado b2b"
                      name="Mercado b2b"
                      checked={additionalFormData["Mercado b2b"] || false}
                      onChange={handleAdditionalCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="Mercado b2b">Mercado B2B (Adicional)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="Utiliza CRM"
                      name="Utiliza CRM"
                      checked={additionalFormData["Utiliza CRM"] || false}
                      onChange={handleAdditionalCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="Utiliza CRM">Utiliza CRM (Adicional)</Label>
                  </div>
                  <div>
                    <Label htmlFor="Qual o CRM">Qual o CRM (Adicional)</Label>
                    <Input
                      id="Qual o CRM"
                      name="Qual o CRM"
                      value={additionalFormData["Qual o CRM"] || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Plano Indicado">Plano Indicado (Adicional)</Label>
                    <Input
                      id="Plano Indicado"
                      name="Plano Indicado"
                      value={additionalFormData["Plano Indicado"] || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="Mediador de credito"
                      name="Mediador de credito"
                      checked={additionalFormData["Mediador de credito"] || false}
                      onChange={handleAdditionalCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="Mediador de credito">Mediador de crédito (Adicional)</Label>
                  </div>
                  <div>
                    <Label htmlFor="Link do Banco de Portugal">Link do Banco de Portugal (Adicional)</Label>
                    <Input
                      id="Link do Banco de Portugal"
                      name="Link do Banco de Portugal"
                      value={additionalFormData["Link do Banco de Portugal"] || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Financeiras com acordo">Financeiras com acordo (Adicional)</Label>
                    <Input
                      id="Financeiras com acordo"
                      name="Financeiras com acordo"
                      value={additionalFormData["Financeiras com acordo"] || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Data ultima visita">Data ultima visita (Adicional)</Label>
                    <Input
                      id="Data ultima visita"
                      name="Data ultima visita"
                      value={additionalFormData["Data ultima visita"] || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Grupo">Grupo (Adicional)</Label>
                    <Input
                      id="Grupo"
                      name="Grupo"
                      value={additionalFormData.Grupo || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Marcas representadas">Marcas representadas (Adicional)</Label>
                    <Input
                      id="Marcas representadas"
                      name="Marcas representadas"
                      value={additionalFormData["Marcas representadas"] || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="Tipo de empresa">Tipo de empresa (Adicional)</Label>
                    <Input
                      id="Tipo de empresa"
                      name="Tipo de empresa"
                      value={additionalFormData["Tipo de empresa"] || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="Quer CT"
                      name="Quer CT"
                      checked={additionalFormData["Quer CT"] || false}
                      onChange={handleAdditionalCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="Quer CT">Quer CT (Adicional)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="Quer ser parceiro Credibom"
                      name="Quer ser parceiro Credibom"
                      checked={additionalFormData["Quer ser parceiro Credibom"] || false}
                      onChange={handleAdditionalCheckboxChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="Quer ser parceiro Credibom">Quer ser parceiro Credibom (Adicional)</Label>
                  </div>
                  <div>
                    <Label htmlFor="Autobiz">Autobiz (Adicional)</Label>
                    <Input
                      id="Autobiz"
                      name="Autobiz"
                      value={additionalFormData.Autobiz || ''}
                      onChange={handleAdditionalInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <Button onClick={handleSave} className="mt-4">
                    Guardar Alterações
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}