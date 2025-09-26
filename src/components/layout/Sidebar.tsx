"use client";

import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Building,
  Users,
  Store,
  Package,
  Megaphone,
  Handshake,
  ListTodo,
  Info,
  Eye,
  ListTree,
  User,
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const { pathname } = useLocation();
  const [isAccountsOpen, setIsAccountsOpen] = useState(
    pathname.startsWith("/accounts") || pathname.startsWith("/crm-companies")
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r bg-sidebar p-4 text-sidebar-foreground shadow-sm">
      <div className="mb-6 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-sidebar-title">CRM System</h1>
      </div>
      <div className="flex-1 space-y-6">
        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground">
            Geral
          </h2>
          <Link to="/">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Início
            </Button>
          </Link>
          <Link to="/general-info">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/general-info" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Info className="mr-2 h-4 w-4" />
              Informações Gerais
            </Button>
          </Link>
        </div>

        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground">
            Gestão
          </h2>
          <Link to="/companies">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/companies" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Building className="mr-2 h-4 w-4" />
              Empresas
            </Button>
          </Link>
          <Link to="/employees">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/employees" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Colaboradores
            </Button>
          </Link>
          <Link to="/stands">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/stands" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Store className="mr-2 h-4 w-4" />
              Stands
            </Button>
          </Link>
          <Link to="/products">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/products" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Package className="mr-2 h-4 w-4" />
              Produtos
            </Button>
          </Link>
          <Link to="/campaigns">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/campaigns" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Campanhas
            </Button>
          </Link>
          <Link to="/deals">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/deals" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Handshake className="mr-2 h-4 w-4" />
              Negócios
            </Button>
          </Link>
          <Link to="/tasks">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/tasks" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <ListTodo className="mr-2 h-4 w-4" />
              Tarefas
            </Button>
          </Link>
        </div>

        <div className="space-y-1">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground">
            Configurações
          </h2>
          <Link to="/accounts">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/accounts" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <User className="mr-2 h-4 w-4" />
              Minhas Contas
            </Button>
          </Link>
          <Link to="/crm-companies">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/crm-companies" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Building className="mr-2 h-4 w-4" />
              CRM Empresas
            </Button>
          </Link>
          <Link to="/easyvistas">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/easyvistas" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Eye className="mr-2 h-4 w-4" />
              Easyvistas
            </Button>
          </Link>
          <Link to="/easyvista-types">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === "/easyvista-types" && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <ListTree className="mr-2 h-4 w-4" />
              Tipos de Easyvista
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}