"use client";

import React from 'react';
import { useEffect, useState } from 'react';
import { Employee, Stand } from '@/types/crm';
import { fetchEmployeesByCompanyExcelId, deleteEmployee, fetchCompaniesByExcelCompanyIds } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, User, Mail, Phone, Briefcase, Building, MapPin, Image, Edit, Trash, MoreHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import EmployeeEditForm from './EmployeeEditForm';

interface EmployeeListProps {
  companyExcelId: string;
  onEmployeeChanged: () => void; // Callback to refresh list after changes
}

const EmployeeList: React.FC<EmployeeListProps> = ({ companyExcelId, onEmployeeChanged }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [companyStands, setCompanyStands] = useState<Stand[]>([]); // For edit form

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadEmployees = async () => {
    if (!userId) {
      setError("Utilizador não autenticado. Por favor, faça login para ver os colaboradores.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEmployees = await fetchEmployeesByCompanyExcelId(userId, companyExcelId);
      setEmployees(fetchedEmployees);
    } catch (err: any) {
      console.error("Erro ao carregar colaboradores:", err);
      setError(err.message || "Falha ao carregar os colaboradores.");
      showError(err.message || "Falha ao carregar os colaboradores.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStandsForEdit = async () => {
    if (!userId || !companyExcelId) return;
    try {
      const companies = await fetchCompaniesByExcelCompanyIds(userId, [companyExcelId]);
      if (companies.length > 0) {
        setCompanyStands(companies[0].stands || []);
      }
    } catch (err: any) {
      console.error("Erro ao carregar stands da empresa para edição:", err);
      showError(err.message || "Falha ao carregar os stands da empresa para edição.");
    }
  };

  useEffect(() => {
    if (userId && companyExcelId) {
      loadEmployees();
      loadStandsForEdit(); // Load stands when component mounts or company changes
    }
  }, [userId, companyExcelId, onEmployeeChanged]); // Add onEmployeeChanged to dependencies to trigger reload

  const handleDelete = async (employeeId: string) => {
    try {
      await deleteEmployee(employeeId);
      showSuccess("Colaborador eliminado com sucesso!");
      onEmployeeChanged(); // Trigger parent to reload list
    } catch (err: any) {
      console.error("Erro ao eliminar colaborador:", err);
      showError(err.message || "Falha ao eliminar o colaborador.");
    }
  };

  const renderField = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;

    let displayValue: React.ReactNode = value;
    if (label.includes('Email')) {
      displayValue = (
        <a href={`mailto:${String(value)}`} className="text-blue-500 hover:underline">
          {String(value)}
        </a>
      );
    } else if (label.includes('Telemóvel')) {
      displayValue = (
        <a href={`tel:${String(value)}`} className="text-blue-500 hover:underline">
          {String(value)}
        </a>
      );
    }

    return (
      <div className="flex items-center text-sm">
        <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}:</span> <span className="ml-1 text-foreground">{displayValue}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className="h-full w-full pr-4">
      <div className="space-y-4">
        {employees.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum colaborador encontrado para esta empresa.</p>
        ) : (
          employees.map((employee) => (
            <Card key={employee.id} className="w-full shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.image_url || undefined} alt={employee.nome_colaborador} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {employee.nome_colaborador.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold">{employee.nome_colaborador}</CardTitle>
                    <CardDescription className="text-muted-foreground">ID Pessoa: {employee.id_people}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedEmployee(employee); setIsEditDialogOpen(true); }}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}> {/* Prevent dropdown close */}
                          <Trash className="mr-2 h-4 w-4 text-red-500" /> <span className="text-red-500">Eliminar</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isto irá eliminar permanentemente o colaborador "{employee.nome_colaborador}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => employee.id && handleDelete(employee.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {renderField(Briefcase, "Cargo", employee.cargo)}
                  {renderField(Phone, "Telemóvel", employee.telemovel)}
                  {renderField(Mail, "Email", employee.email)}
                  {renderField(Building, "Nome Comercial", employee.commercial_name)}
                  {renderField(MapPin, "Stand", employee.stand_name ? `${employee.stand_name} (ID: ${employee.stand_id})` : employee.stand_id)}
                  {renderField(Image, "URL da Imagem", employee.image_url)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Criado em: {employee.created_at ? new Date(employee.created_at).toLocaleString() : 'N/A'}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedEmployee && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Colaborador</DialogTitle>
            </DialogHeader>
            <EmployeeEditForm
              employee={selectedEmployee}
              companyStands={companyStands} // Pass stands to edit form
              onSave={() => {
                setIsEditDialogOpen(false);
                onEmployeeChanged(); // Refresh the list after saving
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </ScrollArea>
  );
};

export default EmployeeList;