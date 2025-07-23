"use client";

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Download, Upload, Wallet, CreditCard, TrendingUp, Landmark } from 'lucide-react';
import { ExpenseForm } from './expense-form';
import { ExpenseTable } from './expense-table';
import { Expense, categories } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast"
import {toZonedTime} from "date-fns-tz";

const initialExpenses: Expense[] = [
  { id: '1', description: 'Groceries at SuperMart', amount: 75.50, date: toZonedTime(new Date('2024-07-15T00:00:00Z'), 'UTC'), category: 'Food', paymentMethod: 'credit-card', installments: { count: 1, interestRate: 0, monthlyPayment: 75.50 } },
  { id: '2', description: 'Monthly rent', amount: 1200, date: toZonedTime(new Date('2024-07-01T00:00:00Z'), 'UTC'), category: 'Housing', paymentMethod: 'cash' },
  { id: '3', description: 'New Laptop', amount: 1500, date: toZonedTime(new Date('2024-06-20T00:00:00Z'), 'UTC'), category: 'Shopping', paymentMethod: 'credit-card', installments: { count: 12, interestRate: 5, monthlyPayment: 128.38 } },
  { id: '4', description: 'Gasoline for car', amount: 50, date: toZonedTime(new Date('2024-07-10T00:00:00Z'), 'UTC'), category: 'Transport', paymentMethod: 'cash' },
  { id: '5', description: 'Dinner with friends', amount: 120, date: toZonedTime(new Date('2024-07-18T00:00:00Z'), 'UTC'), category: 'Food', paymentMethod: 'credit-card', installments: { count: 1, interestRate: 0, monthlyPayment: 120 } },
  { id: '6', description: 'Electricity Bill', amount: 85, date: toZonedTime(new Date('2024-07-05T00:00:00Z'), 'UTC'), category: 'Utilities', paymentMethod: 'cash' },
];

export default function BudgetDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [filters, setFilters] = useState<{ category: string; paymentMethod: string; dateRange: DateRange | undefined }>({
    category: 'all',
    paymentMethod: 'all',
    dateRange: undefined
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const categoryMatch = filters.category === 'all' || expense.category === filters.category;
      const paymentMethodMatch = filters.paymentMethod === 'all' || expense.paymentMethod === filters.paymentMethod;
      const dateMatch = !filters.dateRange || (
        (!filters.dateRange.from || expense.date >= filters.dateRange.from) &&
        (!filters.dateRange.to || expense.date <= filters.dateRange.to)
      );
      return categoryMatch && paymentMethodMatch && dateMatch;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [expenses, filters]);

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: Date.now().toString() }]);
    toast({ title: "Success", description: "Expense added successfully." });
  };
  
  const handleUpdateExpense = (expense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    toast({ title: "Success", description: "Expense updated successfully." });
  };
  
  const handleOpenEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast({ title: "Success", description: "Expense deleted." });
  };

  const handleOpenForm = () => {
    setEditingExpense(undefined);
    setIsFormOpen(true);
  }

  const { totalExpenses, cashExpenses, cardExpenses } = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      acc.totalExpenses += expense.amount;
      if (expense.paymentMethod === 'cash') {
        acc.cashExpenses += expense.amount;
      } else {
        acc.cardExpenses += expense.amount;
      }
      return acc;
    }, { totalExpenses: 0, cashExpenses: 0, cardExpenses: 0 });
  }, [filteredExpenses]);

  const handleExport = useCallback(() => {
    const header = "id,description,amount,date,category,paymentMethod,installments_count,installments_interest,installments_monthly_payment\n";
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
      link.setAttribute('download', 'budgetwise_expenses.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
     toast({ title: "Success", description: "Expenses exported to CSV." });
  }, [expenses, toast]);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').slice(1);
      const newExpenses: Expense[] = [];
      try {
        rows.forEach(rowStr => {
          if (!rowStr.trim()) return;
          const columns = rowStr.split(',');
          const expense: Expense = {
            id: columns[0] || Date.now().toString(),
            description: columns[1]?.replace(/"/g, '') || 'N/A',
            amount: parseFloat(columns[2]),
            date: new Date(columns[3]),
            category: columns[4] as Expense['category'],
            paymentMethod: columns[5] as Expense['paymentMethod'],
          };
          if (expense.paymentMethod === 'credit-card' && columns[6]) {
            expense.installments = {
              count: parseInt(columns[6]),
              interestRate: parseFloat(columns[7]),
              monthlyPayment: parseFloat(columns[8]),
            };
          }
          if (!isNaN(expense.amount) && expense.date.toString() !== 'Invalid Date') {
            newExpenses.push(expense);
          }
        });
        setExpenses(prev => [...prev, ...newExpenses]);
        toast({ title: "Success", description: "Expenses imported successfully." });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to import CSV. Please check file format." });
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
                <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv"
                      onChange={handleImport}
                    />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2" /> Import
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="mr-2" /> Export
                    </Button>
                    <Button size="sm" onClick={handleOpenForm}>
                        <Plus className="mr-2" /> Add Expense
                    </Button>
                </div>
            </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 container mx-auto">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Sum of all expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Expenses</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cashExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Paid with cash</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credit Card</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${cardExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Paid with credit card</p>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div>
                    <CardTitle>Expense History</CardTitle>
                    <CardDescription>View and manage your recorded expenses.</CardDescription>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Select value={filters.category} onValueChange={(value) => setFilters(f => ({ ...f, category: value }))}>
                    <SelectTrigger className="w-full md:w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                   <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(f => ({ ...f, paymentMethod: value }))}>
                    <SelectTrigger className="w-full md:w-[160px]">
                      <SelectValue placeholder="Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                          {filters.dateRange?.from ? (
                              filters.dateRange.to ? (
                                  `${format(filters.dateRange.from, "LLL dd, y")} - ${format(filters.dateRange.to, "LLL dd, y")}`
                              ) : (
                                  format(filters.dateRange.from, "LLL dd, y")
                              )
                          ) : (
                              <span>Pick a date range</span>
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
              expenses={filteredExpenses} 
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteExpense}
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
      />
    </div>
  );
}

    