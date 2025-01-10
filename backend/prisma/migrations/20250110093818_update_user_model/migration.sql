/*
  Warnings:

  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `email`,
    ADD COLUMN `refreshToken` VARCHAR(191) NULL;
