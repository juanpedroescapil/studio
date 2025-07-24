import { Router } from 'express';
import prisma from '../prisma/client';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const expenses = await prisma.expense.findMany();
    res.json({ dbUrl, expenses });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos de debug', details: error });
  }
});

export default router; 