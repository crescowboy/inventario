import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Article } from "@/types/inventory";
import { useToast } from "@/hooks/use-toast";

interface ArticleFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: any) => Promise<any>;
  initialData?: Article | null;
  sections: { id: string; name: string }[]; // Añadir prop para las secciones
  defaultSectionId?: string; // Nueva prop para la sección por defecto
}

const ArticleForm = ({ isOpen, onOpenChange, onSubmit, initialData, sections = [], defaultSectionId }: ArticleFormProps) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    brand: '',
    units: 0,
    price: 0,
    reference: '',
    description: '',
    section: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        brand: initialData.brand || '',
        units: initialData.units || 0,
        price: initialData.price || 0,
        reference: initialData.reference || '',
        description: initialData.description || '',
        section: initialData.section || '',
      });
    } else {
      // Reset form for new article, setting defaultSectionId if provided
      setFormData({
        code: '',
        name: '',
        brand: '',
        units: 0,
        price: 0,
        reference: '',
        description: '',
        section: defaultSectionId || '',
      });
    }
  }, [initialData, isEditMode, isOpen, defaultSectionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSectionChange = (value: string) => {
    setFormData(prev => ({ ...prev, section: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSubmit = {
      ...formData,
      price: parseFloat(String(formData.price).replace(',', '.')) || 0,
    };

    try {
      if (isEditMode && initialData) {
        await onSubmit({ ...dataToSubmit, id: initialData.id });
      } else {
        await onSubmit(dataToSubmit);
      }
      toast({
        title: `Artículo ${isEditMode ? 'actualizado' : 'creado'}`,
        description: `El artículo "${formData.name}" se ha guardado correctamente.`,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error.message || "Ocurrió un problema al guardar el artículo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Artículo' : 'Añadir Nuevo Artículo'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Modifica los detalles del artículo.' : 'Rellena los campos para crear un nuevo artículo.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input id="code" name="code" value={formData.code} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Artículo</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca (Opcional)</Label>
              <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Referencia (Opcional)</Label>
              <Input id="reference" name="reference" value={formData.reference} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Input id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section">Sección</Label>
            <Select onValueChange={handleSectionChange} value={formData.section}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una sección" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="units">Unidades</Label>
              <Input id="units" name="units" type="number" value={formData.units} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input id="price" name="price" type="text" inputMode="decimal" value={formData.price} onChange={handleChange} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleForm;
