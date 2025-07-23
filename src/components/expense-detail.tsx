"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Expense, CreditCard } from "@/types";
import { format } from "date-fns";
import {
  Banknote,
  Car,
  CreditCard as CreditCardIcon,
  HeartPulse,
  Home,
  PiggyBank,
  ShoppingCart,
  Tv,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";

type ExpenseDetailProps = {
  expense: Expense;
  creditCard?: CreditCard;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const categoryIcons: { [key: string]: React.ReactNode } = {
  Comida: <Utensils className="h-4 w-4" />,
  Compras: <ShoppingCart className="h-4 w-4" />,
  Vivienda: <Home className="h-4 w-4" />,
  Transporte: <Car className="h-4 w-4" />,
  Entretenimiento: <Tv className="h-4 w-4" />,
  Salud: <HeartPulse className="h-4 w-4" />,
  Servicios: <Zap className="h-4 w-4" />,
  Préstamos: <PiggyBank className="h-4 w-4" />,
  Otros: <div className="h-4 w-4" />,
};

export function ExpenseDetail({
  expense,
  creditCard,
  isOpen,
  onOpenChange,
}: ExpenseDetailProps) {
  if (!expense) return null;

  const getPaymentMethod = () => {
    switch (expense.paymentMethod) {
      case 'cash':
        return { icon: <Wallet className="h-4 w-4 text-green-600" />, label: 'Efectivo' };
      case 'credit-card':
        const cardLabel = creditCard ? `${creditCard.name} (${creditCard.bank})` : 'Tarjeta de Crédito';
        return { icon: <CreditCardIcon className="h-4 w-4 text-blue-600" />, label: cardLabel };
      case 'credit':
        return { icon: <Banknote className="h-4 w-4 text-purple-600" />, label: 'Crédito' };
      default:
        return { icon: null, label: '' };
    }
  };

  const paymentMethodDetails = getPaymentMethod();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles del Gasto</DialogTitle>
          <DialogDescription>
            Información detallada sobre tu gasto.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Descripción</span>
            <span className="font-medium">{expense.description}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Monto</span>
            <span className="font-bold text-lg">
              ${expense.amount.toFixed(2)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Fecha</span>
            <span className="font-medium">
              {format(expense.date, "PPP")}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Categoría</span>
            <Badge variant="outline" className="flex items-center gap-2">
              {categoryIcons[expense.category]}
              {expense.category}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Método de Pago</span>
            <div className="flex items-center gap-2">
              {paymentMethodDetails.icon}
              <span className="capitalize">{paymentMethodDetails.label}</span>
            </div>
          </div>
          {(expense.paymentMethod === 'credit-card' || expense.paymentMethod === 'credit') && expense.installments && expense.installments.count > 1 && (
            <>
              <Separator />
              <div className="space-y-2">
                  <h4 className="font-medium">Detalles de Cuotas</h4>
                  <div className="flex justify-between items-center pl-4">
                      <span className="text-muted-foreground">Cuotas</span>
                      <span className="font-medium">{expense.installments.count}</span>
                  </div>
                   <div className="flex justify-between items-center pl-4">
                      <span className="text-muted-foreground">Tasa de Interés</span>
                      <span className="font-medium">{expense.installments.interestRate}%</span>
                  </div>
                   <div className="flex justify-between items-center pl-4">
                      <span className="text-muted-foreground">Pago Mensual</span>
                      <span className="font-medium">${expense.installments.monthlyPayment.toFixed(2)}</span>
                  </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
