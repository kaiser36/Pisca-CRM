"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Settings, Phone, List } from 'lucide-react';
import ContactTypeManager from './ContactTypeManager';

interface ContactTypeSubMenuProps {
  onBack: () => void;
}

const ContactTypeSubMenu: React.FC<ContactTypeSubMenuProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'manage'>('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Gestão de Tipos de Contacto</h2>
      </div>

      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveSection('manage')}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <CardTitle>Gerir Tipos de Contacto</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Adicionar, editar e remover tipos de contacto e as respetivas opções de relatório.
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                <CardTitle>Ver Tipos Existentes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visualizar todos os tipos de contacto configurados e as suas opções.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'manage' && (
        <div>
          <Button variant="ghost" onClick={() => setActiveSection('overview')} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar à Visão Geral
          </Button>
          <ContactTypeManager />
        </div>
      )}
    </div>
  );
};

export default ContactTypeSubMenu;