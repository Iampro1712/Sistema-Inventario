"use client";

import { TrendingUp, TrendingDown, RotateCcw, ArrowRight, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Datos de ejemplo
const movements = [
  {
    id: 1,
    type: "IN",
    product: "Laptop Dell XPS 13",
    sku: "LAP-001",
    quantity: 10,
    reason: "Compra",
    reference: "PO-001",
    user: "Admin",
    date: "2024-01-15T10:30:00Z",
    notes: "Compra mensual de laptops",
  },
  {
    id: 2,
    type: "OUT",
    product: "Mouse Logitech MX Master 3",
    sku: "MOU-002",
    quantity: 5,
    reason: "Venta",
    reference: "SO-002",
    user: "Vendedor1",
    date: "2024-01-15T09:15:00Z",
    notes: "Venta a cliente corporativo",
  },
  {
    id: 3,
    type: "ADJUSTMENT",
    product: "Teclado Mecánico Corsair K95",
    sku: "KEY-003",
    quantity: -2,
    reason: "Ajuste de inventario",
    reference: "ADJ-003",
    user: "Admin",
    date: "2024-01-14T16:45:00Z",
    notes: "Productos dañados en almacén",
  },
  {
    id: 4,
    type: "IN",
    product: "Monitor Samsung 27 4K",
    sku: "MON-004",
    quantity: 8,
    reason: "Compra",
    reference: "PO-004",
    user: "Admin",
    date: "2024-01-14T14:20:00Z",
    notes: "Reposición de stock",
  },
  {
    id: 5,
    type: "OUT",
    product: "Auriculares Sony WH-1000XM4",
    sku: "AUR-005",
    quantity: 3,
    reason: "Venta",
    reference: "SO-005",
    user: "Vendedor2",
    date: "2024-01-14T11:30:00Z",
    notes: "Venta online",
  },
];

const getMovementIcon = (type: string) => {
  switch (type) {
    case "IN":
      return TrendingUp;
    case "OUT":
      return TrendingDown;
    case "ADJUSTMENT":
      return RotateCcw;
    default:
      return ArrowRight;
  }
};

const getMovementColor = (type: string) => {
  switch (type) {
    case "IN":
      return "text-green-600 dark:text-green-400";
    case "OUT":
      return "text-red-600 dark:text-red-400";
    case "ADJUSTMENT":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "text-muted-foreground";
  }
};

const getMovementBadge = (type: string) => {
  switch (type) {
    case "IN":
      return { variant: "secondary" as const, text: "Entrada" };
    case "OUT":
      return { variant: "destructive" as const, text: "Salida" };
    case "ADJUSTMENT":
      return { variant: "outline" as const, text: "Ajuste" };
    default:
      return { variant: "secondary" as const, text: "Otro" };
  }
};

export function MovementsTable() {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Historial de Movimientos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Producto</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cantidad</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Motivo</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Referencia</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuario</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => {
                const Icon = getMovementIcon(movement.type);
                const badge = getMovementBadge(movement.type);
                
                return (
                  <tr key={movement.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <Icon className={`h-4 w-4 ${getMovementColor(movement.type)}`} />
                        </div>
                        <Badge variant={badge.variant}>{badge.text}</Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{movement.product}</p>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {movement.sku}
                        </code>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getMovementColor(movement.type)}`}>
                        {movement.type === "OUT" || movement.quantity < 0 ? "-" : "+"}
                        {Math.abs(movement.quantity)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{movement.reason}</span>
                    </td>
                    <td className="py-3 px-4">
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {movement.reference}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{movement.user}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {new Date(movement.date).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
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
            Mostrando 1-5 de 156 movimientos
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
