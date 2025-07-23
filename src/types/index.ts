export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  paymentMethod: 'cash' | 'credit-card';
  installments?: {
    count: number;
    interestRate: number;
    monthlyPayment: number;
  };
};

export type Category = 'Food' | 'Transport' | 'Housing' | 'Entertainment' | 'Shopping' | 'Utilities' | 'Health' | 'Other';

export const categories: Category[] = ['Food', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Other'];
