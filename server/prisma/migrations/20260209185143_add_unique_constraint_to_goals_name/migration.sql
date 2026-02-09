/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SavingsGoal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SavingsGoal_name_key" ON "SavingsGoal"("name");
