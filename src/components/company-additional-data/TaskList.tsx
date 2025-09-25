"use client";

import React, { useEffect, useState } from 'react';
import { Task } from '@/types/crm';
import { fetchTasksByCompanyExcelId, deleteTask } from '@/integrations/supabase/utils';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Calendar, User, Tag, Info, Clock, Edit, Trash, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format, parseISO, isPast } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import TaskEditForm from './TaskEditForm';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskListProps {
  companyExcelId: string;
  onTaskChanged: () => void; // Callback to refresh list after changes
}

const TaskList: React.FC<TaskListProps> = ({ companyExcelId, onTaskChanged }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const loadTasks = async () => {
    if (!userId) {
      setError("Utilizador não autenticado. Por favor, faça login para ver as tarefas.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await fetchTasksByCompanyExcelId(userId, companyExcelId);
      setTasks(fetchedTasks);
    } catch (err: any) {
      console.error("Erro ao carregar tarefas:", err);
      setError(err.message || "Falha ao carregar as tarefas.");
      showError(err.message || "Falha ao carregar as tarefas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && companyExcelId) {
      loadTasks();
    }
  }, [userId, companyExcelId, onTaskChanged]);

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      showSuccess("Tarefa eliminada com sucesso!");
      onTaskChanged(); // Trigger parent to reload list
    } catch (err: any) {
      console.error("Erro ao eliminar tarefa:", err);
      showError(err.message || "Falha ao eliminar a tarefa.");
    }
  };

  const getStatusBadgeVariant = (status: Task['status']) => {
    switch (status) {
      case 'Completed': return 'default'; // Green-ish
      case 'In Progress': return 'secondary'; // Blue-ish
      case 'Cancelled': return 'destructive'; // Red-ish
      case 'Pending':
      default: return 'outline'; // Grey-ish
    }
  };

  const getPriorityBadgeVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low':
      default: return 'outline';
    }
  };

  const renderField = (Icon: React.ElementType, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;

    let displayValue: React.ReactNode = value;
    if (label.includes('Data Limite') && typeof value === 'string') {
      try {
        const date = parseISO(value);
        displayValue = format(date, 'dd/MM/yyyy');
        if (isPast(date) && (selectedTask?.status === 'Pending' || selectedTask?.status === 'In Progress')) {
          displayValue = <span className="text-red-500">{displayValue} (Atrasada)</span>;
        }
      } catch {
        displayValue = String(value);
      }
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
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhuma tarefa encontrada para esta empresa.</p>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="w-full shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-3">
                  <div>
                    <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      <Badge variant={getStatusBadgeVariant(task.status)} className="mr-2">{task.status}</Badge>
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
                    </CardDescription>
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
                    <DropdownMenuItem onClick={() => { setSelectedTask(task); setIsEditDialogOpen(true); }}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash className="mr-2 h-4 w-4 text-red-500" /> <span className="text-red-500">Eliminar</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isto irá eliminar permanentemente a tarefa "{task.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => task.id && handleDelete(task.id)}>
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
                  {renderField(Calendar, "Data Limite", task.due_date)}
                  {renderField(User, "Atribuído a", task.assigned_to_employee_name || 'N/A')}
                </div>
                {task.description && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-start text-sm">
                      <Info className="mr-2 h-4 w-4 text-muted-foreground mt-1" />
                      <span className="font-medium">Descrição:</span> <span className="ml-1 flex-1 text-foreground">{task.description}</span>
                    </div>
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Criado em: {task.created_at ? new Date(task.created_at).toLocaleString() : 'N/A'}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedTask && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
            </DialogHeader>
            <TaskEditForm
              task={selectedTask}
              onSave={() => {
                setIsEditDialogOpen(false);
                onTaskChanged();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </ScrollArea>
  );
};

export default TaskList;