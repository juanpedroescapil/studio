export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  paymentMethod: 'cash' | 'credit-card' | 'credit';
  installments?: {
    count: number;
    interestRate: number;
    monthlyPayment: number;
  };
  // Internal properties for expanded expenses
  originalId?: string;
  isInstallment?: boolean;
};

export type Category = 'Comida' | 'Transporte' | 'Vivienda' | 'Entretenimiento' | 'Compras' | 'Servicios' | 'Salud' | 'Otros' | 'Préstamos';

export const categories: Category[] = ['Comida', 'Transporte', 'Vivienda', 'Entretenimiento', 'Compras', 'Servicios', 'Salud', 'Préstamos', 'Otros'];
