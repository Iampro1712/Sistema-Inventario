"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";

const stats = [
  {
    name: "Total Productos",
    value: "1,234",
    change: "+12%",
    changeType: "positive",
    icon: Package,
  },
  {
    name: "Valor Inventario",
    value: "$45,231",
    change: "+8%",
    changeType: "positive",
    icon: DollarSign,
  },
  {
    name: "Productos Bajo Stock",
    value: "23",
    change: "-5%",
    changeType: "negative",
    icon: AlertTriangle,
  },
  {
    name: "Movimientos Hoy",
    value: "89",
    change: "+15%",
    changeType: "positive",
    icon: TrendingUp,
  },
];

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.name}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={
                  stat.changeType === "positive"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {stat.change}
              </span>{" "}
              desde el mes pasado
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
