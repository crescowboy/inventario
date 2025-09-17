import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Package, TrendingUp, AlertCircle, Loader2, PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useState } from "react";
import ArticleForm from "./ArticleForm"; // Importamos el formulario
import { Article } from "@/types/inventory";
import { useToast } from "@/hooks/use-toast";

const InventarioModule = () => {
  const { articles, sections, loading, error, addArticle, updateArticle, deleteArticle } = useInventory();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { toast } = useToast();

  const handleAddNew = () => {
    setSelectedArticle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setIsFormOpen(true);
  };

  const handleDelete = async (articleId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      try {
        await deleteArticle(articleId);
        toast({ title: "Artículo eliminado", description: "El artículo ha sido eliminado correctamente." });
      } catch (error: any) {
        toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedArticle) {
      // Es una edición
      await updateArticle(selectedArticle.id, data);
    } else {
      // Es una creación
      await addArticle(data);
    }
  };

  const totalItems = articles.reduce((sum, article) => sum + article.units, 0);
  const lowStockItems = articles.filter(article => article.units <= 10).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">Cargando inventario...</p></div>;
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg"><AlertCircle className="w-8 h-8 text-destructive" /><p className="mt-4 text-destructive">Error al cargar el inventario</p><p className="text-sm text-muted-foreground">{error.message}</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg"><Package className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventario Global</h1>
            <p className="text-muted-foreground">Vista consolidada de todos los artículos</p>
          </div>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Añadir Artículo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Tipos de Artículos</p><p className="text-2xl font-bold text-foreground">{articles.length}</p></div><div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg"><Package className="w-6 h-6 text-primary" /></div></div></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Unidades</p><p className="text-2xl font-bold text-foreground">{totalItems.toLocaleString()}</p></div><div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg"><TrendingUp className="w-6 h-6 text-secondary" /></div></div></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Artículos con Stock Bajo</p><p className="text-2xl font-bold text-warning">{lowStockItems}</p></div><div className="flex items-center justify-center w-12 h-12 bg-warning/10 rounded-lg"><AlertCircle className="w-6 h-6 text-warning" /></div></div></CardContent></Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between"><span>Todos los Artículos</span><Badge variant="secondary">{articles.length} registros</Badge></CardTitle>
          <CardDescription>Vista completa de todos los artículos en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="text-center py-12"><Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" /><h3 className="text-lg font-medium text-foreground mb-2">Inventario vacío</h3><p className="text-muted-foreground">No hay artículos para mostrar. Haz clic en "Añadir Artículo" para empezar.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Descripción</TableHead><TableHead>Sección</TableHead><TableHead className="text-right">Unidades</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                <TableBody>
                  {articles.map((article) => {
                    const stockStatus = article.units === 0 ? 'Sin Stock' : article.units <= 10 ? 'Stock Bajo' : 'Disponible';
                    const statusVariant = article.units === 0 ? 'destructive' : article.units <= 10 ? 'warning' : 'secondary';
                    return (
                      <TableRow key={article.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{article.name}</TableCell>
                        <TableCell className="text-muted-foreground">{article.description || '-'}</TableCell>
                        <TableCell><Badge variant="outline">{sections.find(s => s.id === article.section)?.name || 'N/A'}</Badge></TableCell>
                        <TableCell className="text-right font-mono font-bold">{article.units}</TableCell>
                        <TableCell><Badge variant={statusVariant}>{stockStatus}</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(article)} className="gap-2"><Edit className="w-4 h-4"/> Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(article.id)} className="gap-2 text-destructive focus:text-destructive"><Trash2 className="w-4 h-4"/> Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <ArticleForm 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleFormSubmit} 
        initialData={selectedArticle} 
        sections={sections}
      />
    </div>
  );
};

export default InventarioModule;