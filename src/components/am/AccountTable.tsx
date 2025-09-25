"use client";

import React, { useState } from 'react';
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
import { Loader2, User, Mail, Phone, MapPin, Briefcase, Edit, Trash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AccountEditForm from './AccountEditForm';
import { deleteAccount } from '@/integrations/supabase/utils';
import { showError, showSuccess } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar components

interface AccountTableProps {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  onAccountChanged: () => void; // Callback to refresh data
}

const AccountTable: React.FC<AccountTableProps> = ({ accounts, isLoading, error, onAccountChanged }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleDelete = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      showSuccess("Conta eliminada com sucesso!");
      onAccountChanged();
    } catch (err: any) {
      console.error("Erro ao eliminar conta:", err);
      showError(err.message || "Falha ao eliminar a conta.");
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-sm">
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
      <Card className="w-full shadow-sm">
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
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Contas de AM</CardTitle>
          <CardDescription>Nenhuma conta de AM encontrada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Não há dados de contas de AM para exibir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Contas de AM</CardTitle>
        <CardDescription className="text-muted-foreground">Lista de todas as contas de Account Managers.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Avatar</TableHead> {/* New Avatar Column */}
                <TableHead className="w-[150px]">Nome da Conta</TableHead>
                <TableHead className="w-[100px]">AM</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[120px]">Telefone</TableHead>
                <TableHead className="w-[120px]">Distrito</TableHead>
                <TableHead className="w-[100px]">Função</TableHead>
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="py-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={account.photo_url || undefined} alt={account.account_name || 'AM Avatar'} />
                      <AvatarFallback>{account.account_name?.charAt(0).toUpperCase() || 'AM'}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium flex items-center py-3">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    {account.account_name || 'N/A'}
                  </TableCell>
                  <TableCell className="py-3">{account.am || 'N/A'}</TableCell>
                  <TableCell className="flex items-center py-3">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {account.email || 'N/A'}
                  </TableCell>
                  <TableCell className="flex items-center py-3">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {account.phone_number || 'N/A'}
                  </TableCell>
                  <TableCell className="flex items-center py-3">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {account.district || 'N/A'}
                  </TableCell>
                  <TableCell className="flex items-center py-3">
                    <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                    {account.role || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedAccount(account);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-8 w-8">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isto irá eliminar permanentemente a conta de AM "{account.account_name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(account.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {selectedAccount && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Conta de AM</DialogTitle>
            </DialogHeader>
            <AccountEditForm
              account={selectedAccount}
              onSave={() => {
                setIsEditDialogOpen(false);
                onAccountChanged();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default AccountTable;