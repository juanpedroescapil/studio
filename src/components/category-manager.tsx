
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
import { Trash2, Pencil } from "lucide-react";

type CategoryManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
};

export function CategoryManager({ isOpen, onOpenChange, categories, onCategoriesChange }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onCategoriesChange([...categories, newCategory.trim()].sort());
      setNewCategory("");
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    onCategoriesChange(categories.filter(c => c !== categoryToDelete));
  };
  
  const handleStartEditing = (category: string) => {
    setEditingCategory(category);
    setEditingText(category);
  }

  const handleUpdateCategory = () => {
    if (editingCategory && editingText.trim() && !categories.includes(editingText.trim())) {
        onCategoriesChange(categories.map(c => c === editingCategory ? editingText.trim() : c).sort());
    }
    setEditingCategory(null);
    setEditingText("");
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Administrar Categorías</DialogTitle>
          <DialogDescription>
            Agrega, edita o elimina tus categorías de gastos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex gap-2">
                <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nueva categoría"
                />
                <Button onClick={handleAddCategory}>Agregar</Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((category) => (
                <div key={category} className="flex items-center justify-between p-2 rounded-md border">
                {editingCategory === category ? (
                    <Input value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                ) : (
                    <span>{category}</span>
                )}
                <div className="flex gap-2">
                    {editingCategory === category ? (
                        <Button variant="ghost" size="icon" onClick={handleUpdateCategory}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleStartEditing(category)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category)}>
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
