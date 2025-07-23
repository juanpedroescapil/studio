"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ShoppingCart, Utensils, Home, Car, Tv, HeartPulse, Zap, Wallet, CreditCard, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Expense } from '@/types';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

type ExpenseTableProps = {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
};

const categoryIcons: { [key: string]: React.ReactNode } = {
  Food: <Utensils className="h-4 w-4" />,
  Shopping: <ShoppingCart className="h-4 w-4" />,
  Housing: <Home className="h-4 w-4" />,
  Transport: <Car className="h-4 w-4" />,
  Entertainment: <Tv className="h-4 w-4" />,
  Health: <HeartPulse className="h-4 w-4" />,
  Utilities: <Zap className="h-4 w-4" />,
  Other: <div className="h-4 w-4" />,
};

export function ExpenseTable({ expenses, onEdit, onDelete }: ExpenseTableProps) {
  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[250px]">Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {expenses.length > 0 ? (
                expenses.map(expense => (
                    <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className="flex items-center gap-2 w-fit">
                            {categoryIcons[expense.category]}
                            {expense.category}
                        </Badge>
                    </TableCell>
                    <TableCell>{format(expense.date, 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="flex items-center gap-2">
                        {expense.paymentMethod === 'cash' ? <Wallet className="h-4 w-4 text-green-600" /> : <CreditCard className="h-4 w-4 text-blue-600" />}
                        <span className="capitalize">{expense.paymentMethod.replace('-', ' ')}</span>
                        {expense.installments && expense.installments.count > 1 && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-60">
                                    <div className="grid gap-2 text-sm">
                                        <div className="font-semibold">Installment Details</div>
                                        <div className="flex justify-between"><span>Installments:</span> <span>{expense.installments.count}</span></div>
                                        <div className="flex justify-between"><span>Interest Rate:</span> <span>{expense.installments.interestRate}%</span></div>
                                        <div className="flex justify-between"><span>Monthly:</span> <span>${expense.installments.monthlyPayment.toFixed(2)}</span></div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </TableCell>
                    <TableCell className="text-right font-mono">${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(expense)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                    No expenses found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
  );
}
