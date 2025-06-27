"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RotateCcw, ArrowRight } from "lucide-react";

const recentMovements = [
  {
    id: 1,
    type: "IN",
    product: "Laptop Dell XPS 13",
    quantity: 10,
    reason: "Compra",
    date: "2024-01-15T10:30:00Z",
    reference: "PO-001",
  },
  {
    id: 2,
    type: "OUT",
    product: "Mouse Logitech MX",
    quantity: 5,
    reason: "Venta",
    date: "2024-01-15T09:15:00Z",
    reference: "SO-002",
  },
  {
    id: 3,
    type: "ADJUSTMENT",
    product: "Teclado Mecánico",
    quantity: -2,
    reason: "Ajuste de inventario",
    date: "2024-01-14T16:45:00Z",
    reference: "ADJ-003",
  },
  {
    id: 4,
    type: "IN",
    product: "Monitor 24 pulgadas",
    quantity: 8,
    reason: "Compra",
    date: "2024-01-14T14:20:00Z",
    reference: "PO-004",
  },
  {
    id: 5,
    type: "OUT",
    product: "Auriculares Bluetooth",
    quantity: 3,
    reason: "Venta",
    date: "2024-01-14T11:30:00Z",
    reference: "SO-005",
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

export function RecentMovements() {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Movimientos Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentMovements.map((movement) => {
            const Icon = getMovementIcon(movement.type);
            const badge = getMovementBadge(movement.type);
            
            return (
              <div
                key={movement.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted`}>
                    <Icon className={`h-5 w-5 ${getMovementColor(movement.type)}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{movement.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {movement.reason} • {movement.reference}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={badge.variant}>{badge.text}</Badge>
                    <span className={`text-sm font-medium ${getMovementColor(movement.type)}`}>
                      {movement.type === "OUT" || movement.quantity < 0 ? "-" : "+"}
                      {Math.abs(movement.quantity)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(movement.date).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
