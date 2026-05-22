/*
  Warnings:

  - You are about to drop the column `pattern` on the `outbound_routes` table. All the data in the column will be lost.
  - You are about to drop the column `trunkId` on the `outbound_routes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "outbound_routes" DROP CONSTRAINT "outbound_routes_trunkId_fkey";

-- AlterTable
ALTER TABLE "outbound_routes" DROP COLUMN "pattern",
DROP COLUMN "trunkId",
ADD COLUMN     "callerId" TEXT;

-- CreateTable
CREATE TABLE "outbound_route_patterns" (
    "id" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "outboundRouteId" TEXT NOT NULL,

    CONSTRAINT "outbound_route_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound_route_trunks" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "outboundRouteId" TEXT NOT NULL,
    "trunkId" TEXT NOT NULL,

    CONSTRAINT "outbound_route_trunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outbound_route_trunks_outboundRouteId_trunkId_key" ON "outbound_route_trunks"("outboundRouteId", "trunkId");

-- AddForeignKey
ALTER TABLE "outbound_route_patterns" ADD CONSTRAINT "outbound_route_patterns_outboundRouteId_fkey" FOREIGN KEY ("outboundRouteId") REFERENCES "outbound_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_route_trunks" ADD CONSTRAINT "outbound_route_trunks_outboundRouteId_fkey" FOREIGN KEY ("outboundRouteId") REFERENCES "outbound_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_route_trunks" ADD CONSTRAINT "outbound_route_trunks_trunkId_fkey" FOREIGN KEY ("trunkId") REFERENCES "trunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
