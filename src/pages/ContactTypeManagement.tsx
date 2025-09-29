import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const ContactTypeManagement: React.FC = () => {
  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestão de Tipos de Contato</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure tipos de contato e as respetivas opções de relatório
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Tipos de Contato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Página de Tipos de Contato
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                A página está a funcionar correctamente!
              </p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Testar Funcionalidade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ContactTypeManagement;