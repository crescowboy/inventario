"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Package, AlertCircle } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { formatCurrency } from "@/types/inventory";

const EmpleadoModule = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { searchArticles } = useInventory();
  
  const searchResults = searchQuery.trim() ? searchArticles(searchQuery) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
          <Search className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Módulo Empleado</h1>
          <p className="text-muted-foreground">Búsqueda rápida de artículos en inventario</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Búsqueda de Artículos
          </CardTitle>
          <CardDescription>
            Busca artículos por código, nombre, marca o referencia. Soporta coincidencias parciales y abreviaturas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nombre, marca o referencia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 transition-all duration-200 focus:scale-[1.02]"
            />
          </div>
        </CardContent>
      </Card>

      {searchQuery.trim() && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              Resultados de búsqueda
              <Badge variant="secondary" className="ml-2">
                {searchResults.length} encontrados
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron resultados</h3>
                <p className="text-muted-foreground">
                  Intenta con otros términos de búsqueda o verifica la ortografía.
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
                      <TableHead className="text-right">Precio Unidad</TableHead>
                      <TableHead>Referencia</TableHead>
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
                          <Badge 
                            variant={article.units > 0 ? "secondary" : "destructive"}
                            className="font-mono"
                          >
                            {article.units}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(article.unitPrice)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {article.reference || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!searchQuery.trim() && (
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">Comienza a buscar</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ingresa el código, nombre, marca o referencia del artículo que estás buscando.
                También puedes usar abreviaturas como "cb" para "cable".
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmpleadoModule;