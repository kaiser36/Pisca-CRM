import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContactTypes, deleteContactType, ContactType } from '@/integrations/supabase/services/contactTypeService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import ContactTypeEditForm from './ContactTypeEditForm.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ContactTypeTable = () => {
  const queryClient = useQueryClient();
  const { data: contactTypes, isLoading, isError } = useQuery({
    queryKey: ['contact_types'],
    queryFn: getContactTypes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact_types'] });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div>A carregar...</div>;
  if (isError) return <div>Ocorreu um erro ao carregar os dados.</div>;

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contactTypes?.map((type: ContactType) => (
            <TableRow key={type.id}>
              <TableCell>{type.name}</TableCell>
              <TableCell>{new Date(type.created_at!).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <ContactTypeEditForm contactType={type} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isto irá apagar permanentemente o tipo de contacto.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(type.id!)}>Apagar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactTypeTable;