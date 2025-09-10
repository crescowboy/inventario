import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { formatCurrency } from "@/types/inventory";

const InventarioModule = () => {
  const { articles } = useInventory();

  const totalValue = articles.reduce((sum, article) => sum + (article.price * article.units), 0);
  const totalItems = articles.reduce((sum, article) => sum + article.units, 0);
  const lowStockItems = articles.filter(article => article.units <= 5).length;
  const outOfStockItems = articles.filter(article => article.units === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario Global</h1>
          <p className="text-muted-foreground">Vista consolidada de todos los artículos</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Artículos</p>
                <p className="text-2xl font-bold text-foreground">{articles.length}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Unidades</p>
                <p className="text-2xl font-bold text-foreground">{totalItems.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Bajo</p>
                <p className="text-2xl font-bold text-warning">{lowStockItems}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-warning/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Todos los Artículos</span>
            <Badge variant="secondary">{articles.length} registros</Badge>
          </CardTitle>
          <CardDescription>
            Vista completa de todos los artículos en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">Inventario vacío</h3>
              <p className="text-muted-foreground">
                No hay artículos en el inventario. Utiliza el módulo Jefe para agregar artículos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => {
                    const stockStatus = article.units === 0 ? 'Sin Stock' : 
                                      article.units <= 5 ? 'Stock Bajo' : 'Disponible';
                    const statusVariant = article.units === 0 ? 'destructive' : 
                                        article.units <= 5 ? 'warning' : 'secondary';

                    return (
                      <TableRow key={article.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono font-medium">
                          {article.code}
                        </TableCell>
                        <TableCell className="font-medium">
                          {article.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{article.brand}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={statusVariant}
                            className="font-mono"
                          >
                            {article.units}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(article.price)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(article.price * article.units)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {article.reference || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant}>
                            {stockStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <Card className="shadow-sm border-warning/20 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              Alerta de Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Hay <strong>{lowStockItems}</strong> artículos con stock bajo (≤5 unidades) y{' '}
              <strong>{outOfStockItems}</strong> sin stock. Considera realizar un pedido de reposición.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventarioModule;