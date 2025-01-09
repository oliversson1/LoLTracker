/*
  Warnings:

  - Added the required column `userId` to the `FavoriteChampion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `favoritechampion` ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `role` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FavoriteChampion` ADD CONSTRAINT `FavoriteChampion_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
