-- AlterTable
ALTER TABLE `Expense` ADD COLUMN `installmentsCount` INTEGER NULL DEFAULT 1,
    ADD COLUMN `interestRate` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `monthlyPayment` DOUBLE NULL;
