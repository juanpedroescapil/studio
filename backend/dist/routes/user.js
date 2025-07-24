"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("../prisma/client"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
// Obtener todos los usuarios
router.get('/', async (req, res) => {
    const users = await client_1.default.user.findMany();
    res.json(users);
});
// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
    const user = await client_1.default.user.findUnique({
        where: { id: Number(req.params.id) },
    });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json(user);
});
// Crear un usuario
router.post('/', async (req, res) => {
    try {
        const { email, name, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son obligatorios.' });
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await client_1.default.user.create({
            data: { email, name, password: hashed },
        });
        res.status(201).json({ id: user.id, email: user.email, name: user.name });
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating user' });
    }
});
// Actualizar un usuario
router.put('/:id', async (req, res) => {
    try {
        const { email, name } = req.body;
        const user = await client_1.default.user.update({
            where: { id: Number(req.params.id) },
            data: { email, name },
        });
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating user' });
    }
});
// Eliminar un usuario
router.delete('/:id', async (req, res) => {
    try {
        await client_1.default.user.delete({
            where: { id: Number(req.params.id) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Error deleting user' });
    }
});
exports.default = router;
