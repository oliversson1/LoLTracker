/*
  Warnings:

  - You are about to drop the column `createdAt` on the `tournament` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tournament` DROP COLUMN `createdAt`;

-- AddForeignKey
ALTER TABLE `Tournament` ADD CONSTRAINT `Tournament_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
