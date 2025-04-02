/*
  Warnings:

  - A unique constraint covering the columns `[photo_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `photo_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `Photos` (
    `photo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `serial_id` VARCHAR(200) NOT NULL,
    `original` VARCHAR(200) NOT NULL,
    `large` VARCHAR(200) NOT NULL,
    `medium` VARCHAR(200) NOT NULL,
    `small` VARCHAR(200) NOT NULL,
    `created_on` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_on` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `photo_serial`(`serial_id`),
    PRIMARY KEY (`photo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_photo_id_key` ON `User`(`photo_id`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_photo_id_fkey` FOREIGN KEY (`photo_id`) REFERENCES `Photos`(`photo_id`) ON DELETE SET NULL ON UPDATE CASCADE;
