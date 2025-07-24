"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ShoppingCart, Utensils, Home, Car, Tv, HeartPulse, Zap, Wallet, CreditCard as CreditCardIcon, Info, Banknote, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';
import { Expense, CreditCard } from '@/types';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { cn } from '@/lib/utils';

type ExpenseTableProps = {
  groupedExpenses: Record<string, { expenses: Expense[]; subtotal: number }>;
  creditCards: CreditCard[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onView: (expense: Expense) => void;
};

const categoryIcons: { [key: string]: React.ReactNode } = {
  Comida: <Utensils className="h-4 w-4" />,
  Compras: <ShoppingCart className="h-4 w-4" />,
  Vivienda: <Home className="h-4 w-4" />,
  Transporte: <Car className="h-4 w-4" />,
  Entretenimiento: <Tv className="h-4 w-4" />,
  Salud: <HeartPulse className="h-4 w-4" />,
  Servicios: <Zap className="h-4 w-4" />,
  Préstamos: <PiggyBank className="h-4 w-4" />,
  Otros: <div className="h-4 w-4" />,
};

const paymentMethodIcons: { [key: string]: React.ReactNode } = {
    cash: <Wallet className="h-4 w-4 text-chart-2" />,
    'credit-card': <CreditCardIcon className="h-4 w-4 text-chart-4" />,
    credit: <Banknote className="h-4 w-4 text-chart-3" />,
};

const monthColors = ['text-chart-3', 'text-chart-1', 'text-chart-2', 'text-chart-4', 'text-chart-5', 'text-chart-6'];


export function ExpenseTable({ groupedExpenses, creditCards, onEdit, onDelete, onView }: ExpenseTableProps) {
    const months = Object.keys(groupedExpenses);

    const getPaymentMethodLabel = (expense: Expense) => {
        if (expense.paymentMethod === 'credit-card') {
            const card = creditCards.find(c => c.id.toString() === expense.creditCardId);
            return card ? `${card.name}` : 'Tarjeta de Crédito';
        }
        if (expense.paymentMethod === 'cash') return 'Efectivo';
        if (expense.paymentMethod === 'credit') return 'Crédito';
        return '';
    }



  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[250px]">Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {months.length > 0 ? (
                 months.map((month, index) => {
                    return (
                    <React.Fragment key={month}>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableCell colSpan={4} className={cn("font-bold", monthColors[index % monthColors.length])}>{month}</TableCell>
                            <TableCell colSpan={2} className={cn("text-right font-bold font-mono", monthColors[index % monthColors.length])}>${groupedExpenses[month].subtotal.toFixed(2)}</TableCell>
                        </TableRow>
                        {groupedExpenses[month].expenses.map((expense, expenseIndex) => (
                            <TableRow key={`${expense.id}-${expenseIndex}`} onClick={() => onView(expense)} className="cursor-pointer">
                            <TableCell className="font-medium">{expense.description}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="flex items-center gap-2 w-fit">
                                    {categoryIcons[typeof expense.category === 'string' ? expense.category : expense.category.name]}
                                    {typeof expense.category === 'string' ? expense.category : expense.category.name}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(expense.date, 'MMM dd, yyyy')}</TableCell>
                            <TableCell className="flex items-center gap-2">
                                {paymentMethodIcons[expense.paymentMethod]}
                                <span className="capitalize">{getPaymentMethodLabel(expense)}</span>
                                {(expense.paymentMethod === 'credit-card' || expense.paymentMethod === 'credit') && expense.installmentsCount && expense.installmentsCount > 1 && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-60">
                                            <div className="grid gap-2 text-sm">
                                                <div className="font-semibold">Detalles de Cuotas</div>
                                                <div className="flex justify-between"><span>Monto Total:</span> <span>${((expense.monthlyPayment || expense.amount) * (expense.installmentsCount || 1)).toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span>Cuotas:</span> <span>{expense.installmentsCount}</span></div>
                                                <div className="flex justify-between"><span>Tasa de Interés:</span> <span>{expense.interestRate || 0}%</span></div>
                                                <div className="flex justify-between"><span>Mensual:</span> <span>${(expense.monthlyPayment || expense.amount).toFixed(2)}</span></div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </TableCell>
                            <TableCell className="text-right font-mono">${expense.amount.toFixed(2)}</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onView(expense)}>Ver Detalles</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onEdit(expense)}>Editar</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(expense.originalId || expense.id)} className="text-destructive">Eliminar</DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                        ))}
                    </React.Fragment>
                    );
                 })
                ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron gastos.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
  );
}
