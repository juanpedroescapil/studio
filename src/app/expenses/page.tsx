'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, LogOut, User, Filter, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Expense, Category } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  // Cargar datos del backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Cargar gastos
      fetch('http://localhost:4000/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        console.log('Datos de gastos recibidos del backend:', data);
        setExpenses(data);
      })
      .catch(error => {
        console.error('Error cargando gastos:', error);
      });

      // Cargar categorías
      fetch('http://localhost:4000/api/categories')
      .then(r => r.json())
      .then(data => {
        console.log('Categorías cargadas:', data);
        setCategories(data);
      })
      .catch(error => {
        console.error('Error cargando categorías:', error);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      router.push('/');
    }
  }, [router]);

  // Obtener meses disponibles
  const getAvailableMonths = () => {
    const months = new Set<string>();
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  // Obtener categorías disponibles
  const getAvailableCategories = () => {
    const categories = new Set<string>();
    expenses.forEach(expense => {
      const category = typeof expense.category === 'string' ? expense.category : expense.category?.name || 'Otros';
      categories.add(category);
    });
    return Array.from(categories).sort();
  };

  // Filtrar gastos
  const filteredExpenses = expenses.filter(expense => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const category = typeof expense.category === 'string' ? expense.category : expense.category?.name || 'Otros';
    
    const monthMatch = selectedMonth === 'all' || monthKey === selectedMonth;
    const paymentMatch = selectedPaymentMethod === 'all' || expense.paymentMethod === selectedPaymentMethod;
    const categoryMatch = selectedCategory === 'all' || category === selectedCategory;
    
    return monthMatch && paymentMatch && categoryMatch;
  });

  // Calcular totales
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleEdit = (expenseId: string) => {
    router.push(`/edit-expense/${expenseId}`);
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        // Recargar gastos
        const updatedExpenses = expenses.filter(expense => String(expense.id) !== expenseId);
        setExpenses(updatedExpenses);
      } else {
        alert('Error al eliminar el gasto');
      }
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      alert('Error al eliminar el gasto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button onClick={() => router.push('/dashboard')} variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Historial de Gastos</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={() => router.push('/add-expense')} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Agregar Gasto</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filtros */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          {/* Filtro de Meses */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos los meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              {getAvailableMonths().map((month) => {
                const [year, monthNum] = month.split('-');
                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                return (
                  <SelectItem key={month} value={month}>
                    {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Filtro de Método de Pago */}
          <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos los métodos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los métodos</SelectItem>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="credit-card">Tarjeta de Crédito</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de Categoría */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {getAvailableCategories().map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resumen */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${totalExpenses.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Filtrado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredExpenses.length}
                  </div>
                  <div className="text-sm text-gray-500">Gastos Mostrados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => {
                  const category = typeof expense.category === 'string' ? expense.category : expense.category?.name || 'Otros';
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {expense.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const categoryData = categories.find(cat => cat.name === category);
                            return (
                              <>
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: categoryData?.color || '#3B82F6' }}
                                />
                                <Badge variant="outline">{category}</Badge>
                              </>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={expense.paymentMethod === 'credit-card' ? 'default' : 'secondary'}>
                          {expense.paymentMethod === 'credit-card' ? 'Tarjeta' : 'Efectivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold">
                        ${expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(expense.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron gastos con los filtros seleccionados
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 