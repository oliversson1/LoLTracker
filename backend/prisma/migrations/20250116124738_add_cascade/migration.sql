-- DropForeignKey
ALTER TABLE `favoritechampion` DROP FOREIGN KEY `FavoriteChampion_userId_fkey`;

-- AddForeignKey
ALTER TABLE `FavoriteChampion` ADD CONSTRAINT `FavoriteChampion_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
