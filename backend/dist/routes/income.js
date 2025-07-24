"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Obtener todos los ingresos del usuario
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const incomes = await prisma.income.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                date: 'desc'
            }
        });
        res.json(incomes);
    }
    catch (error) {
        console.error('Error fetching incomes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Crear un nuevo ingreso
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
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
    }
    catch (error) {
        console.error('Error creating income:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Actualizar un ingreso existente
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
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
    }
    catch (error) {
        console.error('Error updating income:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Eliminar un ingreso
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
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
    }
    catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.default = router;
