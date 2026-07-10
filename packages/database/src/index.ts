import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}

export async function checkDatabaseConnection(client: Pick<PrismaClient, "$queryRaw"> = prisma) {
  await client.$queryRaw`SELECT 1`;

  return {
    connected: true,
    provider: "postgresql"
  };
}

export { PrismaClient };
