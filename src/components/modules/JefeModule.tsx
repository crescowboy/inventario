import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Crown, Upload, Edit, Trash2, Plus, Save, X } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { formatCurrency, Article } from "@/types/inventory";
import { useToast } from "@/hooks/use-toast";

const JefeModule = () => {
  const [bulkData, setBulkData] = useState("");
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    brand: "",
    units: 0,
    price: 0,
    reference: "",
    section: "", // <-- agrega aquí
  });

  const { articles, bulkAddArticles, updateArticle, deleteArticle } = useInventory();
  const { toast } = useToast();

  const handleBulkUpload = () => {
    if (!bulkData.trim()) {
      toast({
        title: "Error",
        description: "Ingresa los datos de los artículos",
        variant: "destructive",
      });
      return;
    }

    try {
      const { addedArticles, updatedArticles } = bulkAddArticles(bulkData);
      
      toast({
        title: "Carga masiva completada",
        description: `${addedArticles.length} artículos agregados, ${updatedArticles.length} actualizados`,
      });

      setBulkData("");
    } catch (error) {
      toast({
        title: "Error en carga masiva",
        description: "Verifica el formato de los datos",
        variant: "destructive",
      });
    }
  };

  const startEdit = (article: Article) => {
    setEditingArticle(article);
    setEditForm({
      code: article.code,
      name: article.name,
      brand: article.brand,
      units: article.units,
      price: article.price,
      reference: article.reference,
      section: article.section,
    });
  };

  const saveEdit = () => {
    if (!editingArticle) return;

    if (!editForm.name.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre del artículo es requerido.",
        variant: "destructive",
      });
      return;
    }

    if (editForm.units <= 0) {
      toast({
        title: "Error de validación",
        description: "Las unidades deben ser mayores a 0.",
        variant: "destructive",
      });
      return;
    }

    updateArticle(editingArticle.id, {
      ...editForm,
      stock: editForm.units, // <-- este cambio es clave
    });

    toast({
      title: "Artículo actualizado",
      description: `${editForm.name} ha sido actualizado exitosamente`,
    });

    setEditingArticle(null);
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setEditForm({
      code: "",
      name: "",
      brand: "",
      units: 0,
      price: 0,
      reference: "",
      section: "", // <-- agrega aquí también
    });
  };

  const handleDelete = (article: Article) => {
    if (window.confirm(`¿Estás seguro de eliminar "${article.name}"?`)) {
      deleteArticle(article.id);
      toast({
        title: "Artículo eliminado",
        description: `${article.name} ha sido eliminado del inventario`,
      });
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
            Carga múltiples artículos separados por líneas. Formato: Código, Nombre, Marca, Unidades, Precio, Referencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bulk-data">Datos de Artículos</Label>
            <Textarea
              id="bulk-data"
              placeholder={`Ejemplo:
001, Martillo Profesional, STANLEY, 15, 25000, HM-001
002, Destornillador Phillips, BAHCO, 8, 12000, DS-PH-002
003, Cable UTP Cat6, PANDUIT, 100, 2500, CAT6-UTP`}
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="min-h-32 font-mono text-sm"
            />
          </div>
          <Button 
            onClick={handleBulkUpload}
            className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
          >
            <Upload className="w-4 h-4 mr-2" />
            Procesar Carga Masiva
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
                  <TableHead className="text-right">Precio</TableHead>
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
                          value={editForm.price}
                          onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          className="h-8 w-24"
                        />
                      ) : (
                        <span className="font-mono">{formatCurrency(article.price)}</span>
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
                              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
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
    </div>
  );
};

export default JefeModule;