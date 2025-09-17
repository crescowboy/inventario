"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Plus, Search, Edit, Trash2, Package, MoreHorizontal } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { formatCurrency, Article } from "@/types/inventory";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ArticleForm from "./ArticleForm"; 
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const SeccionesModule = () => {
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  const [showNewSectionDialog, setShowNewSectionDialog] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false); 
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null); 

  const { 
    sections, 
    articles, 
    addSection, 
    deleteSection, 
    addArticle, 
    updateArticle, 
    deleteArticle, 
    searchArticles 
  } = useInventory();
  
  const { toast } = useToast();

  const currentSection = sections.find(s => s.id === selectedSection);
  const sectionArticles = selectedSection 
    ? articles.filter(a => a.section === selectedSection)
    : [];
  
  const searchResults = searchQuery.trim() && selectedSection 
    ? searchArticles(searchQuery, selectedSection) 
    : sectionArticles;

  const handleCreateSection = () => {
    if (!newSectionName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la sección es requerido",
        variant: "destructive",
      });
      return;
    }

    addSection({
      name: newSectionName,
      description: newSectionDescription,
    });

    toast({
      title: "Sección creada",
      description: `La sección "${newSectionName}" ha sido creada exitosamente`,
    });

    setNewSectionName("");
    setNewSectionDescription("");
    setShowNewSectionDialog(false);
  };

  const handleAddNewArticle = () => {
    setSelectedArticle(null);
    setIsFormOpen(true);
  };

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsFormOpen(true);
  };

  const handleDeleteSection = (sectionId: string, sectionName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la sección "${sectionName}"?`)) {
      deleteSection(sectionId);
      if (selectedSection === sectionId) {
        setSelectedSection("");
      }
      toast({
        title: "Sección eliminada",
        description: `La sección "${sectionName}" ha sido eliminada`,
      });
    }
  };

  const handleDeleteArticle = async (articleId: string, articleName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el artículo "${articleName}"?`)) {
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
      toast({ title: "Artículo actualizado", description: "El artículo ha sido actualizado correctamente." });
    } else {
      // Es una creación
      await addArticle({ ...data, section: selectedSection });
      toast({ title: "Artículo agregado", description: "El artículo ha sido agregado correctamente." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
          <FolderOpen className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Secciones</h1>
          <p className="text-muted-foreground">Organiza tu inventario por categorías</p>
        </div>
      </div>

      {/* Section Selection and Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Secciones</span>
              <Dialog open={showNewSectionDialog} onOpenChange={setShowNewSectionDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8">
                    <Plus className="w-4 h-4 mr-1" />
                    Nueva
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Sección</DialogTitle>
                    <DialogDescription>
                      Agregar una nueva sección para organizar artículos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="section-name">Nombre de la Sección</Label>
                      <Input
                        id="section-name"
                        placeholder="Ej: Herramientas, Cables, Repuestos"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="section-description">Descripción (Opcional)</Label>
                      <Input
                        id="section-description"
                        placeholder="Descripción de la sección"
                        value={newSectionDescription}
                        onChange={(e) => setNewSectionDescription(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateSection} className="w-full">
                      Crear Sección
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.length === 0 ? (
              <div className="text-center py-4">
                <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No hay secciones creadas</p>
              </div>
            ) : (
              sections.map((section) => {
                const articleCount = articles.filter(a => a.sectionId === section.id).length;
                return (
                  <div
                    key={section.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedSection === section.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{section.name}</h4>
                        {section.description && (
                          <p className="text-xs text-muted-foreground">{section.description}</p>
                        )}
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {articleCount} artículos
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id, section.name);
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {!selectedSection ? (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Selecciona una sección</h3>
                  <p className="text-muted-foreground">
                    Elige una sección de la lista para ver y gestionar sus artículos.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Section Header */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{currentSection?.name}</span>
                    <Button size="sm" onClick={handleAddNewArticle}>
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar Artículo
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {currentSection?.description || 'Gestiona los artículos de esta sección'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar en esta sección..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Articles Table */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Artículos</span>
                    <Badge variant="secondary">{searchResults.length} encontrados</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {sectionArticles.length === 0 ? 'No hay artículos' : 'No se encontraron resultados'}
                      </h3>
                      <p className="text-muted-foreground">
                        {sectionArticles.length === 0 
                          ? 'Agrega artículos a esta sección usando el botón "Agregar Artículo"'
                          : 'Intenta con otros términos de búsqueda'
                        }
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
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead>Referencia</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.map((article) => (
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
                                <Badge variant={article.units > 0 ? "secondary" : "destructive"}>
                                  {article.units}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {formatCurrency(article.price)}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {article.reference || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditArticle(article)} className="gap-2"><Edit className="w-4 h-4"/> Editar</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDeleteArticle(article.id, article.name)} className="gap-2 text-destructive focus:text-destructive"><Trash2 className="w-4 h-4"/> Eliminar</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

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

export default SeccionesModule;