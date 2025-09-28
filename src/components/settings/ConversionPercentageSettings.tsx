"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquareText, RefreshCcw, Save, Loader2 } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { updateUserProfile } from '@/integrations/supabase/utils';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

const DEFAULT_PERCENTAGE = 100;

const ConversionPercentageSettings: React.FC = () => {
  const { user, profile, isLoading: isSessionLoading, refreshProfile } = useSession();
  const [phonePercentage, setPhonePercentage] = useState<number>(DEFAULT_PERCENTAGE);
  const [whatsappPercentage, setWhatsappPercentage] = useState<number>(DEFAULT_PERCENTAGE);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setPhonePercentage(profile.phone_views_conversion_percentage ?? DEFAULT_PERCENTAGE);
      setWhatsappPercentage(profile.whatsapp_interactions_conversion_percentage ?? DEFAULT_PERCENTAGE);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user?.id) {
      showError("Utilizador não autenticado. Por favor, faça login para guardar as percentagens.");
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile(user.id, {
        phone_views_conversion_percentage: phonePercentage,
        whatsapp_interactions_conversion_percentage: whatsappPercentage,
      });
      showSuccess("Percentagens de conversão guardadas com sucesso!");
      await refreshProfile(); // Refresh session context to update UI
    } catch (error: any) {
      console.error("Erro ao guardar percentagens:", error);
      showError(error.message || "Falha ao guardar as percentagens de conversão.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPhonePercentage(DEFAULT_PERCENTAGE);
    setWhatsappPercentage(DEFAULT_PERCENTAGE);
    showSuccess("Valores restaurados para o padrão (100%). Não se esqueça de guardar!");
  };

  const isDirty = (phonePercentage !== (profile?.phone_views_conversion_percentage ?? DEFAULT_PERCENTAGE)) ||
                  (whatsappPercentage !== (profile?.whatsapp_interactions_conversion_percentage ?? DEFAULT_PERCENTAGE));

  if (isSessionLoading) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Configurar Percentagens de Conversão</CardTitle>
          <CardDescription>A carregar configurações...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Configurar Percentagens de Conversão</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              Tel: {phonePercentage}%
            </Badge>
            <Badge variant="secondary" className="text-sm">
              WhatsApp: {whatsappPercentage}%
            </Badge>
          </div>
        </div>
        <CardDescription className="text-muted-foreground">
          Ajuste as percentagens de conversão para cálculos mais precisos de leads totais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Telefone (%) */}
          <div className="space-y-4 p-4 border rounded-md bg-muted/50">
            <Label htmlFor="phone-percentage" className="flex items-center text-base font-medium">
              <Phone className="mr-2 h-5 w-5 text-blue-500" /> Telefone ({phonePercentage}%)
            </Label>
            <Slider
              id="phone-percentage"
              min={0}
              max={100}
              step={1}
              value={[phonePercentage]}
              onValueChange={(value) => setPhonePercentage(value[0])}
              className="[&>span:first-child]:h-2 [&>span:first-child]:bg-blue-200 [&>span:first-child>span]:bg-blue-500"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={phonePercentage}
              onChange={(e) => setPhonePercentage(Number(e.target.value))}
              className="w-full text-center"
            />
          </div>

          {/* WhatsApp (%) */}
          <div className="space-y-4 p-4 border rounded-md bg-muted/50">
            <Label htmlFor="whatsapp-percentage" className="flex items-center text-base font-medium">
              <MessageSquareText className="mr-2 h-5 w-5 text-green-500" /> WhatsApp ({whatsappPercentage}%)
            </Label>
            <Slider
              id="whatsapp-percentage"
              min={0}
              max={100}
              step={1}
              value={[whatsappPercentage]}
              onValueChange={(value) => setWhatsappPercentage(value[0])}
              className="[&>span:first-child]:h-2 [&>span:first-child]:bg-green-200 [&>span:first-child>span]:bg-green-500"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={whatsappPercentage}
              onChange={(e) => setWhatsappPercentage(Number(e.target.value))}
              className="w-full text-center"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Restaurar Padrões
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !isDirty || !user?.id}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A Guardar...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Guardar Alterações
              </>
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-4 p-2 border-t">
          <span className="font-semibold">Cálculo de Leads Totais:</span> Leads Diretas (email) + (Visualizações do Telefone * Percentagem Telefone) + (Interações WhatsApp * Percentagem WhatsApp).
        </p>
      </CardContent>
    </Card>
  );
};

export default ConversionPercentageSettings;