import express, { Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/user';
import categoryRoutes from './routes/category';
import creditCardRoutes from './routes/creditcard';
import expenseRoutes from './routes/expense';
import incomeRoutes from './routes/income';
import debugRoutes from './routes/debug';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/creditcards', creditCardRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Backend API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Sugerencia: Instala los tipos de express con 'npm install --save-dev @types/express' 