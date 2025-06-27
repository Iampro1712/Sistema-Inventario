"use client";

import { Edit, Trash2, Package, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Datos de ejemplo
const categories = [
  {
    id: 1,
    name: "Electrónicos",
    description: "Dispositivos electrónicos y gadgets",
    color: "#3B82F6",
    productCount: 245,
    totalValue: 125430.50,
  },
  {
    id: 2,
    name: "Accesorios",
    description: "Accesorios para computadoras y dispositivos",
    color: "#10B981",
    productCount: 189,
    totalValue: 45230.25,
  },
  {
    id: 3,
    name: "Audio",
    description: "Equipos de audio y sonido",
    color: "#F59E0B",
    productCount: 67,
    totalValue: 23450.75,
  },
  {
    id: 4,
    name: "Gaming",
    description: "Productos para videojuegos",
    color: "#EF4444",
    productCount: 134,
    totalValue: 67890.00,
  },
  {
    id: 5,
    name: "Oficina",
    description: "Suministros y equipos de oficina",
    color: "#8B5CF6",
    productCount: 298,
    totalValue: 34567.80,
  },
  {
    id: 6,
    name: "Cables",
    description: "Cables y conectores",
    color: "#06B6D4",
    productCount: 156,
    totalValue: 12345.60,
  },
  {
    id: 7,
    name: "Almacenamiento",
    description: "Dispositivos de almacenamiento",
    color: "#84CC16",
    productCount: 89,
    totalValue: 45678.90,
  },
  {
    id: 8,
    name: "Redes",
    description: "Equipos de red y conectividad",
    color: "#F97316",
    productCount: 76,
    totalValue: 28934.45,
  },
];

export function CategoriesGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => (
        <Card key={category.id} className="animate-fade-in hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Package 
                    className="h-5 w-5" 
                    style={{ color: category.color }}
                  />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {category.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Productos</span>
                <Badge variant="secondary">{category.productCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor Total</span>
                <span className="font-medium">${category.totalValue.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Ver Productos
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Card para agregar nueva categoría */}
      <Card className="animate-fade-in border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-2">Nueva Categoría</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crea una nueva categoría para organizar tus productos
          </p>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Crear Categoría
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
