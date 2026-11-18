import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const globalDb = globalThis as unknown as { db?: PrismaClient };
export function db() {
  if (!process.env.DATABASE_URL)
    throw new Error("Configure DATABASE_URL para acessar o banco.");
  if (!globalDb.db)
    globalDb.db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        max: 3,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 20000,
      }),
    });
  return globalDb.db;
}
