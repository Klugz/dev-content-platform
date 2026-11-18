import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/password";
import { z } from "zod";
const email = z
  .string()
  .email()
  .parse(process.env.ADMIN_EMAIL)
  .trim()
  .toLowerCase();
const password = z
  .string()
  .min(12, "Defina ADMIN_PASSWORD com pelo menos 12 caracteres.")
  .max(128)
  .parse(process.env.ADMIN_PASSWORD);
const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  }),
});
try {
  await db.admin.create({
    data: { email, passwordHash: hashPassword(password) },
  });
  console.log("Administrador criado. Nenhuma senha foi registrada nos logs.");
} finally {
  await db.$disconnect();
}
