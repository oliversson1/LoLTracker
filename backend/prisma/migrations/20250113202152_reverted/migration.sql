/*
  Warnings:

  - You are about to drop the column `riotGameName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `riotPuuid` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `riotTagLine` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_riotPuuid_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `riotGameName`,
    DROP COLUMN `riotPuuid`,
    DROP COLUMN `riotTagLine`;
