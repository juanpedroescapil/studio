import { Router } from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    console.log('Intento de registro:', req.body);
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email es obligatorio y debe ser string.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password es obligatorio y debe tener al menos 6 caracteres.' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Registro fallido: email ya registrado');
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashed },
    });
    console.log('Usuario registrado exitosamente:', user.email);
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario', details: error });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Credenciales inválidas.' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión', details: error });
  }
});

export default router; 