"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EasyvistaTypeCreateForm from '@/components/easyvista-types/EasyvistaTypeCreateForm'; // Reescrevido
import EasyvistaTypeList from '@/components/easyvista-types/EasyvistaTypeList'; // Reescrevido
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const EasyvistaTypeManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh of the list
  const navigate = useNavigate();

  const handleTypeChanged = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1); // Increment key to trigger re-fetch
  }, []);

  const handleBackToSettings = () => {
    navigate('/settings');
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={handleBackToSettings} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar às Definições
        </Button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Settings2 className="mr-3 h-7 w-7 text-primary" /> Gestão de Tipos de Easyvista
          </h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Tipo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Tipo de Easyvista</DialogTitle>
              </DialogHeader>
              <EasyvistaTypeCreateForm
                onSave={() => {
                  setIsCreateDialogOpen(false);
                  handleTypeChanged();
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <Card className="w-full shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Tipos de Easyvista Existentes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Gerencie os tipos personalizados que podem ser usados nos registos Easyvista.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EasyvistaTypeList key={refreshKey} onTypeChanged={handleTypeChanged} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EasyvistaTypeManagement;