import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "node:crypto";
import { db } from "./db";
export const sessionCookie = "trilhadev_session";
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export async function getAdmin() {
  if (!process.env.DATABASE_URL) return null;
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  const session = await db().session.findUnique({
    where: { tokenHash: digest(token) },
    include: { admin: true },
  });
  return session && session.expiresAt > new Date() ? session.admin : null;
}
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
