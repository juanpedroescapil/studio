import { Router } from 'express';
import prisma from '../prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Obtener todas las tarjetas de crédito del usuario autenticado
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cards = await prisma.creditCard.findMany({
      where: { userId: req.userId }
    });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tarjetas de crédito' });
  }
});

// Obtener una tarjeta de crédito por ID (solo del usuario autenticado)
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const card = await prisma.creditCard.findFirst({
      where: { 
        id: Number(req.params.id),
        userId: req.userId 
      },
    });
    if (!card) return res.status(404).json({ error: 'Tarjeta de crédito no encontrada' });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la tarjeta de crédito' });
  }
});

// Crear una tarjeta de crédito
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, number } = req.body;
    
    if (!name || !number) {
      return res.status(400).json({ error: 'Nombre y número son requeridos' });
    }

    const card = await prisma.creditCard.create({
      data: { 
        name, 
        number, 
        userId: req.userId 
      },
    });
    res.status(201).json(card);
  } catch (error) {
    console.error('Error creating credit card:', error);
    res.status(400).json({ error: 'Error al crear la tarjeta de crédito' });
  }
});

// Actualizar una tarjeta de crédito (solo del usuario autenticado)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, number } = req.body;
    
    if (!name || !number) {
      return res.status(400).json({ error: 'Nombre y número son requeridos' });
    }

    const card = await prisma.creditCard.findFirst({
      where: { 
        id: Number(req.params.id),
        userId: req.userId 
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Tarjeta de crédito no encontrada' });
    }

    const updatedCard = await prisma.creditCard.update({
      where: { id: Number(req.params.id) },
      data: { name, number },
    });
    res.json(updatedCard);
  } catch (error) {
    console.error('Error updating credit card:', error);
    res.status(400).json({ error: 'Error al actualizar la tarjeta de crédito' });
  }
});

// Eliminar una tarjeta de crédito (solo del usuario autenticado)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const card = await prisma.creditCard.findFirst({
      where: { 
        id: Number(req.params.id),
        userId: req.userId 
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Tarjeta de crédito no encontrada' });
    }

    await prisma.creditCard.delete({
      where: { id: Number(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting credit card:', error);
    res.status(400).json({ error: 'Error al eliminar la tarjeta de crédito' });
  }
});

export default router; 