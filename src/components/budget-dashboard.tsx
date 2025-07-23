"use client";

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Download, Upload, Wallet, CreditCard, TrendingUp, Landmark, Banknote } from 'lucide-react';
import { ExpenseForm } from './expense-form';
import { ExpenseTable } from './expense-table';
import { Expense } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from "@/hooks/use-toast"
import {toZonedTime} from "date-fns-tz";
import { ExpenseDetail } from './expense-detail';
import { MainNav } from './main-nav';

const initialExpenses: Expense[] = [
  { id: '1', description: 'Compras en SuperMart', amount: 75.50, date: toZonedTime(new Date('2024-07-15T00:00:00Z'), 'UTC'), category: 'Comida', paymentMethod: 'credit-card', installments: { count: 1, interestRate: 0, monthlyPayment: 75.50 } },
  { id: '2', description: 'Alquiler mensual', amount: 1200, date: toZonedTime(new Date('2024-07-01T00:00:00Z'), 'UTC'), category: 'Vivienda', paymentMethod: 'cash' },
  { id: '3', description: 'Nueva Laptop', amount: 1500, date: toZonedTime(new Date('2024-06-20T00:00:00Z'), 'UTC'), category: 'Compras', paymentMethod: 'credit-card', installments: { count: 12, interestRate: 5, monthlyPayment: 128.38 } },
  { id: '4', description: 'Gasolina para el auto', amount: 50, date: toZonedTime(new Date('2024-07-10T00:00:00Z'), 'UTC'), category: 'Transporte', paymentMethod: 'cash' },
  { id: '5', description: 'Cena con amigos', amount: 120, date: toZonedTime(new Date('2024-07-18T00:00:00Z'), 'UTC'), category: 'Comida', paymentMethod: 'credit-card', installments: { count: 1, interestRate: 0, monthlyPayment: 120 } },
  { id: '6', description: 'Factura de electricidad', amount: 85, date: toZonedTime(new Date('2024-07-05T00:00:00Z'), 'UTC'), category: 'Servicios', paymentMethod: 'cash' },
];

const initialCategories = ['Comida', 'Transporte', 'Vivienda', 'Entretenimiento', 'Compras', 'Servicios', 'Salud', 'Préstamos', 'Otros'];


