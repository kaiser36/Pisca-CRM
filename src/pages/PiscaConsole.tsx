"use client";

import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PISCA_PISCA_URL = "https://www.piscapisca.pt/mgmt/login?returnUrl=%2Fconsole%2Fdashboard";

const PiscaConsole: React.FC = () => {
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const [iframeError, setIframeError] = useState<string | null>(null);

  const handleIframeLoad = () => {
    setIsLoadingIframe(false);
    setIframeError(null); // Clear any previous errors on successful load
  };

  const handleIframeError = () => {
    setIsLoadingIframe(false);
    setIframeError("Não foi possível carregar a Consola Pisca. O site pode estar a bloquear a incorporação (iframe) por razões de segurança (CORS/X-Frame-Options).");
  };

  return (
    <Layout>
      <div className="h-full flex flex-col w-full">
        <Card className="flex-1 shadow-md flex flex-col rounded-none border-none">
          <CardContent className="flex-1 flex flex-col p-0 h-full"> {/* Adicionado h-full aqui */}
            {isLoadingIframe && (
              <div className="flex flex-col items-center justify-center h-full w-full bg-muted/50 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">A carregar a Consola Pisca...</p>
              </div>
            )}
            {iframeError && (
              <div className="p-4">
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Erro de Carregamento</AlertTitle>
                  <AlertDescription>{iframeError}</AlertDescription>
                </Alert>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Pode tentar aceder à Consola Pisca diretamente no navegador:
                  </p>
                  <a href={PISCA_PISCA_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" /> Abrir Consola Pisca em Nova Aba
                    </Button>
                  </a>
                </div>
              </div>
            )}
            <iframe
              src={PISCA_PISCA_URL}
              title="Consola Pisca"
              className="flex-1 w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ display: isLoadingIframe || iframeError ? 'none' : 'block' }}
            ></iframe>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PiscaConsole;