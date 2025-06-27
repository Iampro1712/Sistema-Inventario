"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";

const lowStockProducts = [
  {
    id: 1,
    name: "Laptop Dell XPS 13",
    sku: "LAP-001",
    currentStock: 2,
    minStock: 5,
    category: "Electrónicos",
  },
  {
    id: 2,
    name: "Mouse Logitech MX",
    sku: "MOU-002",
    currentStock: 1,
    minStock: 10,
    category: "Accesorios",
  },
  {
    id: 3,
    name: "Teclado Mecánico",
    sku: "KEY-003",
    currentStock: 3,
    minStock: 8,
    category: "Accesorios",
  },
  {
    id: 4,
    name: "Monitor 24 pulgadas",
    sku: "MON-004",
    currentStock: 0,
    minStock: 3,
    category: "Electrónicos",
  },
];

export function LowStockAlerts() {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Alertas de Stock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lowStockProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  SKU: {product.sku}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant={product.currentStock === 0 ? "destructive" : "secondary"}
                className="mb-1"
              >
                {product.currentStock === 0 ? "Sin Stock" : "Stock Bajo"}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {product.currentStock}/{product.minStock} unidades
              </p>
            </div>
          </div>
        ))}
        {lowStockProducts.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay alertas de stock</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
