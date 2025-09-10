"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Package, 
  Users, 
  Crown, 
  BarChart3, 
  FolderOpen, 
  Clock, 
  LogOut,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  currentModule: string;
  onModuleChange: (module: string) => void;
  onLogout: () => void;
  userRole: 'empleado' | 'jefe';
  username: string;
}

const Sidebar = ({ currentModule, onModuleChange, onLogout, userRole, username }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'empleado',
      label: 'Empleado',
      icon: Users,
      description: 'Búsqueda de artículos',
      available: true,
    },
    {
      id: 'jefe',
      label: 'Jefe',
      icon: Crown,
      description: 'Gestión avanzada',
      available: userRole === 'jefe',
    },
    {
      id: 'inventario',
      label: 'Inventario Global',
      icon: Package,
      description: 'Vista completa',
      available: true,
    },
    {
      id: 'secciones',
      label: 'Secciones',
      icon: FolderOpen,
      description: 'Organizar por categorías',
      available: true,
    },
    {
      id: 'recientes',
      label: 'Recientes',
      icon: Clock,
      description: 'Actividad reciente',
      available: true,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <div className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 flex flex-col",
        isCollapsed ? "w-16" : "w-80"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Inventario Pro
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {username} ({userRole === 'jefe' ? 'Administrador' : 'Empleado'})
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="md:hidden"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            if (!item.available) return null;
            
            const Icon = item.icon;
            const isActive = currentModule === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200 hover:scale-105",
                  isActive && "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg",
                  isCollapsed ? "px-2" : "px-4"
                )}
                onClick={() => {
                  onModuleChange(item.id);
                  if (window.innerWidth < 768) setIsCollapsed(true);
                }}
              >
                <Icon className={cn("w-5 h-5", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && (
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start hover:bg-destructive hover:text-destructive-foreground transition-all duration-200",
              isCollapsed ? "px-2" : "px-4"
            )}
            onClick={onLogout}
          >
            <LogOut className={cn("w-5 h-5", isCollapsed ? "mr-0" : "mr-3")} />
            {!isCollapsed && "Cerrar Sesión"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;