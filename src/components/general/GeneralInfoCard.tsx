"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Edit, XCircle } from 'lucide-react';
import { fetchGeneralInfo, upsertGeneralInfo } from '@/integrations/supabase/utils'; // Updated import
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { GeneralInfo } from '@/types/crm';

const GeneralInfoCard: React.FC = () => {
  const [info, setInfo] = useState<GeneralInfo | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  const loadGeneralInfo = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedInfo = await fetchGeneralInfo(userId);
      setInfo(fetchedInfo);
      setTitle(fetchedInfo?.title || 'Informação Geral');
      setContent(fetchedInfo?.content || '');
    } catch (err: any) {
      console.error("Erro ao carregar informação geral:", err);
      showError(`Falha ao carregar informação geral: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadGeneralInfo();
    }
  }, [userId, loadGeneralInfo]);

  const handleSave = async () => {
    if (!userId) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar dados.");
      return;
    }
    setIsSaving(true);
    try {
      const updatedInfo = await upsertGeneralInfo({ id: info?.id, title, content }, userId);
      setInfo(updatedInfo);
      showSuccess("Informação geral guardada com sucesso!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Erro ao guardar informação geral:", err);
      showError(`Falha ao guardar informação geral: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle(info?.title || 'Informação Geral');
    setContent(info?.content || '');
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informação Geral</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!userId) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informação Geral</CardTitle>
          <CardDescription>Por favor, faça login para ver e gerir a informação geral.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Informação Geral</CardTitle>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Título</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da Informação"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Conteúdo</label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva aqui a sua informação geral..."
                rows={10}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <XCircle className="mr-2 h-4 w-4" /> Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold">{info?.title || 'Nenhum Título'}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{info?.content || 'Nenhuma informação geral disponível. Clique em Editar para adicionar.'}</p>
            {info?.updated_at && (
              <p className="text-xs text-gray-500">Última atualização: {new Date(info.updated_at).toLocaleString()}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneralInfoCard;