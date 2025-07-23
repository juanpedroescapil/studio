"use client";
import { Landmark, Download, Upload, Plus } from "lucide-react";
import MonthlyBreakdown from "@/components/monthly-breakdown";
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Landmark className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-headline">BudgetWise</h1>
            </div>
            <MainNav className="mx-6" />
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" >
                    <Upload className="mr-2" /> Importar
                </Button>
                <Button variant="outline" size="sm" >
                    <Download className="mr-2" /> Exportar
                </Button>
                <Button size="sm">
                    <Plus className="mr-2" /> Agregar Gasto
                </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 container mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h2>
        <MonthlyBreakdown />
      </main>
    </div>
  );
}
