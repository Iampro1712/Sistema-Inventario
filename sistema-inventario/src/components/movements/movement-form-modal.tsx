"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Package, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
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

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  category?: {
    name: string;
    color: string;
  };
}

interface MovementFormData {
  type: string;
  quantity: string;
  reason: string;
  productId: string;
  reference: string;
  notes: string;
}

interface MovementFormModalProps {
  onMovementCreated?: () => void;
}

export function MovementFormModal({ onMovementCreated }: MovementFormModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<MovementFormData>({
    type: 'IN',
    quantity: '',
    reason: '',
    productId: '',
    reference: '',
    notes: '',
  });

  // Cargar productos al abrir el modal
  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/productos');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/movimientos', formData);

      if (response.ok) {
        // Resetear formulario
        setFormData({
          type: 'IN',
          quantity: '',
          reason: '',
          productId: '',
          reference: '',
          notes: '',
        });
        setSelectedProduct(null);
        setOpen(false);
        onMovementCreated?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear movimiento');
      }
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      alert('Error al crear movimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof MovementFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si se selecciona un producto, actualizar la información
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      setSelectedProduct(product || null);
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'ADJUSTMENT':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'border-green-500 bg-green-50';
      case 'OUT':
        return 'border-red-500 bg-red-50';
      case 'ADJUSTMENT':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getReasonSuggestions = (type: string) => {
    switch (type) {
      case 'IN':
        return ['Compra', 'Devolución', 'Producción', 'Transferencia entrada', 'Corrección inventario'];
      case 'OUT':
        return ['Venta', 'Devolución proveedor', 'Uso interno', 'Transferencia salida', 'Producto dañado'];
      case 'ADJUSTMENT':
        return ['Ajuste inventario', 'Corrección error', 'Conteo físico', 'Merma', 'Reconciliación'];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nuevo Movimiento</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Movimiento</DialogTitle>
          <DialogDescription>
            Registra un movimiento de inventario para actualizar el stock.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de movimiento */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Movimiento *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'IN', label: 'Entrada', icon: TrendingUp, color: 'text-green-600' },
                { value: 'OUT', label: 'Salida', icon: TrendingDown, color: 'text-red-600' },
                { value: 'ADJUSTMENT', label: 'Ajuste', icon: RotateCcw, color: 'text-blue-600' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('type', type.value)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    formData.type === type.value
                      ? getMovementTypeColor(type.value)
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <type.icon className={`h-5 w-5 ${type.color}`} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Producto */}
          <div>
            <label className="text-sm font-medium">Producto *</label>
            <select
              value={formData.productId}
              onChange={(e) => handleInputChange('productId', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
              required
            >
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku}) - Stock: {product.stock}
                </option>
              ))}
            </select>
            
            {selectedProduct && (
              <div className="mt-2 p-2 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{selectedProduct.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {selectedProduct.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Stock: {selectedProduct.stock}</p>
                    {selectedProduct.category && (
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: selectedProduct.category.color,
                          color: selectedProduct.category.color 
                        }}
                        className="text-xs"
                      >
                        {selectedProduct.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="text-sm font-medium">
              Cantidad * 
              {formData.type === 'ADJUSTMENT' && (
                <span className="text-xs text-muted-foreground ml-1">
                  (Stock final deseado)
                </span>
              )}
            </label>
            <Input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder={formData.type === 'ADJUSTMENT' ? 'Stock final' : 'Cantidad'}
              required
            />
            {formData.type === 'OUT' && selectedProduct && parseInt(formData.quantity) > selectedProduct.stock && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ La cantidad excede el stock disponible ({selectedProduct.stock})
              </p>
            )}
          </div>

          {/* Razón */}
          <div>
            <label className="text-sm font-medium">Razón *</label>
            <Input
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Motivo del movimiento"
              required
            />
              {getReasonSuggestions(formData.type).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {getReasonSuggestions(formData.type).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleInputChange('reason', suggestion)}
                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Referencia y Notas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Referencia</label>
              <Input
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                placeholder="Número de orden, factura, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notas</label>
              <Input
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notas adicionales"
              />
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
              {getMovementTypeIcon(formData.type)}
              <span className="ml-2">Crear Movimiento</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
