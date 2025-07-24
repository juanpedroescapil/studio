"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = __importDefault(require("../prisma/client"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const dbUrl = process.env.DATABASE_URL;
        const expenses = await client_1.default.expense.findMany();
        res.json({ dbUrl, expenses });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener datos de debug', details: error });
    }
});
exports.default = router;
