"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Phone, MessageSquare, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ConversionConfiguratorProps {
  initialPhonePercentage?: number;
  initialWhatsappPercentage?: number;
  onConfigChange: (percentages: { phone: number; whatsapp: number }) => void;
}

const ConversionConfigurator: React.FC<ConversionConfiguratorProps> = ({
  initialPhonePercentage = 100,
  initialWhatsappPercentage = 100,
  onConfigChange,
}) => {
  const [phonePercentage, setPhonePercentage] = useState(initialPhonePercentage);
  const [whatsappPercentage, setWhatsappPercentage] = useState(initialWhatsappPercentage);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    onConfigChange({ phone: phonePercentage, whatsapp: whatsappPercentage });
  }, [phonePercentage, whatsappPercentage, onConfigChange]);

  const handleReset = () => {
    setPhonePercentage(100);
    setWhatsappPercentage(100);
  };

  const handleSliderChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (value: number[]) => {
    setter(value[0]);
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setter(value);
    } else if (e.target.value === '') {
      setter(0);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => setIsVisible(!isVisible)} className="mb-2 text-primary hover:text-primary/90">
          {isVisible ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
          Configurar Percentagens de Conversão
        </Button>
      </div>
      
      {isVisible && (
        <Card className="bg-violet-50/30 dark:bg-gray-900/70 backdrop-blur-sm shadow-subtle border-violet-200/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-blue-600">Configurar Percentagens de Conversão</CardTitle>
              </div>
              <div className="text-sm text-muted-foreground text-right">
                <p>Chamadas: {phonePercentage}%</p>
                <p>WhatsApp: {whatsappPercentage}%</p>
              </div>
            </div>
            <CardDescription className="pt-2">
              Ajuste as percentagens de conversão para cálculos mais precisos de leads totais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Phone Calls Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-purple-700" />
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Chamadas ({phonePercentage}%)</h4>
                </div>
                <Slider
                  value={[phonePercentage]}
                  onValueChange={handleSliderChange(setPhonePercentage)}
                  max={100}
                  step={1}
                  className="[&>span:first-child>span]:bg-purple-600 [&>span:last-child]:border-purple-700"
                />
                <div className="relative w-24">
                  <Input
                    type="number"
                    value={phonePercentage}
                    onChange={handleInputChange(setPhonePercentage)}
                    className="pr-8 text-center"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                </div>
              </div>

              {/* WhatsApp Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-700" />
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">WhatsApp ({whatsappPercentage}%)</h4>
                </div>
                <Slider
                  value={[whatsappPercentage]}
                  onValueChange={handleSliderChange(setWhatsappPercentage)}
                  max={100}
                  step={1}
                  className="[&>span:first-child>span]:bg-purple-600 [&>span:last-child]:border-purple-700"
                />
                <div className="relative w-24">
                  <Input
                    type="number"
                    value={whatsappPercentage}
                    onChange={handleInputChange(setWhatsappPercentage)}
                    className="pr-8 text-center"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </CardContent>
          <Separator className="my-4" />
          <CardFooter className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground italic">
              Leads Totais = Leads de Email + (Chamadas * {phonePercentage}%) + (WhatsApp * {whatsappPercentage}%)
            </p>
            <Button variant="outline" onClick={handleReset}>
              <RotateCw className="mr-2 h-4 w-4" />
              Reset (100% / 100%)
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ConversionConfigurator;