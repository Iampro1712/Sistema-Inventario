"use client";

import { useState } from "react";
import { Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  _count: {
    products: number;
  };
}

interface CategoryEditModalProps {
  category: Category;
  onCategoryUpdated?: () => void;
}

interface CategoryFormData {
  nombre: string;
  descripcion: string;
  color: string;
}

const colorOptions = [
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#10B981" },
  { name: "Amarillo", value: "#F59E0B" },
  { name: "Rojo", value: "#EF4444" },
  { name: "Púrpura", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Índigo", value: "#6366F1" },
  { name: "Gris", value: "#6B7280" },
  { name: "Naranja", value: "#FF5722" },
  { name: "Cian", value: "#06B6D4" },
  { name: "Lima", value: "#84CC16" },
  { name: "Ámbar", value: "#F59E0B" },
];

export function CategoryEditModal({ category, onCategoryUpdated }: CategoryEditModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    nombre: category.name,
    descripcion: category.description || "",
    color: category.color,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/categorias/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setOpen(false);
        onCategoryUpdated?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al actualizar categoría');
      }
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      alert('Error al actualizar categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Resetear formulario con datos actuales de la categoría
      setFormData({
        nombre: category.name,
        descripcion: category.description || "",
        color: category.color,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Editar categoría">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>
            Modifica la información de la categoría "{category.name}".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre *</label>
            <Input
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Nombre de la categoría"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Input
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción de la categoría"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Color</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange('color', color.value)}
                  className={`w-full h-10 rounded-md border-2 transition-all ${
                    formData.color === color.value
                      ? 'border-primary scale-105 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {formData.color === color.value && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Color seleccionado:</span>
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: formData.color }}
              />
              <code className="text-xs bg-muted px-1 rounded">{formData.color}</code>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Información Actual</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <p>Productos asociados: {category._count.products}</p>
                <p>Estado: {category._count.products > 0 ? 'Activa' : 'Sin productos'}</p>
              </div>
              <div>
                <p>Color actual: {category.color}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span>Vista:</span>
                  <div 
                    className="w-3 h-3 rounded border"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advertencia si tiene productos */}
          {category._count.products > 0 && (
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
              <p className="text-sm text-orange-800">
                ⚠️ Esta categoría tiene {category._count.products} producto(s) asociado(s). 
                Los cambios se aplicarán a todos los productos de esta categoría.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
