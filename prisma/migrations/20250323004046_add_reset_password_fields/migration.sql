/*
  Warnings:

  - A unique constraint covering the columns `[reset_password_token]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `reset_password_expires` DATETIME(3) NULL,
    ADD COLUMN `reset_password_token` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_reset_password_token_key` ON `User`(`reset_password_token`);
