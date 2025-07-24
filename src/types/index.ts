export type CreditCard = {
  id: number;
  name: string;
  number: string;
  userId?: number;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string | { name: string; id?: number };
  paymentMethod: 'cash' | 'credit-card' | 'credit';
  creditCardId?: string; 
  installmentsCount?: number;
  interestRate?: number;
  monthlyPayment?: number;
  originalId?: string;
  isInstallment?: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  isFutureMonth?: boolean;
};

export type Category = {
  id: number;
  name: string;
  color: string;
};

export const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Comida', color: '#EF4444' },
  { name: 'Transporte', color: '#3B82F6' },
  { name: 'Vivienda', color: '#10B981' },
  { name: 'Entretenimiento', color: '#F59E0B' },
  { name: 'Compras', color: '#8B5CF6' },
  { name: 'Servicios', color: '#06B6D4' },
  { name: 'Salud', color: '#EC4899' },
  { name: 'Préstamos', color: '#F97316' },
  { name: 'Otros', color: '#6B7280' }
];
