"use client";

import { useState } from "react";
import { Eye, Tag, Package, Calendar, Palette } from "lucide-react";
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

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  _count: {
    products: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryDetailsModalProps {
  category: Category;
}

export function CategoryDetailsModal({ category }: CategoryDetailsModalProps) {
  const [open, setOpen] = useState(false);

  const getActivityLevel = (productCount: number) => {
    if (productCount === 0) return { text: "Sin actividad", color: "text-gray-500" };
    if (productCount <= 2) return { text: "Baja actividad", color: "text-orange-500" };
    if (productCount <= 5) return { text: "Actividad media", color: "text-blue-500" };
    return { text: "Alta actividad", color: "text-green-500" };
  };

  const activity = getActivityLevel(category._count.products);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Ver detalles">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Detalles de la Categoría
          </DialogTitle>
          <DialogDescription>
            Información completa de la categoría "{category.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información básica */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-xl">{category.name}</h3>
              {category.description && (
                <p className="text-muted-foreground mt-1">{category.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: category.color }}
                title={`Color: ${category.color}`}
              />
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: category.color,
                  color: category.color 
                }}
              >
                {category.name}
              </Badge>
            </div>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Productos</span>
              </div>
              <p className="text-2xl font-bold">{category._count.products}</p>
              <p className="text-sm text-muted-foreground">
                {category._count.products === 1 ? 'producto' : 'productos'} en esta categoría
              </p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Actividad</span>
              </div>
              <p className={`text-lg font-bold ${activity.color}`}>
                {activity.text}
              </p>
              <p className="text-sm text-muted-foreground">
                Basado en cantidad de productos
              </p>
            </div>
          </div>

          {/* Información del color */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-5 w-5 text-pink-500" />
              <span className="font-medium">Información del Color</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Código de Color</p>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  {category.color}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Vista previa:</span>
                <div 
                  className="w-12 h-8 rounded border-2 border-white shadow-sm"
                  style={{ backgroundColor: category.color }}
                />
              </div>
            </div>
          </div>

          {/* Barra de progreso de uso */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Nivel de Uso</span>
              <span className="text-sm text-muted-foreground">
                {category._count.products} / 10 productos
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: category.color,
                  width: `${Math.min((category._count.products / 10) * 100, 100)}%`,
                  opacity: 0.8
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Porcentaje de uso basado en 10 productos máximo por categoría
            </p>
          </div>

          {/* Fechas */}
          {(category.createdAt || category.updatedAt) && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {category.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Creada</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(category.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
              {category.updatedAt && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Actualizada</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(category.updatedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Métricas adicionales */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <Package className="h-6 w-6 mx-auto text-blue-500 mb-1" />
              <p className="text-sm font-medium">Productos</p>
              <p className="text-lg font-bold text-blue-600">
                {category._count.products}
              </p>
            </div>
            <div className="text-center">
              <Tag className="h-6 w-6 mx-auto text-purple-500 mb-1" />
              <p className="text-sm font-medium">Estado</p>
              <p className="text-lg font-bold text-purple-600">
                {category._count.products > 0 ? 'Activa' : 'Vacía'}
              </p>
            </div>
            <div className="text-center">
              <Palette className="h-6 w-6 mx-auto text-pink-500 mb-1" />
              <p className="text-sm font-medium">Identificación</p>
              <div 
                className="w-8 h-8 mx-auto rounded-full border-2 border-white shadow-md"
                style={{ backgroundColor: category.color }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
