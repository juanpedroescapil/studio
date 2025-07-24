"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const category_1 = __importDefault(require("./routes/category"));
const creditcard_1 = __importDefault(require("./routes/creditcard"));
const expense_1 = __importDefault(require("./routes/expense"));
const income_1 = __importDefault(require("./routes/income"));
const debug_1 = __importDefault(require("./routes/debug"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/users', user_1.default);
app.use('/api/categories', category_1.default);
app.use('/api/creditcards', creditcard_1.default);
app.use('/api/expenses', expense_1.default);
app.use('/api/incomes', income_1.default);
app.use('/api/debug', debug_1.default);
app.use('/api/auth', auth_1.default);
app.get('/', (req, res) => {
    res.send('Backend API is running');
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Sugerencia: Instala los tipos de express con 'npm install --save-dev @types/express' 
