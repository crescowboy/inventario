"use client"

import { useState, useEffect } from "react";
import LoginPage from "./(pages)/login/LoginPage"; 
import Sidebar from "@/components/Sidebar";
import EmpleadoModule from "@/components/modules/EmpleadoModule";
import JefeModule from "@/components/modules/JefeModule";
import InventarioModule from "@/components/modules/InventarioModule";
import SeccionesModule from "@/components/modules/SeccionesModule";
import RecientesModule from "@/components/modules/RecientesModule";

interface UserSession {
  name: string;
  role: 'empleado' | 'jefe' | 'admin';
  loginTime: string;
}

const Index = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentModule, setCurrentModule] = useState('empleado');
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('inventorySession');
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setSession(parsedSession);
      } catch (error) {
        console.error('Error loading session:', error);
        localStorage.removeItem('inventorySession');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: { name: string; role: 'empleado' | 'jefe' | 'admin' }) => {
    const newSession: UserSession = {
      ...userData,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem('inventorySession', JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = () => {
    localStorage.removeItem('inventorySession');
    setSession(null);
    setCurrentModule('empleado');
    // Limpiar la cookie de sesión del servidor
    fetch('/api/auth/logout', { method: 'POST' });
  };

  const renderModule = () => {
    switch (currentModule) {
      case 'empleado':
        return <EmpleadoModule />;
      case 'jefe':
        return <JefeModule />;
      case 'inventario':
        return <InventarioModule />;
      case 'secciones':
        return <SeccionesModule />;
      case 'recientes':
        return <RecientesModule />;
      default:
        return <EmpleadoModule />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentModule={currentModule}
        onModuleChange={setCurrentModule}
        onLogout={handleLogout}
        userRole={session.role}
        username={session.name}
      />
      
      {/* Main Content */}
      <div className="ml-80 min-h-screen">
        <main className="p-6">
          {renderModule()}
        </main>
      </div>

      {/* Mobile spacing */}
      <div className="md:hidden h-16"></div>
    </div>
  );
};

export default Index;