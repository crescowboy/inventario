import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Crown, Upload, Edit, Trash2, Plus, Save, X, Loader2 } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { formatCurrency, Article } from "@/types/inventory";
import { toast } from "sonner"; // o desde tu wrapper de shadcn/ui

const JefeModule = () => {
  const [bulkData, setBulkData] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    brand: "",
    units: 0,
    unitPrice: 0,
    detal: 0,
    mayor: 0,
    reference: "",
    section: "",
  });

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { articles, updateArticle, deleteArticle, refetch, loading: inventoryLoading } = useInventory();

  if (inventoryLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Cargando módulo de jefe...</p>
      </div>
    );
  }

  const handleBulkUpload = async () => {
    if (!bulkData.trim()) {
      toast.error("La caja de texto está vacía.");
      return;
    }
    setLoading(true);

    try {
      const lines = bulkData.trim().split('\n');
      const articlesToUpload = lines.map(line => {
        if (!line.trim()) return null;
        const [code, name, brand, units, price, detal, mayor, reference, section] = line.split(',').map(s => s.trim());
        if (!code || !name || !units || !price || !section || !detal || !mayor) {
          throw new Error(`Línea inválida: "${line}". Faltan campos requeridos.`);
        }
        const parsedUnits = parseInt(units);
        const parsedPrice = parseFloat(price);
        const parsedDetal = parseFloat(detal);
        const parsedMayor = parseFloat(mayor);

        if (isNaN(parsedUnits) || isNaN(parsedPrice) || isNaN(parsedDetal) || isNaN(parsedMayor)) {
          throw new Error(`Valores no numéricos en línea: "${line}".`);
        }
        return { code, name, brand, units: parsedUnits, unitPrice: parsedPrice, detal: parsedDetal, mayor: parsedMayor, reference, section };
      }).filter(Boolean);

      if (articlesToUpload.length === 0) {
        throw new Error("No se encontraron artículos válidos para cargar.");
      }

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articlesToUpload),
      });

      let description = "Error en el servidor.";
      let result: any = {};

      try {
        result = await response.json();
        description = result.message || description;
        if (result.errors && result.errors.length > 0) {
          const errorDetails = result.errors.map((e: any) => `• ${e.code}: ${e.error}`).join('\n');
          description += `\n\nDetalles:\n${errorDetails}`;
        }
      } catch (e) {
        // Si no se puede parsear JSON, deja description como está
      }

      if (!response.ok || (result.errors && result.errors.length > 0)) {
        toast.error(description);
        setLoading(false);
        return;
      }

      toast.success(description);
      setBulkData("");
      refetch();

    } catch (error: any) {
      toast.error(error.message || "Error en Carga Masiva");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (article: Article) => {
    setEditingArticle(article);
    setEditForm({
      code: article.code,
      name: article.name,
      brand: article.brand,
      units: article.units,
      unitPrice: article.unitPrice,
      detal: article.detal,
      mayor: article.mayor,
      reference: article.reference,
      section: article.section,
    });
  };

  const saveEdit = () => {
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

    if (editForm.units <= 0) {
      toast.error(
        <>
          <div className="font-bold">Error de validación</div>
          <div>Las unidades deben ser mayores a 0.</div>
        </>
      );
      return;
    }

    updateArticle(editingArticle.id, editForm);

    toast.success(
      <>
        <div className="font-bold">Artículo actualizado</div>
        <div>{editForm.name} ha sido actualizado exitosamente</div>
      </>
    );

    setEditingArticle(null);
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setEditForm({
      code: "",
      name: "",
      brand: "",
      units: 0,
      unitPrice: 0,
      detal: 0,
      mayor: 0,
      reference: "",
      section: "",
    });
  };

  const handleDelete = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (articleToDelete) {
      setIsDeleting(true);
      try {
        await deleteArticle(articleToDelete.id);
        toast.success(
          <>
            <div className="font-bold">Artículo eliminado</div>
            <div>{articleToDelete.name} ha sido eliminado del inventario</div>
          </>
        );
        setDeleteDialogOpen(false);
        setArticleToDelete(null);
      } catch (error) {
        toast.error("Error al eliminar el artículo.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-lg">
          <Crown className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Módulo Jefe</h1>
          <p className="text-muted-foreground">Gestión avanzada y carga masiva de artículos</p>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Carga Masiva de Artículos
          </CardTitle>
          <CardDescription>
            Carga múltiples artículos separados por líneas. Formato: Código, Nombre, Marca, Unidades, Precio, Detal, Mayor, Referencia, Sección
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bulk-data">Datos de Artículos</Label>
            <Textarea
              id="bulk-data"
              placeholder={`Ejemplo:
TAL-001,Taladro Percutor,DeWalt,15,120.50,130.00,125.00,DW508S,Herramientas Eléctricas
MAR-005,Martillo Carpintero,Stanley,35,25.00,28.00,26.00,51-163,Herramientas Manuales
`}
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="min-h-32 font-mono text-sm"
            />
          </div>
          <Button 
            onClick={handleBulkUpload}
            className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Procesar Carga Masiva
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Articles Management */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Gestión de Artículos
            </CardTitle>
            <CardDescription>
              Edita o elimina artículos existentes
            </CardDescription>
          </div>
          <Badge variant="secondary">{articles.length} artículos</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Precio Unidad</TableHead>
                  <TableHead className="text-right">Detal</TableHead>
                  <TableHead className="text-right">Mayor</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono font-medium">
                      {editingArticle?.id === article.id ? (
                        <Input
                          value={editForm.code}
                          onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                          className="h-8"
                        />
                      ) : (
                        article.code
                      )}
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
                      {editingArticle?.id === article.id ? (
                        <Input
                          value={editForm.brand}
                          onChange={(e) => setEditForm(prev => ({ ...prev, brand: e.target.value }))}
                          className="h-8"
                        />
                      ) : (
                        <Badge variant="outline">{article.brand}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingArticle?.id === article.id ? (
                        <Input
                          type="number"
                          value={editForm.units}
                          onChange={(e) => setEditForm(prev => ({ ...prev, units: parseInt(e.target.value) || 0 }))}
                          className="h-8 w-20"
                        />
                      ) : (
                        <Badge variant={article.units > 0 ? "secondary" : "destructive"}>
                          {article.units}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingArticle?.id === article.id ? (
                        <Input
                          type="number"
                          value={editForm.unitPrice}
                          onChange={(e) => setEditForm(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                          className="h-8 w-24"
                        />
                      ) : (
                        <span className="font-mono">{formatCurrency(article.unitPrice)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingArticle?.id === article.id ? (
                        <Input
                          type="number"
                          value={editForm.detal}
                          onChange={(e) => setEditForm(prev => ({ ...prev, detal: parseFloat(e.target.value) || 0 }))}
                          className="h-8 w-24"
                        />
                      ) : (
                        <span className="font-mono">{formatCurrency(article.detal)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingArticle?.id === article.id ? (
                        <Input
                          type="number"
                          value={editForm.mayor}
                          onChange={(e) => setEditForm(prev => ({ ...prev, mayor: parseFloat(e.target.value) || 0 }))}
                          className="h-8 w-24"
                        />
                      ) : (
                        <span className="font-mono">{formatCurrency(article.mayor)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingArticle?.id === article.id ? (
                        <Input
                          value={editForm.reference}
                          onChange={(e) => setEditForm(prev => ({ ...prev, reference: e.target.value }))}
                          className="h-8"
                        />
                      ) : (
                        article.reference || '-'
                      )}
                    </TableCell>
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
                              className="h-8 w-8 p-0 hover:bg-destructive hover:text-white"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {articles.length === 0 && (
              <div className="text-center py-8">
                <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No hay artículos</h3>
                <p className="text-muted-foreground">
                  Utiliza la carga masiva para agregar artículos al inventario.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el artículo "{articleToDelete?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JefeModule;