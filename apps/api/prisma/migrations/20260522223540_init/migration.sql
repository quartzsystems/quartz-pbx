-- CreateTable
CREATE TABLE "extensions" (
    "id" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "callerId" TEXT,
    "voicemail" BOOLEAN NOT NULL DEFAULT false,
    "context" TEXT NOT NULL DEFAULT 'from-internal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trunks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "context" TEXT NOT NULL DEFAULT 'from-trunk',
    "codecs" TEXT NOT NULL DEFAULT 'ulaw,alaw,g722',
    "register" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extensions_extension_key" ON "extensions"("extension");

-- CreateIndex
CREATE UNIQUE INDEX "trunks_name_key" ON "trunks"("name");
