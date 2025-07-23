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
import { Expense } from "@/types";
import { format } from "date-fns";
import {
  Car,
  CreditCard,
  HeartPulse,
  Home,
  ShoppingCart,
  Tv,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";

type ExpenseDetailProps = {
  expense: Expense;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const categoryIcons: { [key: string]: React.ReactNode } = {
  Food: <Utensils className="h-4 w-4" />,
  Shopping: <ShoppingCart className="h-4 w-4" />,
  Housing: <Home className="h-4 w-4" />,
  Transport: <Car className="h-4 w-4" />,
  Entertainment: <Tv className="h-4 w-4" />,
  Health: <HeartPulse className="h-4 w-4" />,
  Utilities: <Zap className="h-4 w-4" />,
  Other: <div className="h-4 w-4" />,
};

export function ExpenseDetail({
  expense,
  isOpen,
  onOpenChange,
}: ExpenseDetailProps) {
  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogDescription>
            Detailed information about your expense.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Description</span>
            <span className="font-medium">{expense.description}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-lg">
              ${expense.amount.toFixed(2)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">
              {format(expense.date, "PPP")}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Category</span>
            <Badge variant="outline" className="flex items-center gap-2">
              {categoryIcons[expense.category]}
              {expense.category}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Payment Method</span>
            <div className="flex items-center gap-2">
              {expense.paymentMethod === "cash" ? (
                <Wallet className="h-4 w-4 text-green-600" />
              ) : (
                <CreditCard className="h-4 w-4 text-blue-600" />
              )}
              <span className="capitalize">
                {expense.paymentMethod.replace("-", " ")}
              </span>
            </div>
          </div>
          {expense.installments && expense.installments.count > 1 && (
            <>
              <Separator />
              <div className="space-y-2">
                  <h4 className="font-medium">Installment Details</h4>
                  <div className="flex justify-between items-center pl-4">
                      <span className="text-muted-foreground">Installments</span>
                      <span className="font-medium">{expense.installments.count}</span>
                  </div>
                   <div className="flex justify-between items-center pl-4">
                      <span className="text-muted-foreground">Interest Rate</span>
                      <span className="font-medium">{expense.installments.interestRate}%</span>
                  </div>
                   <div className="flex justify-between items-center pl-4">
                      <span className="text-muted-foreground">Monthly Payment</span>
                      <span className="font-medium">${expense.installments.monthlyPayment.toFixed(2)}</span>
                  </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
