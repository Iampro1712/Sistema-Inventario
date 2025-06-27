"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Datos de ejemplo
const products = [
  {
    id: 1,
    name: "Laptop Dell XPS 13",
    sku: "LAP-001",
    category: "Electrónicos",
    price: 1299.99,
    cost: 999.99,
    stock: 15,
    minStock: 5,
    status: "active",
    image: null,
  },
  {
    id: 2,
    name: "Mouse Logitech MX Master 3",
    sku: "MOU-002",
    category: "Accesorios",
    price: 99.99,
    cost: 65.99,
    stock: 2,
    minStock: 10,
    status: "active",
    image: null,
  },
  {
    id: 3,
    name: "Teclado Mecánico Corsair K95",
    sku: "KEY-003",
    category: "Accesorios",
    price: 199.99,
    cost: 129.99,
    stock: 8,
    minStock: 5,
    status: "active",
    image: null,
  },
  {
    id: 4,
    name: "Monitor Samsung 27 4K",
    sku: "MON-004",
    category: "Electrónicos",
    price: 399.99,
    cost: 299.99,
    stock: 0,
    minStock: 3,
    status: "active",
    image: null,
  },
  {
    id: 5,
    name: "Auriculares Sony WH-1000XM4",
    sku: "AUR-005",
    category: "Audio",
    price: 349.99,
    cost: 249.99,
    stock: 12,
    minStock: 8,
    status: "active",
    image: null,
  },
];

const getStockStatus = (stock: number, minStock: number) => {
  if (stock === 0) {
    return { variant: "destructive" as const, text: "Sin Stock" };
  } else if (stock <= minStock) {
    return { variant: "secondary" as const, text: "Stock Bajo" };
  } else {
    return { variant: "outline" as const, text: "En Stock" };
  }
};

export function ProductsTable() {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Lista de Productos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(products.map(p => p.id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Producto</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Categoría</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Precio</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.minStock);
                
                return (
                  <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Costo: ${product.cost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {product.sku}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.stock}</span>
                        <span className="text-muted-foreground text-sm">
                          / {product.minStock} mín
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.text}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Mostrando 1-5 de 1,234 productos
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
