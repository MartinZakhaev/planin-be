/*
  Warnings:

  - A unique constraint covering the columns `[midtrans_order_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "midtrans_order_id" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_midtrans_order_id_key" ON "subscriptions"("midtrans_order_id");
