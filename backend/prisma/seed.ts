import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });
  console.log('✅ User created:', user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Auto' },
      update: {},
      create: { name: 'Auto' },
    }),
    prisma.category.upsert({
      where: { name: 'Casa' },
      update: {},
      create: { name: 'Casa' },
    }),
    prisma.category.upsert({
      where: { name: 'Comida' },
      update: {},
      create: { name: 'Comida' },
    }),
    prisma.category.upsert({
      where: { name: 'Entretenimiento' },
      update: {},
      create: { name: 'Entretenimiento' },
    }),
  ]);
  console.log('✅ Categories created:', categories.map(c => c.name));

  // Create credit cards
  const creditCards = await Promise.all([
    prisma.creditCard.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Visa Signature',
        number: '1234567890123456',
        userId: user.id,
      },
    }),
    prisma.creditCard.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Mastercard Gold',
        number: '9876543210987654',
        userId: user.id,
      },
    }),
  ]);
  console.log('✅ Credit cards created:', creditCards.map(c => c.name));

  // Create sample expenses
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        amount: 50000,
        description: 'Gasolina',
        date: new Date('2025-01-15'),
        paymentMethod: 'cash',
        userId: user.id,
        categoryId: categories[0].id, // Auto
        installmentsCount: 1,
        interestRate: 0,
        monthlyPayment: 50000,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 150000,
        description: 'Supermercado',
        date: new Date('2025-01-20'),
        paymentMethod: 'cash',
        userId: user.id,
        categoryId: categories[2].id, // Comida
        installmentsCount: 1,
        interestRate: 0,
        monthlyPayment: 150000,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 300000,
        description: 'Electrodoméstico',
        date: new Date('2025-01-25'),
        paymentMethod: 'credit-card',
        userId: user.id,
        categoryId: categories[1].id, // Casa
        creditCardId: creditCards[0].id,
        installmentsCount: 6,
        interestRate: 0,
        monthlyPayment: 50000,
      },
    }),
    prisma.expense.create({
      data: {
        amount: 80000,
        description: 'Cena en restaurante',
        date: new Date('2025-01-30'),
        paymentMethod: 'credit-card',
        userId: user.id,
        categoryId: categories[3].id, // Entretenimiento
        creditCardId: creditCards[1].id,
        installmentsCount: 3,
        interestRate: 0,
        monthlyPayment: 26667,
      },
    }),
  ]);
  console.log('✅ Expenses created:', expenses.length);

  console.log('🎉 Database seeding completed!');
  console.log('📧 Test user email: test@example.com');
  console.log('🔑 Test user password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 