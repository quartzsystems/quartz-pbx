-- AlterTable
ALTER TABLE "trunks" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'PJSIP';

-- CreateTable
CREATE TABLE "inbound_routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "did" TEXT,
    "cidNumber" TEXT,
    "destination" TEXT NOT NULL,
    "destinationType" TEXT NOT NULL DEFAULT 'extension',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbound_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound_routes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "trunkId" TEXT,
    "prepend" TEXT NOT NULL DEFAULT '',
    "stripDigits" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbound_routes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "outbound_routes" ADD CONSTRAINT "outbound_routes_trunkId_fkey" FOREIGN KEY ("trunkId") REFERENCES "trunks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