export default function BudgetDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [filters, setFilters] = useState<{ category: string; paymentMethod: string; dateRange: DateRange | undefined }>({
    category: 'all',
    paymentMethod: 'all',
    dateRange: undefined
  });
  
  const expandedExpenses = useMemo(() => {
    const allExpenses: Expense[] = [];
    expenses.forEach(expense => {
      if ((expense.paymentMethod === 'credit-card' || expense.paymentMethod === 'credit') && expense.installments && expense.installments.count > 1) {
        for (let i = 0; i < expense.installments.count; i++) {
          allExpenses.push({
            ...expense,
            id: `${expense.id}-${i}`,
            originalId: expense.id,
            date: addMonths(expense.date, i),
            amount: expense.installments.monthlyPayment,
            description: `${expense.description} (${i + 1}/${expense.installments.count})`,
            isInstallment: true,
          });
        }
      } else {
        allExpenses.push(expense);
      }
    });
    return allExpenses;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expandedExpenses.filter(expense => {
      const categoryMatch = filters.category === 'all' || expense.category === filters.category;
      const paymentMethodMatch = filters.paymentMethod === 'all' || expense.paymentMethod === filters.paymentMethod;
      
      let dateMatch = true;
      if (filters.dateRange?.from) {
        const fromDate = filters.dateRange.from;
        const toDate = filters.dateRange.to || endOfMonth(fromDate);
        dateMatch = expense.date >= startOfMonth(fromDate) && expense.date <= toDate;
      }

      return categoryMatch && paymentMethodMatch && dateMatch;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [expandedExpenses, filters]);

  const groupedExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const month = format(expense.date, 'MMMM yyyy');
      if (!acc[month]) {
        acc[month] = { expenses: [], subtotal: 0 };
      }
      acc[month].expenses.push(expense);
      acc[month].subtotal += expense.amount;
      return acc;
    }, {} as Record<string, { expenses: Expense[]; subtotal: number }>);
  }, [filteredExpenses]);


  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: Date.now().toString() }]);
    if (!categories.includes(expense.category)) {
      setCategories(prev => [...prev, expense.category].sort());
    }
    toast({ title: "Éxito", description: "Gasto agregado exitosamente." });
  };
  
  const handleUpdateExpense = (expense: Expense) => {
    setExpenses(prev => prev.map(e => (e.id === expense.originalId || e.id === expense.id) ? expense : e));
    if (!categories.includes(expense.category)) {
      setCategories(prev => [...prev, expense.category].sort());
    }
    toast({ title: "Éxito", description: "Gasto actualizado exitosamente." });
  };
  
  const handleOpenEditForm = (expense: Expense) => {
    const originalExpense = expenses.find(e => e.id === (expense.originalId || expense.id));
    setEditingExpense(originalExpense);
    setIsFormOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast({ title: "Éxito", description: "Gasto eliminado." });
  };
  
  const handleViewExpense = (expense: Expense) => {
    const originalExpense = expenses.find(e => e.id === (expense.originalId || expense.id));
    if (originalExpense) {
        setSelectedExpense(originalExpense);
    }
  };

  const handleOpenForm = () => {
    setEditingExpense(undefined);
    setIsFormOpen(true);
  }
  
  const handleCloseDetail = () => {
    setSelectedExpense(null);
  }

  const { totalExpenses, cashExpenses, cardExpenses, creditExpenses } = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      acc.totalExpenses += expense.amount;
      if (expense.paymentMethod === 'cash') {
        acc.cashExpenses += expense.amount;
      } else if (expense.paymentMethod === 'credit-card') {
        acc.cardExpenses += expense.amount;
      } else if (expense.paymentMethod === 'credit') {
        acc.creditExpenses += expense.amount;
      }
      return acc;
    }, { totalExpenses: 0, cashExpenses: 0, cardExpenses: 0, creditExpenses: 0 });
  }, [filteredExpenses]);


  const handleExport = useCallback(() => {
    const header = "id,descripcion,monto,fecha,categoria,metodo_pago,cuotas_cantidad,cuotas_interes,cuotas_pago_mensual\n";
    const csvRows = expenses.map(e => {
      const row = [
        e.id,
        `"${e.description.replace(/"/g, '""')}"`,
        e.amount,
        e.date.toISOString(),
        e.category,
        e.paymentMethod,
        e.installments?.count ?? '',
        e.installments?.interestRate ?? '',
        e.installments?.monthlyPayment ?? ''
      ];
      return row.join(',');
    }).join('\n');

    const csvString = header + csvRows;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'gastos_presupuesto.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
     toast({ title: "Éxito", description: "Gastos exportados a CSV." });
  }, [expenses, toast]);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').slice(1);
      const newExpenses: Expense[] = [];
      const newCategories = new Set(categories);
      try {
        rows.forEach(rowStr => {
          if (!rowStr.trim()) return;
          const columns = rowStr.split(',');
          const category = columns[4] as string;
          const expense: Expense = {
            id: columns[0] || Date.now().toString(),
            description: columns[1]?.replace(/"/g, '') || 'N/A',
            amount: parseFloat(columns[2]),
            date: new Date(columns[3]),
            category: category,
            paymentMethod: columns[5] as Expense['paymentMethod'],
          };
          if ((expense.paymentMethod === 'credit-card' || expense.paymentMethod === 'credit') && columns[6]) {
            expense.installments = {
              count: parseInt(columns[6]),
              interestRate: parseFloat(columns[7]),
              monthlyPayment: parseFloat(columns[8]),
            };
          }
          if (!isNaN(expense.amount) && expense.date.toString() !== 'Invalid Date') {
            newExpenses.push(expense);
            if (!newCategories.has(category)) {
              newCategories.add(category);
            }
          }
        });
        setExpenses(prev => [...prev, ...newExpenses]);
        setCategories(Array.from(newCategories).sort());
        toast({ title: "Éxito", description: "Gastos importados exitosamente." });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Error al importar CSV. Por favor, revisa el formato del archivo." });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  

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
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv"
                      onChange={handleImport}
                    />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2" /> Importar
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2" /> Exportar
                    </Button>
                    <Button size="sm" onClick={handleOpenForm}>
                        <Plus className="mr-2" /> Agregar Gasto
                    </Button>
                </div>
            </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 container mx-auto">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Suma de todos los gastos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos en Efectivo</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cashExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Pagado con efectivo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarjeta de Crédito</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cardExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Pagado con tarjeta de crédito</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${creditExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Pagado con créditos</p>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div>
                    <CardTitle>Historial de Gastos</CardTitle>
                    <CardDescription>Ver y administrar tus gastos registrados.</CardDescription>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Select value={filters.category} onValueChange={(value) => setFilters(f => ({ ...f, category: value }))}>
                    <SelectTrigger className="w-full md:w-[160px]">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las Categorías</SelectItem>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                   <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(f => ({ ...f, paymentMethod: value }))}>
                    <SelectTrigger className="w-full md:w-[160px]">
                      <SelectValue placeholder="Pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Pagos</SelectItem>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="credit-card">Tarjeta de Crédito</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                          {filters.dateRange?.from ? (
                              filters.dateRange.to ? (
                                  `${format(filters.dateRange.from, "LLL dd, y")} - ${format(filters.dateRange.to, "LLL dd, y")}`
                              ) : (
                                  format(filters.dateRange.from, "MMMM yyyy")
                              )
                          ) : (
                              <span>Elige un rango de fechas</span>
                          )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={filters.dateRange}
                            onSelect={(range) => setFilters(f => ({ ...f, dateRange: range }))}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <ExpenseTable 
              groupedExpenses={groupedExpenses} 
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteExpense}
              onView={handleViewExpense}
            />
          </CardContent>
        </Card>
      </main>
      <ExpenseForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onAddExpense={handleAddExpense}
        onUpdateExpense={handleUpdateExpense}
        expenseToEdit={editingExpense}
        categories={categories}
      />
      {selectedExpense && (
          <ExpenseDetail
              expense={selectedExpense}
              isOpen={!!selectedExpense}
              onOpenChange={handleCloseDetail}
          />
      )}
    </div>
  );
}

    