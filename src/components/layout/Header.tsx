"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Bell, ListTodo, Calendar, User } from 'lucide-react'; // Added Calendar and User icons
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { usePendingTasks } from '@/hooks/use-pending-tasks';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { pendingTasks, isLoading, refreshTasks } = usePendingTasks();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10 shadow-sm">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-2 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <img 
          src="https://www.piscapisca.pt/assets/img/svg/top-header/pisca-pisca-color.svg" 
          alt="Pisca CRM Logo" 
          className="h-8 mr-3"
        />
        <h1 className="text-2xl font-bold tracking-tight">Pisca CRM</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pendingTasks.length > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {pendingTasks.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 z-[9999]">
            <div className="p-4 border-b">
              <h4 className="font-semibold text-lg flex items-center">
                <ListTodo className="mr-2 h-5 w-5" /> Tarefas Pendentes
              </h4>
            </div>
            <ScrollArea className="h-60">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">A carregar tarefas...</div>
              ) : pendingTasks.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">Nenhuma tarefa pendente.</div>
              ) : (
                <div className="p-4 space-y-3">
                  {pendingTasks.map(task => (
                    <Link key={task.id} to={`/company-additional-data/${task.company_excel_id}?tab=tasks`} onClick={() => refreshTasks()}>
                      <div className="flex flex-col p-2 border rounded-md hover:bg-muted/50 transition-colors">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Empresa: {task.company_excel_id}
                        </p>
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="mr-1 h-3 w-3" /> Data Limite: {format(parseISO(task.due_date), 'dd/MM/yyyy')}
                          </p>
                        )}
                        {task.assigned_to_employee_name && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <User className="mr-1 h-3 w-3" /> Atribuído a: {task.assigned_to_employee_name}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </ScrollArea>
            <Separator />
            <div className="p-2 text-center">
              <Button variant="ghost" className="w-full" onClick={refreshTasks}>
                Atualizar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        {/* Outros elementos do cabeçalho aqui */}
      </div>
    </header>
  );
};

export default Header;