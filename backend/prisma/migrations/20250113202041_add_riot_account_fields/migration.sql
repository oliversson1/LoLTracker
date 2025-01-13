/*
  Warnings:

  - A unique constraint covering the columns `[riotPuuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `riotGameName` VARCHAR(191) NULL,
    ADD COLUMN `riotPuuid` VARCHAR(191) NULL,
    ADD COLUMN `riotTagLine` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_riotPuuid_key` ON `User`(`riotPuuid`);
