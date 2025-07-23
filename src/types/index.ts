export type CreditCard = {
  id: string;
  name: string;
  bank: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  paymentMethod: 'cash' | 'credit-card' | 'credit';
  creditCardId?: string; 
  installments?: {
    count: number;
    interestRate: number;
    monthlyPayment: number;
  };
  originalId?: string;
  isInstallment?: boolean;
};

export type Category = string;

export const categories: Category[] = ['Comida', 'Transporte', 'Vivienda', 'Entretenimiento', 'Compras', 'Servicios', 'Salud', 'Préstamos', 'Otros'];
