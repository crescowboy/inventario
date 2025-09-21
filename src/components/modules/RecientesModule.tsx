import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Edit, Trash2, Calendar, Loader2 } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";

const RecientesModule = () => {
  const { recentActivities, loading } = useInventory();

  if (loading) {
    return <div className="flex items-center justify-center w-full min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">Cargando actividades recientes...</p></div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} horas`;
    
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="w-4 h-4" />;
      case 'updated':
        return <Edit className="w-4 h-4" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'created':
        return 'Creado';
      case 'updated':
        return 'Actualizado';
      case 'deleted':
        return 'Eliminado';
      default:
        return 'Modificado';
    }
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'created':
        return 'default' as const; 
      case 'updated':
        return 'warning' as const;
      case 'deleted':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  // Group activities by date
  const groupedActivities = recentActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof recentActivities>);

  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Hoy';
    if (dateString === yesterday) return 'Ayer';
    
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-lg">
          <Clock className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Actividad Reciente</h1>
          <p className="text-muted-foreground">Historial cronológico de cambios en el inventario</p>
        </div>
      </div>

      {recentActivities.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay actividad reciente</h3>
              <p className="text-muted-foreground">
                Las acciones realizadas en el inventario aparecerán aquí.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([dateString, activities]) => (
            <Card key={dateString} className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  {formatGroupDate(dateString)}
                  <Badge variant="secondary" className="ml-auto">
                    {(activities as typeof recentActivities).length} actividades
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(activities as typeof recentActivities).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        activity.action === 'created' ? 'bg-success/10' :
                        activity.action === 'updated' ? 'bg-warning/10' :
                        activity.action === 'deleted' ? 'bg-destructive/10' :
                        'bg-secondary/10'
                      }`}>
                        <div className={`${
                          activity.action === 'created' ? 'text-success' :
                          activity.action === 'updated' ? 'text-warning' :
                          activity.action === 'deleted' ? 'text-destructive' :
                          'text-secondary'
                        }`}>
                          {getActionIcon(activity.action)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-foreground flex items-center gap-2">
                              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                {activity.articleCode}
                              </span>
                              {activity.articleName}
                            </h4>
                            {activity.details && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.details}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={getActionVariant(activity.action)}>
                              {getActionText(activity.action)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecientesModule;