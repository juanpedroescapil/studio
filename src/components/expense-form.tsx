"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Expense, categories, Category } from '@/types';
import { getCategorySuggestion } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast"


type ExpenseFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  expenseToEdit?: Expense;
};

const formSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.date(),
  category: z.enum(categories),
  paymentMethod: z.enum(['cash', 'credit-card']),
  installmentsCount: z.coerce.number().optional(),
  interestRate: z.coerce.number().optional(),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

export function ExpenseForm({ isOpen, onOpenChange, onAddExpense, onUpdateExpense, expenseToEdit }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date(),
      category: 'Food',
      paymentMethod: 'cash',
      installmentsCount: 1,
      interestRate: 0,
    },
  });

  const { toast } = useToast();
  const [isSuggestionLoading, startSuggestionTransition] = useTransition();

  useEffect(() => {
    if (expenseToEdit) {
      form.reset({
        description: expenseToEdit.description,
        amount: expenseToEdit.amount,
        date: expenseToEdit.date,
        category: expenseToEdit.category as Category,
        paymentMethod: expenseToEdit.paymentMethod,
        installmentsCount: expenseToEdit.installments?.count,
        interestRate: expenseToEdit.installments?.interestRate,
      });
    } else {
      form.reset();
    }
  }, [expenseToEdit, isOpen, form]);

  const paymentMethod = form.watch('paymentMethod');

  const calculateMonthlyPayment = (principal: number, annualInterestRate: number, installments: number): number => {
    if (installments <= 0) return principal;
    if (annualInterestRate === 0) return principal / installments;
    const monthlyInterestRate = (annualInterestRate / 100) / 12;
    const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, installments);
    const denominator = Math.pow(1 + monthlyInterestRate, installments) - 1;
    if (denominator === 0) return principal / installments;
    return principal * (numerator / denominator);
  };
  
  const handleSuggestCategory = () => {
    const description = form.getValues("description");
    if(!description) {
        toast({
            variant: "destructive",
            title: "Uh oh!",
            description: "Please enter a description first.",
        })
        return;
    }
    startSuggestionTransition(async () => {
        const result = await getCategorySuggestion(description);
        if (result.suggestedCategory && categories.includes(result.suggestedCategory as Category)) {
            form.setValue("category", result.suggestedCategory as Category);
             toast({ title: "Suggestion", description: `We suggest the category: ${result.suggestedCategory}` });
        } else {
            toast({ variant: "destructive", title: "Suggestion Failed", description: "Could not suggest a category for this expense." });
        }
    });
  };

  const onSubmit = (values: ExpenseFormValues) => {
    const expenseData: Omit<Expense, 'id'> = {
      description: values.description,
      amount: values.amount,
      date: values.date,
      category: values.category,
      paymentMethod: values.paymentMethod,
    };

    if (values.paymentMethod === 'credit-card') {
      const count = values.installmentsCount || 1;
      const interestRate = values.interestRate || 0;
      expenseData.installments = {
        count,
        interestRate,
        monthlyPayment: calculateMonthlyPayment(values.amount, interestRate, count),
      };
    }
    
    if(expenseToEdit) {
        onUpdateExpense({ ...expenseData, id: expenseToEdit.id });
    } else {
        onAddExpense(expenseData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expenseToEdit ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          <DialogDescription>
            {expenseToEdit ? 'Update the details of your expense.' : 'Enter the details of your new expense.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                   <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="e.g. Coffee with friends" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={isSuggestionLoading}>
                        {isSuggestionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant="outline"
                            className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                            )}
                            >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a method" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="credit-card">Credit Card</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            {paymentMethod === 'credit-card' && (
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="installmentsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Installments</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{expenseToEdit ? 'Save Changes' : 'Add Expense'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
