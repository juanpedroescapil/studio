
"use client";

import React, { useState, useEffect } from 'react';
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
import { Trash2, Pencil, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "@/components/ui/color-picker";
import { Category } from "@/types";

type CategoryManagerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
};

export function CategoryManager({ isOpen, onOpenChange, categories, onCategoriesChange }: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("#3B82F6");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Cargar categorías del backend al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/categories');
      if (response.ok) {
        const data = await response.json();
        onCategoriesChange(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || categories.some(cat => cat.name === newCategoryName.trim())) {
      toast({ variant: "destructive", title: "Error", description: "El nombre de la categoría ya existe o está vacío." });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: newCategoryName.trim(),
          color: newCategoryColor
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear la categoría');
      }

      const savedCategory = await response.json();
      onCategoriesChange([...categories, savedCategory]);
      setNewCategoryName("");
      setNewCategoryColor("#3B82F6");
      toast({ title: "Éxito", description: "Categoría creada exitosamente." });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({ variant: "destructive", title: "Error", description: "Error al crear la categoría." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryToDelete: Category) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }

      onCategoriesChange(categories.filter(c => c.id !== categoryToDelete.id));
      toast({ title: "Éxito", description: "Categoría eliminada exitosamente." });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ variant: "destructive", title: "Error", description: "Error al eliminar la categoría." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStartEditing = (category: Category) => {
    setEditingCategory(category);
    setEditingName(category.name);
    setEditingColor(category.color);
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingName.trim() || 
        categories.some(cat => cat.name === editingName.trim() && cat.id !== editingCategory.id)) {
      setEditingCategory(null);
      setEditingName("");
      setEditingColor("#3B82F6");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: editingName.trim(),
          color: editingColor
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la categoría');
      }

      const updatedCategory = await response.json();
      onCategoriesChange(categories.map(c => c.id === editingCategory.id ? updatedCategory : c));
      toast({ title: "Éxito", description: "Categoría actualizada exitosamente." });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({ variant: "destructive", title: "Error", description: "Error al actualizar la categoría." });
    } finally {
      setEditingCategory(null);
      setEditingName("");
      setEditingColor("#3B82F6");
      setIsLoading(false);
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingName("");
    setEditingColor("#3B82F6");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Administrar Categorías</DialogTitle>
          <DialogDescription>
            Agrega, edita o elimina tus categorías de gastos con colores personalizados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Agregar nueva categoría */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Agregar Nueva Categoría</h3>
            <div className="flex gap-3 items-center">
                <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nombre de la categoría"
                disabled={isLoading}
                className="flex-1"
              />
              <ColorPicker
                value={newCategoryColor}
                onChange={setNewCategoryColor}
                />
              <Button 
                onClick={handleAddCategory} 
                disabled={isLoading || !newCategoryName.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Lista de categorías existentes */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Categorías Existentes</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                  {editingCategory?.id === category.id ? (
                    <div className="flex gap-3 items-center flex-1">
                      <Input 
                        value={editingName} 
                        onChange={(e) => setEditingName(e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <ColorPicker
                        value={editingColor}
                        onChange={setEditingColor}
                      />
                    </div>
                ) : (
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                )}
                  
                <div className="flex gap-2">
                    {editingCategory?.id === category.id ? (
                      <React.Fragment key={`edit-${category.id}`}>
                        <Button 
                          key={`save-${category.id}`}
                          variant="ghost" 
                          size="sm"
                          onClick={handleUpdateCategory}
                          disabled={isLoading}
                        >
                          Guardar
                        </Button>
                        <Button 
                          key={`cancel-${category.id}`}
                          variant="ghost" 
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                      </React.Fragment>
                    ) : (
                      <Button 
                        key={`edit-${category.id}`}
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStartEditing(category)}
                        disabled={isLoading}
                      >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    )}
                    <Button 
                      key={`delete-${category.id}`}
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                      disabled={isLoading}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
                </div>
            ))}
            </div>
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
