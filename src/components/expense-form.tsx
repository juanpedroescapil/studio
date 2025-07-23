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
import { Expense, Category, CreditCard } from '@/types';
import { getCategorySuggestion } from '@/lib/actions';
import { useToast } from "@/hooks/use-toast"


type ExpenseFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  expenseToEdit?: Expense;
  categories: Category[];
  creditCards: CreditCard[];
  onCategoryAdded: (category: string) => void;
};

const formSchema = z.object({
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  amount: z.coerce.number().positive('El monto debe ser positivo'),
  date: z.date(),
  category: z.string().min(1, 'La categoría es requerida'),
  newCategory: z.string().optional(),
  paymentMethod: z.enum(['cash', 'credit-card', 'credit']),
  creditCardId: z.string().optional(),
  installmentsCount: z.coerce.number().optional(),
  interestRate: z.coerce.number().optional(),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

export function ExpenseForm({ 
  isOpen, 
  onOpenChange, 
  onAddExpense, 
  onUpdateExpense, 
  expenseToEdit, 
  categories, 
  creditCards,
  onCategoryAdded 
}: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date(),
      category: '',
      newCategory: '',
      paymentMethod: 'cash',
      creditCardId: undefined,
      installmentsCount: 1,
      interestRate: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        form.reset({
          description: expenseToEdit.description,
          amount: expenseToEdit.amount,
          date: expenseToEdit.date,
          category: expenseToEdit.category,
          paymentMethod: expenseToEdit.paymentMethod,
          creditCardId: expenseToEdit.creditCardId,
          installmentsCount: expenseToEdit.installments?.count,
          interestRate: expenseToEdit.installments?.interestRate,
        });
      } else {
        form.reset({
          date: new Date(),
          description: '',
          amount: 0,
          category: categories[0] || '',
          newCategory: '',
          paymentMethod: 'cash',
          creditCardId: creditCards[0]?.id || undefined,
          installmentsCount: 1,
          interestRate: 0,
        });
      }
    }
  }, [isOpen, expenseToEdit, form, categories, creditCards]);

  const { toast } = useToast();
  const [isSuggestionLoading, startSuggestionTransition] = useTransition();

  const paymentMethod = form.watch('paymentMethod');
  const category = form.watch('category');

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
            title: "¡Atención!",
            description: "Por favor, ingresa una descripción primero.",
        })
        return;
    }
    startSuggestionTransition(async () => {
        const result = await getCategorySuggestion(description, categories);
        if (result.suggestedCategory && categories.includes(result.suggestedCategory)) {
            form.setValue("category", result.suggestedCategory);
             toast({ title: "Sugerencia", description: `Te sugerimos la categoría: ${result.suggestedCategory}` });
        } else {
            toast({ variant: "destructive", title: "Sugerencia Fallida", description: "No se pudo sugerir una categoría para este gasto." });
        }
    });
  };

  const onSubmit = (values: ExpenseFormValues) => {
    let finalCategory = values.category;
    if (values.category === 'new') {
        const newCategory = values.newCategory?.trim();
        if (newCategory) {
            onCategoryAdded(newCategory);
            finalCategory = newCategory;
        } else {
            form.setError('newCategory', { type: 'manual', message: 'El nombre de la categoría no puede estar vacío.' });
            return;
        }
    }
    
    if (values.paymentMethod === 'credit-card' && !values.creditCardId) {
        form.setError('creditCardId', { type: 'manual', message: 'Por favor, selecciona una tarjeta.' });
        return;
    }

    const expenseData: Omit<Expense, 'id'> = {
      description: values.description,
      amount: values.amount,
      date: values.date,
      category: finalCategory,
      paymentMethod: values.paymentMethod,
      creditCardId: values.paymentMethod === 'credit-card' ? values.creditCardId : undefined,
    };

    if (values.paymentMethod === 'credit-card' || values.paymentMethod === 'credit') {
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
          <DialogTitle>{expenseToEdit ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}</DialogTitle>
          <DialogDescription>
            {expenseToEdit ? 'Actualiza los detalles de tu gasto.' : 'Ingresa los detalles de tu nuevo gasto.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                   <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="Ej: Crédito hipotecario" {...field} />
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
                    <FormLabel>Monto</FormLabel>
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
                    <FormLabel>Fecha</FormLabel>
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
                            {field.value ? format(field.value, 'PPP') : <span>Elige una fecha</span>}
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
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                        <SelectItem value="new">+ Agregar nueva categoría</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 {category === 'new' && (
                  <FormField
                    control={form.control}
                    name="newCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva Categoría</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre de la categoría" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
            </div>
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Método de Pago</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                      <SelectTrigger>
                          <SelectValue placeholder="Selecciona un método" />
                      </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="credit-card">Tarjeta de Crédito</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                      </SelectContent>
                  </Select>
                  <FormMessage />
                  </FormItem>
              )}
            />

            {paymentMethod === 'credit-card' && (
                 <FormField
                    control={form.control}
                    name="creditCardId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tarjeta</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una tarjeta" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {creditCards.map(card => (
                                <SelectItem key={card.id} value={card.id}>{card.name} - {card.bank}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
            )}

            {(paymentMethod === 'credit-card' || paymentMethod === 'credit') && (
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="installmentsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuotas</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej: 12" {...field} />
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
                      <FormLabel>Tasa de Interés (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej: 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">{expenseToEdit ? 'Guardar Cambios' : 'Agregar Gasto'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
