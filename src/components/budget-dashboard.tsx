'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CreditCard as CreditCardIcon, DollarSign, Plus, Settings, Menu, User, LogOut, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ExpenseForm } from './expense-form';
import { ExpenseTable } from './expense-table';
import { CreditCardManager } from './credit-card-manager';
import { CategoryManager } from './category-manager';
import { IncomeManager, Income } from './income-manager';
import { ExpenseDetail } from './expense-detail';
import { Expense, Category, CreditCard } from '@/types';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface BudgetDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function BudgetDashboard({ user, onLogout }: BudgetDashboardProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isCreditCardManagerOpen, setCreditCardManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [isIncomeManagerOpen, setIsIncomeManagerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isExpenseDetailOpen, setIsExpenseDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const t = token;

    // Cargar gastos
    fetch('http://localhost:4000/api/expenses', {
      headers: { Authorization: `Bearer ${t}` }
    })
    .then(r => r.json())
    .then(data => {
      console.log('Gastos recibidos:', data);
      setExpenses(data);
    })
    .catch(error => {
      console.error('Error loading expenses:', error);
    });

    // Cargar categorías
    fetch('http://localhost:4000/api/categories', {
      headers: { Authorization: `Bearer ${t}` }
    })
    .then(r => r.json())
    .then(data => {
      console.log('Categorías recibidas:', data);
      setCategories(data);
    })
    .catch(error => {
      console.error('Error loading categories:', error);
    });

    // Cargar tarjetas de crédito del backend
    fetch('http://localhost:4000/api/creditcards', {
      headers: { Authorization: `Bearer ${t}` }
    })
    .then(r => r.json())
    .then(data => {
      console.log('Tarjetas de crédito recibidas:', data);
      setCreditCards(data);
    })
    .catch(error => {
      console.error('Error loading credit cards:', error);
    });

    // Cargar ingresos del backend
    fetch('http://localhost:4000/api/incomes', {
      headers: { Authorization: `Bearer ${t}` }
    })
    .then(r => r.json())
    .then(data => {
      console.log('Ingresos recibidos del backend:', data);
      console.log('Tipo de data:', typeof data);
      console.log('Es array:', Array.isArray(data));
      
      // Asegurar que data sea un array
      const incomesArray = Array.isArray(data) ? data : [];
      console.log('Ingresos procesados:', incomesArray);
      console.log('Ingresos recurrentes encontrados:', incomesArray.filter(inc => inc.isRecurring));
      
      setIncomes(incomesArray);
    })
    .catch(error => {
      console.error('Error loading incomes:', error);
      setIncomes([]); // En caso de error, establecer como array vacío
    });

    setLoading(false);
  }, []);

  // Tarjetas de crédito iniciales (fallback)
  const initialCreditCards: CreditCard[] = [
    { id: 1, name: 'Visa Signature', number: '1234567890123456' },
    { id: 2, name: 'Mastercard Gold', number: '9876543210987654' },
  ];

  // Generar cuotas futuras para gastos con tarjeta de crédito
  const generateInstallmentExpenses = useMemo(() => {
    const installmentExpenses: Expense[] = [];
    
    console.log('Generando cuotas para gastos:', expenses);
    
    expenses.forEach(expense => {
      console.log('Procesando gasto:', expense.id, expense.description, expense.paymentMethod, expense.installmentsCount, expense.monthlyPayment);
      
      if (expense.paymentMethod === 'credit-card' && 
          expense.installmentsCount && 
          expense.installmentsCount > 1 && 
          expense.monthlyPayment) {
        
        const startDate = new Date(expense.date);
        console.log('Gasto con cuotas:', expense.description, 'Cuotas:', expense.installmentsCount, 'Monto mensual:', expense.monthlyPayment);
        
        // Generar TODAS las cuotas, incluyendo la primera
        for (let i = 0; i < expense.installmentsCount; i++) {
          const installmentDate = new Date(startDate);
          installmentDate.setMonth(installmentDate.getMonth() + i);
          
          const installmentExpense: Expense = {
            ...expense,
            id: `${expense.id}-installment-${i + 1}`,
            amount: expense.monthlyPayment,
            date: installmentDate,
            isInstallment: true,
            installmentNumber: i + 1,
            totalInstallments: expense.installmentsCount,
            originalId: expense.id
          };
          
          console.log('Cuota generada:', installmentExpense.id, 'Fecha original:', startDate.toISOString(), 'Fecha cuota:', installmentDate.toISOString(), 'Monto:', expense.monthlyPayment);
          installmentExpenses.push(installmentExpense);
        }
      }
    });
    
    console.log('Total de cuotas generadas:', installmentExpenses.length);
    return installmentExpenses;
  }, [expenses]);

  // Generar ingresos recurrentes futuros
  const generateRecurringIncomes = useMemo(() => {
    const recurringIncomes: Income[] = [];
    
    console.log('=== GENERANDO INGRESOS RECURRENTES ===');
    console.log('Ingresos totales:', incomes);
    console.log('Tipo de incomes:', typeof incomes);
    console.log('Es array:', Array.isArray(incomes));
    
    if (!Array.isArray(incomes)) {
      console.log('Incomes no es un array, retornando array vacío');
      return recurringIncomes;
    }
    
    console.log('Cantidad de ingresos a procesar:', incomes.length);
    
    incomes.forEach((income, index) => {
      console.log(`Procesando ingreso ${index + 1}/${incomes.length}:`, {
        id: income.id,
        description: income.description,
        isRecurring: income.isRecurring,
        recurringFrequency: income.recurringFrequency,
        date: income.date
      });
      
      if (income.isRecurring && income.recurringFrequency) {
        const startDate = new Date(income.date);
        const currentDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 2); // Generar ingresos por 2 años
        
        console.log('Ingreso recurrente:', income.description, 'Frecuencia:', income.recurringFrequency, 'Fecha inicio:', startDate.toISOString());
        
        let currentRecurringDate = new Date(startDate);
        
        // Generar ingresos recurrentes hasta 2 años en el futuro
        while (currentRecurringDate <= endDate) {
          // Calcular la siguiente fecha según la frecuencia ANTES de generar
          let nextDate = new Date(currentRecurringDate);
          switch (income.recurringFrequency) {
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
            case 'quarterly':
              nextDate.setMonth(nextDate.getMonth() + 3);
              break;
            case 'yearly':
              nextDate.setFullYear(nextDate.getFullYear() + 1);
              break;
          }
          
          // Solo generar ingresos futuros (después de la fecha original)
          if (currentRecurringDate > startDate) {
            const recurringIncome: Income = {
              ...income,
              id: `${income.id}-recurring-${currentRecurringDate.getTime()}`,
              date: currentRecurringDate,
              isRecurring: true,
              originalId: income.id
            };
            
            console.log('Ingreso recurrente generado:', recurringIncome.id, 'Fecha original:', startDate.toISOString(), 'Fecha recurrente:', currentRecurringDate.toISOString(), 'Monto:', income.amount);
            recurringIncomes.push(recurringIncome);
          }
          
          // Actualizar la fecha para la siguiente iteración
          currentRecurringDate = nextDate;
        }
      }
    });
    
    console.log('Total de ingresos recurrentes generados:', recurringIncomes.length);
    console.log('Detalle de ingresos recurrentes generados:', recurringIncomes.map(inc => ({
      id: inc.id,
      description: inc.description,
      date: inc.date,
      amount: inc.amount,
      originalId: inc.originalId
    })));
    return recurringIncomes;
  }, [incomes]);

  // Filtrar gastos por mes seleccionado (incluyendo cuotas futuras)
  const filteredExpenses = useMemo(() => {
    if (selectedMonth === 'all') {
      console.log('Mostrando todos los gastos (sin filtro por mes)');
      return expenses;
    }
    
    console.log('=== FILTRADO POR MES ===');
    console.log('Mes seleccionado:', selectedMonth);
    console.log('Gastos originales:', expenses.length);
    console.log('Cuotas generadas:', generateInstallmentExpenses.length);
    
    // Para un mes específico, mostrar solo los gastos que corresponden a ese mes
    const allExpenses = [...expenses, ...generateInstallmentExpenses];
    
    const filtered = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      const matches = expenseMonth === selectedMonth;
      
      console.log(`Gasto ${expense.id}: ${expense.description} - Fecha: ${expenseDate.toISOString()} - Mes calculado: ${expenseMonth} - Mes seleccionado: ${selectedMonth} - Coincide: ${matches} - Tipo: ${expense.isInstallment ? 'CUOTA' : 'ORIGINAL'} - Monto: ${expense.amount}`);
      
      return matches;
    });

    // Si estamos filtrando por un mes específico, excluir gastos originales con cuotas
    // porque ya están representados por sus cuotas individuales
    const finalFiltered = filtered.filter(expense => {
      // Si es un gasto original con cuotas, excluirlo cuando filtramos por mes
      if (!expense.isInstallment && expense.installmentsCount && expense.installmentsCount > 1) {
        console.log(`Excluyendo gasto original con cuotas: ${expense.id} - ${expense.description}`);
        return false;
      }
      return true;
    });

    console.log('Gastos que coinciden con el mes:', filtered.length);
    console.log('Gastos finales (excluyendo originales con cuotas):', finalFiltered.length);
    console.log('Detalle de gastos filtrados:', finalFiltered.map(e => ({
      id: e.id,
      description: e.description,
      amount: e.amount,
      isInstallment: e.isInstallment,
      date: e.date,
      installmentsCount: e.installmentsCount
    })));
    
    return finalFiltered;
  }, [expenses, generateInstallmentExpenses, selectedMonth]);

  // Agrupar gastos por mes para la tabla
  const groupedExpenses = useMemo(() => {
    const grouped: Record<string, { expenses: Expense[]; subtotal: number }> = {};
    
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = format(date, 'MMMM yyyy', { locale: es });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = { expenses: [], subtotal: 0 };
      }
      
      grouped[monthKey].expenses.push(expense);
      grouped[monthKey].subtotal += expense.amount;
      
      console.log('Agregando gasto al grupo:', monthKey, expense.id, expense.description, expense.amount, expense.isInstallment ? '(CUOTA)' : '(ORIGINAL)');
    });
    
    // Ordenar por fecha (más reciente primero)
    const sortedGrouped: Record<string, { expenses: Expense[]; subtotal: number }> = {};
    Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(grouped[a].expenses[0]?.date || 0);
        const dateB = new Date(grouped[b].expenses[0]?.date || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .forEach(key => {
        sortedGrouped[key] = grouped[key];
      });
    
    console.log('Grupos finales:', Object.keys(sortedGrouped));
    return sortedGrouped;
  }, [filteredExpenses]);

  // Calcular totales
  const totalExpenses = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => {
      const amount = expense.amount;
      console.log('Sumando gasto:', expense.id, expense.description, amount, expense.isInstallment ? '(CUOTA)' : '(ORIGINAL)');
      return sum + amount;
    }, 0);
    
    console.log('Total calculado:', total);
    return total;
  }, [filteredExpenses]);

  const cashExpenses = useMemo(() => {
    return filteredExpenses
      .filter(expense => expense.paymentMethod === 'cash')
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const creditCardExpenses = useMemo(() => {
    const creditExpenses = filteredExpenses.filter(expense => expense.paymentMethod === 'credit-card');
    console.log('Gastos con tarjeta filtrados:', creditExpenses.length);
    
    const total = creditExpenses.reduce((sum, expense) => {
      const amount = expense.amount;
      console.log('Sumando gasto con tarjeta:', expense.id, expense.description, amount, expense.isInstallment ? '(CUOTA)' : '(ORIGINAL)');
      return sum + amount;
    }, 0);
    
    console.log('Total gastos con tarjeta:', total);
    return total;
  }, [filteredExpenses]);

  // Calcular subtotales por tarjeta de crédito
  const creditCardSubtotals = useMemo(() => {
    const subtotals: { [cardName: string]: { total: number; count: number } } = {};
    
    filteredExpenses.forEach(expense => {
      if (expense.paymentMethod === 'credit-card' && expense.creditCardId) {
        const card = creditCards.find(c => c.id.toString() === expense.creditCardId?.toString());
        if (card) {
          const cardName = card.name;
          if (!subtotals[cardName]) {
            subtotals[cardName] = { total: 0, count: 0 };
          }
          // Si es una cuota, usar el monto mensual; si es un gasto original, usar el monto total
          const amount = expense.isInstallment ? expense.amount : expense.amount;
          subtotals[cardName].total += amount;
          subtotals[cardName].count += 1;
        }
      }
    });
    
    return subtotals;
  }, [filteredExpenses, creditCards]);

  // Calcular subtotales por categoría para gastos en efectivo
  const cashExpensesSubtotals = useMemo(() => {
    const subtotals: { [categoryName: string]: { total: number; count: number } } = {};
    
    filteredExpenses.forEach(expense => {
      if (expense.paymentMethod === 'cash') {
        const categoryName = typeof expense.category === 'string' ? expense.category : expense.category.name;
        if (!subtotals[categoryName]) {
          subtotals[categoryName] = { total: 0, count: 0 };
        }
        subtotals[categoryName].total += expense.amount;
        subtotals[categoryName].count += 1;
      }
    });
    
    return subtotals;
  }, [filteredExpenses]);

  // Filtrar ingresos por mes seleccionado (incluyendo ingresos recurrentes generados)
  const filteredIncomes = useMemo(() => {
    console.log('=== FILTRANDO INGRESOS ===');
    console.log('Ingresos originales:', incomes);
    console.log('Ingresos recurrentes generados:', generateRecurringIncomes);
    
    // Asegurar que incomes sea un array
    if (!Array.isArray(incomes)) {
      console.log('Incomes no es un array, retornando array vacío');
      return [];
    }
    
    // Combinar ingresos originales con ingresos recurrentes generados
    const allIncomes = [...incomes, ...generateRecurringIncomes];
    console.log('Todos los ingresos combinados:', allIncomes);
    
    if (selectedMonth === 'all') {
      console.log('Mostrando todos los ingresos (sin filtro por mes)');
      return allIncomes;
    }
    
    const filtered = allIncomes.filter(income => {
      const incomeDate = new Date(income.date);
      const incomeMonth = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`;
      const matches = incomeMonth === selectedMonth;
      
      console.log(`Ingreso ${income.id}: ${income.description} - Fecha: ${incomeDate.toISOString()} - Mes calculado: ${incomeMonth} - Mes seleccionado: ${selectedMonth} - Coincide: ${matches} - Tipo: ${income.originalId ? 'RECURRENTE' : 'ORIGINAL'}`);
      
      return matches;
    });

    console.log('Ingresos filtrados finales:', filtered);
    console.log('Cantidad de ingresos filtrados:', filtered.length);
    
    return filtered;
  }, [incomes, generateRecurringIncomes, selectedMonth]);

  // Calcular total de ingresos filtrados
  const totalIncomes = useMemo(() => {
    // Validación adicional para asegurar que filteredIncomes sea un array
    if (!Array.isArray(filteredIncomes)) {
      console.warn('filteredIncomes no es un array:', filteredIncomes);
      return 0;
    }
    return filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  }, [filteredIncomes]);

  // Calcular balance (ingresos - gastos)
  const balance = useMemo(() => {
    return totalIncomes - totalExpenses;
  }, [totalIncomes, totalExpenses]);

  // Obtener meses disponibles (incluyendo meses de cuotas futuras e ingresos recurrentes)
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    const allExpenses = [...expenses, ...generateInstallmentExpenses];
    const allIncomes = [...incomes, ...generateRecurringIncomes];
    
    allExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(month);
    });

    // Validar que allIncomes sea un array antes de iterarlo
    if (Array.isArray(allIncomes)) {
      allIncomes.forEach(income => {
        const date = new Date(income.date);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(month);
      });
    }
    
    return Array.from(months).sort().reverse();
  }, [expenses, generateInstallmentExpenses, incomes, generateRecurringIncomes]);

  const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Creando nuevo gasto:', newExpense);

      const response = await fetch('http://localhost:4000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: newExpense.amount,
          description: newExpense.description,
          date: newExpense.date,
          categoryId: typeof newExpense.category === 'string' 
            ? categories.find(c => c.name === newExpense.category)?.id 
            : newExpense.category.id,
          creditCardId: newExpense.creditCardId,
          paymentMethod: newExpense.paymentMethod,
          installmentsCount: newExpense.installmentsCount,
          interestRate: newExpense.interestRate,
          monthlyPayment: newExpense.monthlyPayment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al crear el gasto: ${errorData.error || response.statusText}`);
      }

      const createdExpense = await response.json();
      console.log('Gasto creado exitosamente:', createdExpense);
      
      setExpenses(prev => [...prev, createdExpense]);
      setIsExpenseFormOpen(false);
    } catch (error) {
      console.error('Error creating expense:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al crear el gasto: ${errorMessage}`);
    }
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Actualizando gasto:', updatedExpense);

      const response = await fetch(`http://localhost:4000/api/expenses/${updatedExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: updatedExpense.amount,
          description: updatedExpense.description,
          date: updatedExpense.date,
          categoryId: typeof updatedExpense.category === 'string' 
            ? categories.find(c => c.name === updatedExpense.category)?.id 
            : updatedExpense.category.id,
          creditCardId: updatedExpense.creditCardId,
          paymentMethod: updatedExpense.paymentMethod,
          installmentsCount: updatedExpense.installmentsCount,
          interestRate: updatedExpense.interestRate,
          monthlyPayment: updatedExpense.monthlyPayment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al actualizar el gasto: ${errorData.error || response.statusText}`);
      }

      console.log('Gasto actualizado exitosamente en el backend');

      // Actualizar el estado local inmediatamente
      setExpenses(prev => {
        const updated = prev.map(exp => 
          exp.id === updatedExpense.id 
            ? { ...exp, ...updatedExpense }
            : exp
        );
        console.log('Estado anterior:', prev);
        console.log('Estado actualizado:', updated);
        return updated;
      });

      setEditingExpense(null);
      setIsExpenseFormOpen(false);
      
      console.log('Estado local actualizado');
    } catch (error) {
      console.error('Error updating expense:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al actualizar el gasto: ${errorMessage}`);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:4000/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el gasto');
      }

      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Aquí podrías mostrar un toast de error
    }
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsExpenseDetailOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseFormOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground">Gestor de Gastos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-secondary">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user.name || user.email}</span>
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{user.name || user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCategoryManagerOpen(true)} className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Gestionar Categorías</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCreditCardManagerOpen(true)} className="flex items-center space-x-2">
                    <CreditCardIcon className="h-4 w-4" />
                    <span>Gestionar Tarjetas</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsIncomeManagerOpen(true)} className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Gestionar Ingresos</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="flex items-center space-x-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y botón agregar gasto */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-foreground">Mes:</span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                {availableMonths.map(month => {
                  const [year, monthNum] = month.split('-');
                  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                  return (
                    <SelectItem key={month} value={month}>
                      {format(date, 'MMMM yyyy', { locale: es })}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
                      <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Gasto
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}
                </DialogTitle>
              </DialogHeader>
              <ExpenseForm
                isOpen={isExpenseFormOpen}
                onOpenChange={setIsExpenseFormOpen}
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                expenseToEdit={editingExpense || undefined}
                categories={categories}
                creditCards={creditCards}
                onCategoryAdded={(categoryName) => {
                  // Handle category added if needed
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-destructive break-words">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {selectedMonth !== 'all' ? `En ${format(new Date(selectedMonth + '-01T00:00:00'), 'MMMM yyyy', { locale: es })}` : 'Todos los meses'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-chart-1 break-words">${totalIncomes.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {selectedMonth !== 'all' ? `En ${format(new Date(selectedMonth + '-01T00:00:00'), 'MMMM yyyy', { locale: es })}` : 'Todos los meses'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-bold ${balance >= 0 ? 'text-chart-1' : 'text-destructive'} break-words`}>
                ${balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {balance >= 0 ? 'Superávit' : 'Déficit'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos en Efectivo</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-chart-2 break-words">${cashExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Pagado con efectivo</p>
              {Object.keys(cashExpensesSubtotals).length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Desglose por categoría:</div>
                  {Object.entries(cashExpensesSubtotals).map(([categoryName, data]) => (
                    <div key={categoryName} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: categories?.find(c => c.name === categoryName)?.color || '#6b7280' 
                          }}
                        />
                        <span className="truncate">{categoryName}</span>
                      </span>
                      <span className="font-mono">${data.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos con Tarjeta</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-chart-4 break-words">${creditCardExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Pagado con tarjeta</p>
              {Object.keys(creditCardSubtotals).length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Desglose por tarjeta:</div>
                  {Object.entries(creditCardSubtotals).map(([cardName, data]) => (
                    <div key={cardName} className="flex items-center justify-between text-xs">
                      <span className="truncate">{cardName}</span>
                      <span className="font-mono">${data.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>



        {/* Tabla de gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Gastos</CardTitle>
            <CardDescription>
              {selectedMonth !== 'all'
                ? `Gastos de ${format(new Date(selectedMonth + '-01T00:00:00'), 'MMMM yyyy', { locale: es })}`
                : 'Todos los gastos registrados'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseTable
              groupedExpenses={groupedExpenses}
              creditCards={creditCards}
              onEdit={handleEditExpense}
              onDelete={(id) => handleDeleteExpense(id)}
              onView={handleExpenseClick}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalle de gasto */}
      <Dialog open={isExpenseDetailOpen} onOpenChange={setIsExpenseDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Gasto</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <ExpenseDetail
              expense={selectedExpense}
              creditCard={creditCards.find(c => c.id.toString() === selectedExpense.creditCardId)}
              isOpen={isExpenseDetailOpen}
              onOpenChange={setIsExpenseDetailOpen}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de gestión de tarjetas de crédito */}
      <Dialog open={isCreditCardManagerOpen} onOpenChange={setCreditCardManagerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestionar Tarjetas de Crédito</DialogTitle>
          </DialogHeader>
          <CreditCardManager
            isOpen={isCreditCardManagerOpen}
            onOpenChange={setCreditCardManagerOpen}
            creditCards={creditCards}
            onCreditCardsChange={setCreditCards}
            userId={user.id}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de gestión de categorías */}
      <Dialog open={isCategoryManagerOpen} onOpenChange={setCategoryManagerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestionar Categorías</DialogTitle>
          </DialogHeader>
          <CategoryManager
            isOpen={isCategoryManagerOpen}
            onOpenChange={setCategoryManagerOpen}
            categories={categories}
            onCategoriesChange={setCategories}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de gestión de ingresos */}
      <Dialog open={isIncomeManagerOpen} onOpenChange={setIsIncomeManagerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gestionar Ingresos</DialogTitle>
          </DialogHeader>
          <IncomeManager
            isOpen={isIncomeManagerOpen}
            onOpenChange={setIsIncomeManagerOpen}
            incomes={incomes}
            onIncomesChange={setIncomes}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 