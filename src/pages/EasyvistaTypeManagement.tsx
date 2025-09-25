"use client";

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EasyvistaTypeList from '@/components/easyvista-types/EasyvistaTypeList';
import EasyvistaTypeCreateForm from '@/components/easyvista-types/EasyvistaTypeCreateForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const EasyvistaTypeManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshList, setRefreshList] = useState(false); // State to trigger list refresh

  const handleBackToSettings = () => {
    navigate('/settings');
  };

  const handleTypeChanged = () => {
    setRefreshList(prev => !prev); // Toggle state to force EasyvistaTypeList to reload
    setIsCreateDialogOpen(false); // Close dialog after save
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={handleBackToSettings}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar às Definições
          </Button>
          <h1 className="text-3xl font-bold">Gestão de Tipos de Easyvista</h1>
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
                onSave={handleTypeChanged}
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
            <EasyvistaTypeList onTypeChanged={handleTypeChanged} key={refreshList.toString()} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EasyvistaTypeManagement;