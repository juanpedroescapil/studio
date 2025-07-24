"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("../prisma/client"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Proteger todos los endpoints
router.use(auth_1.authenticateToken);
// Obtener todos los gastos del usuario autenticado
router.get('/', async (req, res) => {
    const expenses = await client_1.default.expense.findMany({
        where: { userId: req.userId },
        include: {
            category: true,
            creditCard: true
        }
    });
    console.log('Gastos enviados al frontend:', expenses);
    res.json(expenses);
});
// Obtener un gasto por ID (solo si pertenece al usuario)
router.get('/:id', async (req, res) => {
    const expense = await client_1.default.expense.findFirst({
        where: { id: Number(req.params.id), userId: req.userId },
        include: {
            category: true,
            creditCard: true
        }
    });
    if (!expense)
        return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
});
// Crear un gasto (asociado al usuario autenticado)
router.post('/', async (req, res) => {
    try {
        const { amount, description, date, categoryId, creditCardId, paymentMethod } = req.body;
        console.log('POST /api/expenses - Body recibido:', req.body);
        console.log('creditCardId recibido:', creditCardId, 'tipo:', typeof creditCardId);
        // Validaciones básicas
        if (typeof amount !== 'number' || isNaN(amount)) {
            return res.status(400).json({ error: 'El campo amount es obligatorio y debe ser numérico.' });
        }
        if (!date || isNaN(Date.parse(date))) {
            return res.status(400).json({ error: 'El campo date es obligatorio y debe ser una fecha válida.' });
        }
        if (!categoryId) {
            return res.status(400).json({ error: 'categoryId es obligatorio.' });
        }
        // Verificar existencia de categoría
        const category = await client_1.default.category.findUnique({ where: { id: Number(categoryId) } });
        if (!category) {
            return res.status(400).json({ error: 'La categoría no existe.' });
        }
        let creditCard = null;
        if (creditCardId) {
            console.log('Buscando tarjeta de crédito con ID:', creditCardId);
            creditCard = await client_1.default.creditCard.findUnique({ where: { id: Number(creditCardId) } });
            console.log('Tarjeta encontrada:', creditCard);
            if (!creditCard) {
                return res.status(400).json({ error: 'La tarjeta de crédito no existe.' });
            }
        }
        else {
            console.log('No se proporcionó creditCardId');
        }
        const expenseData = {
            amount,
            description,
            date: new Date(date),
            paymentMethod: paymentMethod || 'cash',
            userId: req.userId,
            categoryId: category.id,
            creditCardId: creditCard ? creditCard.id : null,
            // Campos de cuotas
            installmentsCount: req.body.installmentsCount || 1,
            interestRate: req.body.interestRate || 0,
            monthlyPayment: req.body.monthlyPayment || amount,
        };
        console.log('Datos para crear el gasto:', expenseData);
        // Crear el gasto
        const expense = await client_1.default.expense.create({
            data: expenseData,
        });
        console.log('Gasto creado exitosamente:', expense);
        res.status(201).json(expense);
    }
    catch (error) {
        console.error('Error al crear gasto:', error);
        res.status(500).json({ error: 'Error interno al crear el gasto', details: error });
    }
});
// Actualizar un gasto (solo si pertenece al usuario)
router.put('/:id', async (req, res) => {
    try {
        const { amount, description, date, categoryId, creditCardId, paymentMethod } = req.body;
        console.log('PUT /api/expenses/:id - Body recibido:', req.body);
        console.log('ID del gasto a actualizar:', req.params.id);
        // Validaciones básicas
        if (typeof amount !== 'number' || isNaN(amount)) {
            return res.status(400).json({ error: 'El campo amount es obligatorio y debe ser numérico.' });
        }
        if (!date || isNaN(Date.parse(date))) {
            return res.status(400).json({ error: 'El campo date es obligatorio y debe ser una fecha válida.' });
        }
        if (!categoryId) {
            return res.status(400).json({ error: 'categoryId es obligatorio.' });
        }
        // Verificar existencia de categoría
        const category = await client_1.default.category.findUnique({ where: { id: Number(categoryId) } });
        if (!category) {
            return res.status(400).json({ error: 'La categoría no existe.' });
        }
        let creditCard = null;
        if (creditCardId) {
            console.log('Buscando tarjeta de crédito con ID:', creditCardId);
            creditCard = await client_1.default.creditCard.findUnique({ where: { id: Number(creditCardId) } });
            console.log('Tarjeta encontrada:', creditCard);
            if (!creditCard) {
                return res.status(400).json({ error: 'La tarjeta de crédito no existe.' });
            }
        }
        else {
            console.log('No se proporcionó creditCardId');
        }
        const expenseData = {
            amount,
            description,
            date: new Date(date),
            paymentMethod: paymentMethod || 'cash',
            categoryId: category.id,
            creditCardId: creditCard ? creditCard.id : null,
            // Campos de cuotas
            installmentsCount: req.body.installmentsCount || 1,
            interestRate: req.body.interestRate || 0,
            monthlyPayment: req.body.monthlyPayment || amount,
        };
        console.log('Datos para actualizar el gasto:', expenseData);
        const expense = await client_1.default.expense.updateMany({
            where: { id: Number(req.params.id), userId: req.userId },
            data: expenseData,
        });
        if (expense.count === 0) {
            return res.status(404).json({ error: 'Expense not found or not yours' });
        }
        console.log('Gasto actualizado exitosamente');
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error al actualizar gasto:', error);
        res.status(500).json({ error: 'Error interno al actualizar el gasto', details: error });
    }
});
// Eliminar un gasto (solo si pertenece al usuario)
router.delete('/:id', async (req, res) => {
    try {
        const expense = await client_1.default.expense.deleteMany({
            where: { id: Number(req.params.id), userId: req.userId },
        });
        if (expense.count === 0) {
            return res.status(404).json({ error: 'Expense not found or not yours' });
        }
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Error deleting expense' });
    }
});
exports.default = router;
