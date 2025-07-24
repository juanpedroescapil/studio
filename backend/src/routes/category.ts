import { Router } from 'express';
import prisma from '../prisma/client';

const router = Router();

// Obtener todas las categorías
router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category);
});

// Crear una categoría
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    const category = await prisma.category.create({
      data: { 
        name,
        color: color || '#3B82F6' // Color azul por defecto si no se proporciona
      },
    });
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    } else {
      res.status(400).json({ error: 'Error creating category' });
    }
  }
});

// Actualizar una categoría
router.put('/:id', async (req, res) => {
  try {
    const { name, color } = req.body;
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { 
        name,
        color: color || '#3B82F6' // Color azul por defecto si no se proporciona
      },
    });
    res.json(category);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    } else {
      res.status(400).json({ error: 'Error updating category' });
    }
  }
});

// Eliminar una categoría
router.delete('/:id', async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: Number(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Error deleting category' });
  }
});

export default router; 