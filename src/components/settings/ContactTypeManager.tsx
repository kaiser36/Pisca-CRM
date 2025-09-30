"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getContactTypes, addContactType, deleteContactType, ContactType } from '@/integrations/supabase/services/contactTypeService';
import { getContactReportOptionsByContactTypeId, addContactReportOption, deleteContactReportOption, ContactReportOption } from '@/integrations/supabase/services/contactReportOptionService';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import { showError } from '@/utils/toast';

interface ContactTypeWithOptions extends ContactType {
  options: ContactReportOption[];
}

const ContactTypeManager: React.FC = () => {
  const [contactTypes, setContactTypes] = useState<ContactTypeWithOptions[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newOptionTexts, setNewOptionTexts] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        showError("User not authenticated");
      }
    };
    fetchUser();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const types = await getContactTypes();
    const typesWithOptions: ContactTypeWithOptions[] = await Promise.all(
      types.map(async (type) => {
        const options = await getContactReportOptionsByContactTypeId(type.id);
        return { ...type, options };
      })
    );
    setContactTypes(typesWithOptions);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleAddType = async () => {
    if (!newTypeName.trim() || !userId) return;
    const newType = await addContactType(newTypeName.trim(), userId);
    if (newType) {
      setNewTypeName('');
      fetchData();
    }
  };

  const handleDeleteType = async (id: string) => {
    await deleteContactType(id);
    fetchData();
  };

  const handleAddOption = async (typeId: string) => {
    const reportText = newOptionTexts[typeId]?.trim();
    if (!reportText || !userId) return;
    const newOption = await addContactReportOption(typeId, reportText, userId);
    if (newOption) {
      setNewOptionTexts(prev => ({ ...prev, [typeId]: '' }));
      fetchData();
    }
  };

  const handleDeleteOption = async (id: string) => {
    await deleteContactReportOption(id);
    fetchData();
  };

  if (loading) {
    return <p>Loading contact types...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerir Tipos de Contacto e Opções de Relatório</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <h3 className="font-semibold">Adicionar Novo Tipo de Contacto</h3>
          <div className="flex space-x-2">
            <Input
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Nome do novo tipo"
            />
            <Button onClick={handleAddType}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar</Button>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {contactTypes.map((type) => (
            <AccordionItem value={type.id} key={type.id}>
              <AccordionTrigger className="flex justify-between">
                <span className="font-medium">{type.name}</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Opções de Relatório</h4>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteType(type.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {type.options.map((option) => (
                      <li key={option.id} className="flex justify-between items-center">
                        <span>{option.report_text}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteOption(option.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </li>
                    ))}
                    {type.options.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma opção definida.</p>}
                  </ul>
                  <div className="flex space-x-2">
                    <Input
                      value={newOptionTexts[type.id] || ''}
                      onChange={(e) => setNewOptionTexts(prev => ({ ...prev, [type.id]: e.target.value }))}
                      placeholder="Nova opção de relatório"
                    />
                    <Button size="sm" onClick={() => handleAddOption(type.id)}>Adicionar Opção</Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {contactTypes.length === 0 && <p className="text-center text-muted-foreground mt-4">Nenhum tipo de contacto encontrado. Adicione um para começar.</p>}
      </CardContent>
    </Card>
  );
};

export default ContactTypeManager;