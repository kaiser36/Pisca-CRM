"use client";

import React from 'react';
import { Account } from '@/types/crm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface AccountTableProps {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
}

const AccountTable: React.FC<AccountTableProps> = ({ accounts, isLoading, error }) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Contas de AM</CardTitle>
          <CardDescription>A carregar dados das contas...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Contas de AM</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Contas de AM</CardTitle>
          <CardDescription>Nenhuma conta de AM encontrada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">Não há dados de contas de AM para exibir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contas de AM</CardTitle>
        <CardDescription>Lista de todas as contas de Account Managers.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Conta</TableHead>
                <TableHead>AM</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Distrito</TableHead>
                <TableHead>Função</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    {account.account_name || 'N/A'}
                  </TableCell>
                  <TableCell>{account.am || 'N/A'}</TableCell>
                  <TableCell className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {account.email || 'N/A'}
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {account.phone_number || 'N/A'}
                  </TableCell>
                  <TableCell className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {account.district || 'N/A'}
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                    {account.role || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AccountTable;