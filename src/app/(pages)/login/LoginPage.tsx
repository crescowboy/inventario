"use client"


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Package, Shield } from "lucide-react";
import { useState } from "react";

interface LoginPageProps {
  onLogin: (userData: { username: string; role: 'empleado' | 'jefe' }) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Default credentials stored in localStorage simulation
  const defaultCredentials = {
    admin: { password: "admin123", role: "jefe" as const },
    empleado: { password: "emp123", role: "empleado" as const },
    jefe: { password: "jefe123", role: "jefe" as const }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate login validation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = defaultCredentials[username as keyof typeof defaultCredentials];
    
    if (user && user.password === password) {
      // Store session in localStorage
      localStorage.setItem('inventorySession', JSON.stringify({
        username,
        role: user.role,
        loginTime: new Date().toISOString()
      }));

      toast({
        title: "¡Bienvenido!",
        description: `Acceso autorizado como ${user.role}`,
      });

      onLogin({ username, role: user.role });
    } else {
      toast({
        title: "Error de acceso",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Sistema de Inventario
          </h1>
          <p className="text-muted-foreground">
            Gestión profesional de inventarios
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Ingresar"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Credenciales de prueba:</p>
              <div className="text-xs space-y-1 bg-muted/50 p-3 rounded-lg">
                <div><strong>Admin:</strong> admin / admin123</div>
                <div><strong>Jefe:</strong> jefe / jefe123</div>
                <div><strong>Empleado:</strong> empleado / emp123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;