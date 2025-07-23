
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
import { Trash2, Pencil, Save } from "lucide-react";
import { CreditCard } from '@/types';

type CreditCardManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  creditCards: CreditCard[];
  onCreditCardsChange: (creditCards: CreditCard[]) => void;
};

export function CreditCardManager({ isOpen, onOpenChange, creditCards, onCreditCardsChange }: CreditCardManagerProps) {
  const [newCardName, setNewCardName] = useState("");
  const [newCardBank, setNewCardBank] = useState("");
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingBank, setEditingBank] = useState("");

  const handleAddCard = () => {
    if (newCardName.trim() && newCardBank.trim()) {
      const newCard: CreditCard = {
        id: `cc-${Date.now()}`,
        name: newCardName.trim(),
        bank: newCardBank.trim(),
      };
      onCreditCardsChange([...creditCards, newCard]);
      setNewCardName("");
      setNewCardBank("");
    }
  };

  const handleDeleteCard = (cardId: string) => {
    onCreditCardsChange(creditCards.filter(c => c.id !== cardId));
  };
  
  const handleStartEditing = (card: CreditCard) => {
    setEditingCard(card);
    setEditingName(card.name);
    setEditingBank(card.bank);
  }

  const handleUpdateCard = () => {
    if (editingCard && editingName.trim() && editingBank.trim()) {
        const updatedCards = creditCards.map(c => 
            c.id === editingCard.id 
            ? { ...c, name: editingName.trim(), bank: editingBank.trim() } 
            : c
        );
        onCreditCardsChange(updatedCards);
        setEditingCard(null);
        setEditingName("");
        setEditingBank("");
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
                />
                <Input
                    value={newCardBank}
                    onChange={(e) => setNewCardBank(e.target.value)}
                    placeholder="Banco emisor"
                />
            </div>
            <Button onClick={handleAddCard} className="w-full">Agregar Tarjeta</Button>
            <div className="space-y-2 max-h-60 overflow-y-auto">
            {creditCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-2 rounded-md border">
                {editingCard?.id === card.id ? (
                    <div className="flex flex-col gap-2 w-full">
                       <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                       <Input value={editingBank} onChange={(e) => setEditingBank(e.target.value)} />
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <span className="font-semibold">{card.name}</span>
                        <span className="text-sm text-muted-foreground">{card.bank}</span>
                    </div>
                )}
                <div className="flex gap-2">
                    {editingCard?.id === card.id ? (
                        <Button variant="ghost" size="icon" onClick={handleUpdateCard}>
                            <Save className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleStartEditing(card)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(card.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
                </div>
            ))}
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
