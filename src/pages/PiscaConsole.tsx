"use client";

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout'; // Corrigido para importação nomeada
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { showSuccess, showError } from '@/utils/toast';

export default function PiscaConsole() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const executeCommand = async () => {
    if (!command.trim()) {
      showError('O comando não pode estar vazio.');
      return;
    }

    setLoading(true);
    setOutput(prev => [...prev, `> ${command}`]);
    const toastId = toast.loading('A executar comando...');

    try {
      // This is a placeholder for actual command execution.
      // In a real application, you would send this command to a backend
      // or a Supabase Edge Function that can safely execute SQL or other operations.
      // Direct client-side execution of arbitrary SQL is a security risk.

      // For demonstration, we'll simulate a simple response.
      // If you need to execute SQL, you'd typically use `supabase.rpc` for stored procedures
      // or a secure Edge Function.
      const simulatedResponse = `Comando "${command}" executado com sucesso (simulado).`;
      setOutput(prev => [...prev, simulatedResponse]);
      showSuccess('Comando executado com sucesso!');

      // Example of a real (but unsafe for arbitrary input) Supabase query:
      // const { data, error } = await supabase.from('your_table').select('*');
      // if (error) throw error;
      // setOutput(prev => [...prev, JSON.stringify(data, null, 2)]);

    } catch (error: any) {
      console.error('Erro ao executar comando:', error);
      setOutput(prev => [...prev, `Erro: ${error.message}`]);
      showError(`Erro ao executar comando: ${error.message}`);
    } finally {
      setCommand('');
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Consola Pisca</h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="command-input">Comando</Label>
                <Input
                  id="command-input"
                  placeholder="Digite o seu comando aqui..."
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      executeCommand();
                    }
                  }}
                  disabled={loading}
                />
              </div>
              <Button onClick={executeCommand} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Executar
              </Button>
              <div>
                <Label htmlFor="console-output">Saída da Consola</Label>
                <Textarea
                  id="console-output"
                  readOnly
                  value={output.join('\n')}
                  className="h-64 font-mono text-sm bg-gray-900 text-green-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}