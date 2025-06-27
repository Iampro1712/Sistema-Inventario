"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
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
  color: string;
}

interface ProductFormData {
  nombre: string;
  descripcion: string;
  sku: string;
  precio: string;
  costo: string;
  stock: string;
  stockMinimo: string;
  categoriaId: string;
}

interface ProductFormModalProps {
  onProductCreated?: () => void;
}

export function ProductFormModal({ onProductCreated }: ProductFormModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: "",
    descripcion: "",
    sku: "",
    precio: "",
    costo: "",
    stock: "",
    stockMinimo: "5",
    categoriaId: "",
  });

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categorias');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/productos', formData);

      if (response.ok) {
        // Resetear formulario
        setFormData({
          nombre: "",
          descripcion: "",
          sku: "",
          precio: "",
          costo: "",
          stock: "",
          stockMinimo: "5",
          categoriaId: "",
        });
        setOpen(false);
        onProductCreated?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear producto');
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nuevo Producto</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Producto</DialogTitle>
          <DialogDescription>
            Completa la información del producto para agregarlo al inventario.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre *</label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">SKU *</label>
              <Input
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="Código único"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Input
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción del producto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Precio *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => handleInputChange('precio', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Costo *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => handleInputChange('costo', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Stock Inicial *</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Stock Mínimo</label>
              <Input
                type="number"
                value={formData.stockMinimo}
                onChange={(e) => handleInputChange('stockMinimo', e.target.value)}
                placeholder="5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={formData.categoriaId}
              onChange={(e) => handleInputChange('categoriaId', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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
              Crear Producto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
