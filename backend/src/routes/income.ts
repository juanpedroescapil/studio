import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todos los ingresos del usuario
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    
    // Validar que userId esté presente
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    console.log('Consultando ingresos para userId:', userId);
    
    const incomes = await prisma.income.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log('Ingresos encontrados:', incomes);
    console.log('Cantidad de ingresos:', incomes.length);
    console.log('Ingresos recurrentes:', incomes.filter(inc => inc.isRecurring));

    res.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo ingreso
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    
    // Validar que userId esté presente
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const { description, amount, date, category, source, isRecurring, recurringFrequency } = req.body;

    // Validaciones básicas
    if (!description || !amount || !date || !category || !source) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben estar presentes' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }

    const income = await prisma.income.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        category,
        source,
        isRecurring: Boolean(isRecurring),
        recurringFrequency: recurringFrequency || null,
        userId
      }
    });

    res.status(201).json(income);
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar un ingreso existente
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    
    // Validar que userId esté presente
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    const incomeId = parseInt(req.params.id);
    const { description, amount, date, category, source, isRecurring, recurringFrequency } = req.body;

    // Verificar que el ingreso pertenece al usuario
    const existingIncome = await prisma.income.findFirst({
      where: {
        id: incomeId,
        userId: userId
      }
    });

    if (!existingIncome) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    // Validaciones básicas
    if (!description || !amount || !date || !category || !source) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben estar presentes' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }

    const updatedIncome = await prisma.income.update({
      where: {
        id: incomeId
      },
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        category,
        source,
        isRecurring: Boolean(isRecurring),
        recurringFrequency: recurringFrequency || null
      }
    });

    res.json(updatedIncome);
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un ingreso
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    
    // Validar que userId esté presente
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    const incomeId = parseInt(req.params.id);

    // Verificar que el ingreso pertenece al usuario
    const existingIncome = await prisma.income.findFirst({
      where: {
        id: incomeId,
        userId: userId
      }
    });

    if (!existingIncome) {
      return res.status(404).json({ error: 'Ingreso no encontrado' });
    }

    await prisma.income.delete({
      where: {
        id: incomeId
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 