-- DropForeignKey
ALTER TABLE "EnvFile" DROP CONSTRAINT "EnvFile_projectId_fkey";

-- AddForeignKey
ALTER TABLE "EnvFile" ADD CONSTRAINT "EnvFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
