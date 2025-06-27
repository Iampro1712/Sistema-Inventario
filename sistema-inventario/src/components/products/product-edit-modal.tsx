"use client";

import { useState, useEffect } from "react";
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

interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface ProductEditModalProps {
  product: Product;
  onProductUpdated?: () => void;
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

export function ProductEditModal({ product, onProductUpdated }: ProductEditModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: product.name,
    descripcion: product.description || "",
    sku: product.sku,
    precio: product.price.toString(),
    costo: product.cost.toString(),
    stock: product.stock.toString(),
    stockMinimo: product.minStock.toString(),
    categoriaId: product.categoryId || "",
  });

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categorias');
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
      const response = await fetch(`/api/productos/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setOpen(false);
        onProductUpdated?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al actualizar producto');
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('Error al actualizar producto');
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Resetear formulario con datos actuales del producto
      setFormData({
        nombre: product.name,
        descripcion: product.description || "",
        sku: product.sku,
        precio: product.price.toString(),
        costo: product.cost.toString(),
        stock: product.stock.toString(),
        stockMinimo: product.minStock.toString(),
        categoriaId: product.categoryId || "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Editar producto">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modifica la información del producto "{product.name}".
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
              <label className="text-sm font-medium">Stock Actual *</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="0"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Stock actual: {product.stock} unidades
              </p>
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

          {/* Información adicional */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Información Actual</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <p>Margen actual: {(((product.price - product.cost) / product.price) * 100).toFixed(1)}%</p>
                <p>Valor en stock: ${(product.stock * product.price).toFixed(2)}</p>
              </div>
              <div>
                <p>Categoría: {product.category?.name || 'Sin categoría'}</p>
                <p>Creado: {new Date(product.createdAt || '').toLocaleDateString()}</p>
              </div>
            </div>
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
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
