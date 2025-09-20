import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Package, TrendingUp, AlertCircle, Loader2, PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useState } from "react";
import { Article } from "@/types/inventory";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import ArticleForm from "./ArticleForm";

const InventarioModule = () => {
  const { articles, sections, loading, error, addArticle, updateArticle, deleteArticle } = useInventory();
  const [isAddArticleOpen, setIsAddArticleOpen] = useState(false);

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editForm, setEditForm] = useState<Article>({
    id: "",
    code: "",
    name: "",
    brand: "",
    units: 0,
    unitPrice: 0,
    totalValue: 0,
    detal: 0,
    mayor: 0,
    reference: "",
    description: "",
    section: "",
    createdAt: "",
    updatedAt: "",
  });

  const startEdit = (article: Article) => {
    setEditingArticle(article);
    setEditForm(article);
  };

  const saveEdit = async () => {
    if (!editingArticle) return;

    if (!editForm.name.trim()) {
      toast.error(
        <>
          <div className="font-bold">Error de validación</div>
          <div>El nombre del artículo es requerido.</div>
        </>
      );
      return;
    }

    if (editForm.units < 0) {
      toast.error(
        <>
          <div className="font-bold">Error de validación</div>
          <div>Las unidades no pueden ser negativas.</div>
        </>
      );
      return;
    }

    try {
      await updateArticle(editingArticle.id, editForm);
      toast.success(
        <>
          <div className="font-bold">Artículo actualizado</div>
          <div>{editForm.name} ha sido actualizado exitosamente</div>
        </>
      );
      setEditingArticle(null);
    } catch (error: any) {
      toast.error(
        <>
          <div className="font-bold">Error al actualizar</div>
          <div>{error.message}</div>
        </>
      );
    }
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setEditForm({
      id: "",
      code: "",
      name: "",
      brand: "",
      units: 0,
      price: 0,
      reference: "",
      description: "",
      section: "",
      createdAt: "",
      updatedAt: "",
    });
  };

  const handleDelete = async (article: Article) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${article.name}"?`)) {
      try {
        await deleteArticle(article.id);
        toast.success(
          <>
            <div className="font-bold">Artículo eliminado</div>
            <div>El artículo ha sido eliminado correctamente.</div>
          </>
        );
      } catch (error: any) {
        toast.error(
          <>
            <div className="font-bold">Error al eliminar</div>
            <div>{error.message}</div>
          </>
        );
      }
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
       <ArticleForm
        isOpen={isAddArticleOpen}
        onOpenChange={setIsAddArticleOpen}
        onSubmit={addArticle}
        sections={sections}
      />
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg"><Package className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventario Global</h1>
            <p className="text-muted-foreground">Vista consolidada de todos los artículos</p>
          </div>
        </div>
        <Button onClick={() => setIsAddArticleOpen(true)} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Añadir Artículo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Tipo de articulos</p><p className="text-2xl font-bold text-foreground">{sections.length}</p></div><div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg"><Package className="w-6 h-6 text-primary" /></div></div></CardContent></Card>
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
                <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Descripción</TableHead><TableHead>Sección</TableHead><TableHead className="text-right">Unidades</TableHead><TableHead className="text-right">Unit Price</TableHead><TableHead className="text-right">Total Value</TableHead><TableHead>Precio Detal</TableHead><TableHead>Precio Mayor</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                <TableBody>
                  {articles.map((article) => {
                    const stockStatus = article.units === 0 ? 'Sin Stock' : article.units <= 10 ? 'Stock Bajo' : 'Disponible';
                    const statusVariant = article.units === 0 ? 'destructive' : article.units <= 10 ? 'warning' : 'secondary';
                    return (
                      <TableRow key={article.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          {editingArticle?.id === article.id ? (
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="h-8"
                            />
                          ) : (
                            article.name
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {editingArticle?.id === article.id ? (
                            <Textarea
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              className="h-8 resize-none"
                            />
                          ) : (
                            article.description || '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {editingArticle?.id === article.id ? (
                            <Select
                              value={editForm.section}
                              onValueChange={(value) => setEditForm(prev => ({ ...prev, section: value }))}
                            >
                              <SelectTrigger className="h-8 w-[180px]">
                                <SelectValue placeholder="Selecciona una sección" />
                              </SelectTrigger>
                              <SelectContent>
                                {sections.map(section => (
                                  <SelectItem key={section.id} value={section.id}>
                                    {section.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline">{sections.find(s => s.id === article.section)?.name || 'N/A'}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {editingArticle?.id === article.id ? (
                            <Input
                              type="number"
                              value={editForm.units}
                              onChange={(e) => setEditForm(prev => ({ ...prev, units: parseInt(e.target.value) || 0 }))}
                              className="h-8 w-20"
                            />
                          ) : (
                            article.units
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {editingArticle?.id === article.id ? (
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={editForm.unitPrice}
                              onChange={(e) => setEditForm(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                              className="h-8 w-24 text-right"
                            />
                          ) : (
                            `${(article.unitPrice ?? 0).toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {editingArticle?.id === article.id ? (
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={editForm.totalValue}
                              onChange={(e) => setEditForm(prev => ({ ...prev, totalValue: parseFloat(e.target.value) || 0 }))}
                              className="h-8 w-24 text-right"
                            />
                          ) : (
                            `${(article.totalValue ?? 0).toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {editingArticle?.id === article.id ? (
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={editForm.detal}
                              onChange={(e) => setEditForm(prev => ({ ...prev, detal: parseFloat(e.target.value) || 0 }))}
                              className="h-8 w-24 text-right"
                            />
                          ) : (
                            `${(article.detal ?? 0).toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {editingArticle?.id === article.id ? (
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={editForm.mayor}
                              onChange={(e) => setEditForm(prev => ({ ...prev, mayor: parseFloat(e.target.value) || 0 }))}
                              className="h-8 w-24 text-right"
                            />
                          ) : (
                            `${(article.mayor ?? 0).toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell><Badge variant={statusVariant}>{stockStatus}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {editingArticle?.id === article.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={saveEdit}
                                  className="h-8 w-8 p-0"
                                >
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEdit}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEdit(article)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(article)}
                                  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
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
    </div>
  );
};

export default InventarioModule;
