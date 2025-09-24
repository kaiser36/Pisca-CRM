"use client";

import React from 'react';
import { useEffect, useState } from 'react';
import { AccountContact } from '@/types/crm';
import { fetchAccountContactsByCompanyExcelId } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Calendar, User, Mail, Phone, MessageSquareText, FileText, LinkIcon, DollarSign, Building, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface AccountContactListProps {
  companyExcelId: string;
}

const AccountContactList: React.FC<AccountContactListProps> = ({ companyExcelId }) => {
  const [contacts, setContacts] = useState<AccountContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadContacts = async () => {
    if (!userId) {
      setError("Utilizador não autenticado. Por favor, faça login para ver os contactos.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedContacts = await fetchAccountContactsByCompanyExcelId(userId, companyExcelId);
      setContacts(fetchedContacts);
    } catch (err: any) {
      console.error("Erro ao carregar contactos de conta:", err);
      setError(err.message || "Falha ao carregar os contactos de conta.");
      showError(err.message || "Falha ao carregar os contactos de conta.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && companyExcelId) {
      loadContacts();
    }
  }, [userId, companyExcelId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const renderField = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0)) return null;

    let displayValue: React.ReactNode = value;
    if (typeof value === 'boolean') {
      displayValue = value ? (
        <span className="flex items-center text-green-600">Sim</span>
      ) : (
        <span className="flex items-center text-red-600">Não</span>
      );
    } else if (label.includes('Data')) {
      try {
        displayValue = format(new Date(String(value)), 'dd/MM/yyyy HH:mm');
      } catch {
        displayValue = String(value);
      }
    } else if (label.includes('URL')) {
      displayValue = (
        <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {String(value)}
        </a>
      );
    }

    return (
      <div className="flex items-center text-sm">
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}:</span> <span className="ml-1 text-foreground">{displayValue}</span>
      </div>
    );
  };

  return (
    <ScrollArea className="h-full w-full pr-4">
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum contacto encontrado para esta empresa.</p>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className="w-full shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">{contact.subject || 'Contacto sem Assunto'}</CardTitle>
                <CardDescription className="text-muted-foreground">ID Excel da Empresa: {contact.company_excel_id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {renderField(Calendar, "Data do Contacto", contact.contact_date)}
                  {renderField(Tag, "Tipo de Contacto", contact.contact_type)}
                  {renderField(Phone, "Meio de Contacto", contact.contact_method)}
                  {renderField(User, "Pessoa de Contacto", contact.contact_person_name)}
                  {renderField(Building, "Nome Comercial", contact.commercial_name)}
                  {renderField(Building, "Nome da Empresa", contact.company_name)}
                  {renderField(Mail, "Email de Envio", contact.sending_email)}
                  {renderField(LinkIcon, "URL do Anexo", contact.attachment_url)}
                  {renderField(DollarSign, "É Parceiro Credibom?", contact.is_credibom_partner)}
                  {renderField(Mail, "Enviar Email?", contact.send_email)}
                  {renderField(Tag, "Tipo de Email", contact.email_type)}
                  {renderField(FileText, "Assunto do Email", contact.email_subject)}
                  {renderField(MessageSquareText, "AM da Conta", contact.account_am)}
                  {renderField(MessageSquareText, "ID CRM", contact.crm_id)}
                  {renderField(MessageSquareText, "Nome do Stand", contact.stand_name)}
                  {renderField(MessageSquareText, "Grupo da Empresa", contact.company_group)}
                  {renderField(MessageSquareText, "Account Armatis", contact.account_armatis)}
                  {renderField(MessageSquareText, "Trimestre", contact.quarter)}
                </div>
                {contact.report_text && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-start text-sm">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      <span className="font-medium">Relatório:</span> <span className="ml-1 flex-1 text-foreground">{contact.report_text}</span>
                    </div>
                  </>
                )}
                {contact.email_body && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-start text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      <span className="font-medium">Corpo do Email:</span> <span className="ml-1 flex-1 text-foreground">{contact.email_body}</span>
                    </div>
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Criado em: {contact.created_at ? format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default AccountContactList;