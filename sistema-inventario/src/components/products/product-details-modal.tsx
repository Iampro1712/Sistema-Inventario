"use client";

import { useState } from "react";
import { Eye, Package, Tag, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  category?: {
    id: string;
    name: string;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductDetailsModalProps {
  product: Product;
}

export function ProductDetailsModal({ product }: ProductDetailsModalProps) {
  const [open, setOpen] = useState(false);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) {
      return { variant: "destructive" as const, text: "Sin Stock", color: "text-red-600" };
    } else if (stock <= minStock) {
      return { variant: "secondary" as const, text: "Stock Bajo", color: "text-orange-600" };
    } else {
      return { variant: "outline" as const, text: "En Stock", color: "text-green-600" };
    }
  };

  const stockStatus = getStockStatus(product.stock, product.minStock);
  const margin = ((product.price - product.cost) / product.price * 100).toFixed(1);
  const totalValue = product.stock * product.price;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Ver detalles">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalles del Producto
          </DialogTitle>
          <DialogDescription>
            Información completa del producto en el inventario
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              {product.description && (
                <p className="text-muted-foreground mt-1">{product.description}</p>
              )}
            </div>
            <div className="text-right">
              <Badge variant={stockStatus.variant} className="mb-2">
                {stockStatus.text}
              </Badge>
              {product.category && (
                <div>
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: product.category.color,
                      color: product.category.color 
                    }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {product.category.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* SKU */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SKU</span>
              <code className="bg-background px-2 py-1 rounded text-sm">
                {product.sku}
              </code>
            </div>
          </div>

          {/* Información financiera */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Precio de Venta</span>
                <span className="font-semibold text-green-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Costo</span>
                <span className="font-medium">
                  ${product.cost.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Margen</span>
                <span className="font-medium text-blue-600">
                  {margin}%
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stock Actual</span>
                <span className={`font-semibold ${stockStatus.color}`}>
                  {product.stock} unidades
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stock Mínimo</span>
                <span className="font-medium">
                  {product.minStock} unidades
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor Total</span>
                <span className="font-semibold text-purple-600">
                  ${totalValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progreso de stock */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Nivel de Stock</span>
              <span className="text-sm text-muted-foreground">
                {product.stock} / {Math.max(product.minStock * 3, 20)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  product.stock === 0 ? 'bg-red-500' :
                  product.stock <= product.minStock ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min((product.stock / Math.max(product.minStock * 3, 20)) * 100, 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Creado</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(product.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Actualizado</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(product.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <DollarSign className="h-6 w-6 mx-auto text-green-500 mb-1" />
              <p className="text-sm font-medium">Ganancia/Unidad</p>
              <p className="text-lg font-bold text-green-600">
                ${(product.price - product.cost).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <Package className="h-6 w-6 mx-auto text-blue-500 mb-1" />
              <p className="text-sm font-medium">Rotación</p>
              <p className="text-lg font-bold text-blue-600">
                {product.stock > product.minStock ? 'Alta' : 'Baja'}
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto text-purple-500 mb-1" />
              <p className="text-sm font-medium">Estado</p>
              <p className="text-lg font-bold text-purple-600">
                {product.stock > 0 ? 'Activo' : 'Agotado'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
