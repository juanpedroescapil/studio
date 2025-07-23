
"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense, categories } from '@/types';
import { toZonedTime } from "date-fns-tz";
import { addMonths, format } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const initialExpenses: Expense[] = [
  { id: '1', description: 'Compras en SuperMart', amount: 75.50, date: toZonedTime(new Date('2024-07-15T00:00:00Z'), 'UTC'), category: 'Comida', paymentMethod: 'credit-card', installments: { count: 1, interestRate: 0, monthlyPayment: 75.50 } },
  { id: '2', description: 'Alquiler mensual', amount: 1200, date: toZonedTime(new Date('2024-07-01T00:00:00Z'), 'UTC'), category: 'Vivienda', paymentMethod: 'cash' },
  { id: '3', description: 'Nueva Laptop', amount: 1500, date: toZonedTime(new Date('2024-06-20T00:00:00Z'), 'UTC'), category: 'Compras', paymentMethod: 'credit-card', installments: { count: 12, interestRate: 5, monthlyPayment: 128.38 } },
  { id: '4', description: 'Gasolina para el auto', amount: 50, date: toZonedTime(new Date('2024-07-10T00:00:00Z'), 'UTC'), category: 'Transporte', paymentMethod: 'cash' },
  { id: '5', description: 'Cena con amigos', amount: 120, date: toZonedTime(new Date('2024-07-18T00:00:00Z'), 'UTC'), category: 'Comida', paymentMethod: 'credit-card', installments: { count: 1, interestRate: 0, monthlyPayment: 120 } },
  { id: '6', description: 'Factura de electricidad', amount: 85, date: toZonedTime(new Date('2024-07-05T00:00:00Z'), 'UTC'), category: 'Servicios', paymentMethod: 'cash' },
];

const COLORS = ['#22c55e', '#facc15', '#ef4444', '#38bdf8', '#a855f7', '#f97316', '#84cc16', '#eab308'];

export default function MonthlyBreakdown() {
  const [expenses] = useState<Expense[]>(initialExpenses);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const expandedExpenses = useMemo(() => {
    const allExpenses: Expense[] = [];
    expenses.forEach(expense => {
      if ((expense.paymentMethod === 'credit-card' || expense.paymentMethod === 'credit') && expense.installments && expense.installments.count > 1) {
        for (let i = 0; i < expense.installments.count; i++) {
          allExpenses.push({
            ...expense,
            id: `${expense.id}-${i}`,
            date: addMonths(expense.date, i),
            amount: expense.installments.monthlyPayment,
            description: `${expense.description} (${i + 1}/${expense.installments.count})`,
          });
        }
      } else {
        allExpenses.push(expense);
      }
    });
    return allExpenses;
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const groupedByMonth = expandedExpenses.reduce((acc, expense) => {
      const month = format(expense.date, 'MMMM yyyy');
      if (!acc[month]) {
        acc[month] = { total: 0, byCategory: {}, expenses: [] };
      }
      acc[month].total += expense.amount;
      if (!acc[month].byCategory[expense.category]) {
        acc[month].byCategory[expense.category] = 0;
      }
      acc[month].byCategory[expense.category] += expense.amount;
      acc[month].expenses.push(expense);
      return acc;
    }, {} as Record<string, { total: number; byCategory: Record<string, number>; expenses: Expense[] }>);

    return Object.entries(groupedByMonth).map(([month, data]) => ({
      month,
      total: data.total,
      categoryData: Object.entries(data.byCategory).map(([name, value]) => ({ name, value })),
      expenses: data.expenses.sort((a,b) => a.category.localeCompare(b.category))
    })).sort((a,b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  }, [expandedExpenses]);
  
  const filteredData = useMemo(() => {
    if (selectedMonth === 'all') {
      return monthlyData;
    }
    return monthlyData.filter(data => data.month === selectedMonth);
  }, [monthlyData, selectedMonth]);

  const availableMonths = useMemo(() => {
    return monthlyData.map(data => data.month);
  }, [monthlyData]);

  const expensesGroupedByCategory = useMemo(() => {
    if (filteredData.length !== 1) return {};
    return filteredData[0].expenses.reduce((acc, expense) => {
        if(!acc[expense.category]) {
            acc[expense.category] = [];
        }
        acc[expense.category].push(expense);
        return acc;
    }, {} as Record<string, Expense[]>)
  }, [filteredData])

  return (
    <div>
        <div className="mb-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los Meses</SelectItem>
                    {availableMonths.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
          {filteredData.map(({ month, total, categoryData }) => (
            <Card key={month} className={filteredData.length === 1 ? 'lg:col-span-2' : ''}>
              <CardHeader>
                <CardTitle>{month}</CardTitle>
                <p className="text-2xl font-bold">${total.toFixed(2)}</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredData.length === 1 && (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Detalle de Gastos - {filteredData[0].month}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(expensesGroupedByCategory).map(([category, expenses]) => (
                                <React.Fragment key={category}>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableCell colSpan={3} className="font-bold">{category}</TableCell>
                                    </TableRow>
                                    {expenses.map(expense => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell>{format(expense.date, 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="text-right font-mono">${expense.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
