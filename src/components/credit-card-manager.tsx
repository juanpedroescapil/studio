
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Save, Loader2 } from "lucide-react";
import { CreditCard } from '@/types';
import { useToast } from '@/hooks/use-toast';

type CreditCardManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  creditCards: CreditCard[];
  onCreditCardsChange: (creditCards: CreditCard[]) => void;
  userId: number;
};

export function CreditCardManager({ isOpen, onOpenChange, creditCards, onCreditCardsChange, userId }: CreditCardManagerProps) {
  const [newCardName, setNewCardName] = useState("");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingNumber, setEditingNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const token = localStorage.getItem('token');

  const handleAddCard = async () => {
    if (!newCardName.trim() || !newCardNumber.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/creditcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
        name: newCardName.trim(),
          number: newCardNumber.trim(),
          userId: userId
        })
      });

      if (response.ok) {
        const newCard = await response.json();
      onCreditCardsChange([...creditCards, newCard]);
      setNewCardName("");
        setNewCardNumber("");
        toast({
          title: "Éxito",
          description: "Tarjeta agregada correctamente",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Error al agregar la tarjeta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/creditcards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
    onCreditCardsChange(creditCards.filter(c => c.id !== cardId));
        toast({
          title: "Éxito",
          description: "Tarjeta eliminada correctamente",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Error al eliminar la tarjeta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartEditing = (card: CreditCard) => {
    setEditingCard(card);
    setEditingName(card.name);
    setEditingNumber(card.number || '');
  }

  const handleUpdateCard = async () => {
    if (!editingCard || !editingName.trim() || !editingNumber.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/creditcards/${editingCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingName.trim(),
          number: editingNumber.trim(),
          userId: userId
        })
      });

      if (response.ok) {
        const updatedCard = await response.json();
        const updatedCards = creditCards.map(c => 
          c.id === editingCard.id ? updatedCard : c
        );
        onCreditCardsChange(updatedCards);
        setEditingCard(null);
        setEditingName("");
        setEditingNumber("");
        toast({
          title: "Éxito",
          description: "Tarjeta actualizada correctamente",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Error al actualizar la tarjeta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Administrar Tarjetas de Crédito</DialogTitle>
          <DialogDescription>
            Agrega, edita o elimina tus tarjetas de crédito.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2">
                <Input
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                    placeholder="Nombre de la tarjeta (Ej: Visa Oro)"
                    disabled={isLoading}
                />
                <Input
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    placeholder="Número de tarjeta"
                    disabled={isLoading}
                />
            </div>
            <Button onClick={handleAddCard} className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Agregar Tarjeta"}
            </Button>
            <div className="space-y-2 max-h-60 overflow-y-auto">
            {creditCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-2 rounded-md border">
                {editingCard?.id === card.id ? (
                    <div className="flex flex-col gap-2 w-full">
                       <Input 
                         value={editingName} 
                         onChange={(e) => setEditingName(e.target.value)}
                         disabled={isLoading}
                       />
                       <Input 
                         value={editingNumber} 
                         onChange={(e) => setEditingNumber(e.target.value)}
                         disabled={isLoading}
                       />
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <span className="font-semibold">{card.name}</span>
                        <span className="text-sm text-muted-foreground">{card.number}</span>
                    </div>
                )}
                <div className="flex gap-2">
                    {editingCard?.id === card.id ? (
                        <Button variant="ghost" size="icon" onClick={handleUpdateCard} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleStartEditing(card)} disabled={isLoading}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                </div>
                </div>
            ))}
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
