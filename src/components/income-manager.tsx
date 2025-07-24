'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CalendarIcon, MoreHorizontal, Edit, Trash2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  source: string;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
  originalId?: string; // Para ingresos recurrentes generados
}

interface IncomeManagerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  incomes: Income[];
  onIncomesChange: (incomes: Income[]) => void;
}

export function IncomeManager({ isOpen, onOpenChange, incomes, onIncomesChange }: IncomeManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date(),
    category: '',
    source: '',
    isRecurring: false,
    recurringFrequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly'
  });

  const incomeCategories = [
    'Salario',
    'Freelance',
    'Inversiones',
    'Negocios',
    'Alquileres',
    'Otros'
  ];

  const incomeSources = [
    'Trabajo Principal',
    'Trabajo Secundario',
    'Proyectos Independientes',
    'Rendimientos',
    'Propiedades',
    'Otros'
  ];

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date(),
      category: '',
      source: '',
      isRecurring: false,
      recurringFrequency: 'monthly'
    });
    setEditingIncome(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) return;

    const incomeData = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category,
      source: formData.source,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.recurringFrequency
    };

    try {
      if (editingIncome) {
        // Actualizar ingreso existente
        const response = await fetch(`http://localhost:4000/api/incomes/${editingIncome.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(incomeData)
        });

        if (!response.ok) throw new Error('Error al actualizar el ingreso');

        const updatedIncome = await response.json();
        onIncomesChange(incomes.map(inc => inc.id === editingIncome.id ? updatedIncome : inc));
      } else {
        // Crear nuevo ingreso
        const response = await fetch('http://localhost:4000/api/incomes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(incomeData)
        });

        if (!response.ok) throw new Error('Error al crear el ingreso');

        const newIncome = await response.json();
        onIncomesChange([...incomes, newIncome]);
      }

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el ingreso');
    }
  };

  const handleDelete = async (incomeId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/api/incomes/${incomeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar el ingreso');

      onIncomesChange(incomes.filter(inc => inc.id !== incomeId));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el ingreso');
    }
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      description: income.description,
      amount: income.amount.toString(),
      date: new Date(income.date),
      category: income.category,
      source: income.source,
      isRecurring: income.isRecurring,
      recurringFrequency: income.recurringFrequency || 'monthly'
    });
    setIsAddDialogOpen(true);
  };

  // Calcular total de ingresos
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Agrupar ingresos por categoría
  const incomeByCategory = incomes.reduce((acc, income) => {
    if (!acc[income.category]) {
      acc[income.category] = 0;
    }
    acc[income.category] += income.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Resumen de ingresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {incomes.length} ingreso{incomes.length !== 1 ? 's' : ''} registrado{incomes.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desglose por Categoría</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between text-sm">
                  <span>{category}</span>
                  <span className="font-mono">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón agregar ingreso */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ingresos Registrados</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ingreso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? 'Editar Ingreso' : 'Agregar Nuevo Ingreso'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ej: Salario mensual"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {incomeCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Fuente</Label>
                  <select
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Seleccionar fuente</option>
                    {incomeSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    />
                    <Label htmlFor="isRecurring">Ingreso recurrente</Label>
                  </div>
                  {formData.isRecurring && (
                    <select
                      value={formData.recurringFrequency}
                      onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value as 'monthly' | 'quarterly' | 'yearly' })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="monthly">Mensual</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="yearly">Anual</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingIncome ? 'Actualizar' : 'Agregar'} Ingreso
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de ingresos */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.length > 0 ? (
              incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium">
                    {income.originalId ? (
                      <span className="text-gray-500 italic">{income.description} (Recurrente)</span>
                    ) : (
                      income.description
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{income.category}</Badge>
                  </TableCell>
                  <TableCell>{income.source}</TableCell>
                  <TableCell>{format(new Date(income.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {income.originalId ? (
                      <Badge variant="secondary" className="text-xs">Generado</Badge>
                    ) : income.isRecurring ? (
                      <Badge variant="secondary" className="text-xs">
                        {income.recurringFrequency === 'monthly' ? 'Mensual' :
                         income.recurringFrequency === 'quarterly' ? 'Trimestral' :
                         income.recurringFrequency === 'yearly' ? 'Anual' : 'Recurrente'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Único</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">${income.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!income.originalId && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(income)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(income.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </>
                        )}
                        {income.originalId && (
                          <DropdownMenuItem disabled className="text-gray-400">
                            <span className="text-xs">Ingreso generado automáticamente</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron ingresos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 