-- CreateTable
CREATE TABLE `Article` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `video_url` VARCHAR(255) NULL,
    `photo_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Article_photo_id_key`(`photo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_photo_id_fkey` FOREIGN KEY (`photo_id`) REFERENCES `Photos`(`photo_id`) ON DELETE SET NULL ON UPDATE CASCADE;
