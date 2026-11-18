"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { requireAdmin, sessionCookie, digest } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import {
  categorySchema,
  contentSchema,
  trailSchema,
  feedbackSchema,
} from "@/lib/validation";
import { z } from "zod";
export type ActionState = { error?: string; success?: string };
export async function login(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  if (!process.env.DATABASE_URL)
    return {
      error: "Conecte o banco de dados e crie um administrador para entrar.",
    };
  const input = z
    .object({
      email: z
        .string()
        .trim()
        .email()
        .max(254)
        .transform((s) => s.toLowerCase()),
      password: z.string().min(1).max(128),
    })
    .safeParse(Object.fromEntries(form));
  if (!input.success) return { error: "Informe seu e-mail e senha." };
  try {
    const key = digest(input.data.email);
    const now = new Date();
    // An atomic upsert makes the attempt budget consistent across Vercel instances.
    const attempts = await db().$queryRaw<
      { count: number }[]
    >`INSERT INTO "LoginAttempt" ("key","count","expiresAt") VALUES (${key},1,${new Date(Date.now() + 15 * 60 * 1000)}) ON CONFLICT ("key") DO UPDATE SET "count" = CASE WHEN "LoginAttempt"."expiresAt" < ${now} THEN 1 ELSE "LoginAttempt"."count"+1 END, "expiresAt" = CASE WHEN "LoginAttempt"."expiresAt" < ${now} THEN ${new Date(Date.now() + 15 * 60 * 1000)} ELSE "LoginAttempt"."expiresAt" END RETURNING "count"`;
    if (attempts[0].count > 8)
      return {
        error:
          "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.",
      };
    const admin = await db().admin.findUnique({
      where: { email: input.data.email },
    });
    const valid = verifyPassword(
      input.data.password,
      admin?.passwordHash ?? "0".repeat(32) + ":" + "0".repeat(128),
    );
    if (!admin || !valid) return { error: "E-mail ou senha incorretos." };
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    await db().session.create({
      data: { tokenHash: digest(token), adminId: admin.id, expiresAt },
    });
    await db().session.deleteMany({ where: { expiresAt: { lt: now } } });
    (await cookies()).set(sessionCookie, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  } catch {
    return {
      error:
        "Não foi possível entrar. Verifique a conexão com o banco e tente novamente.",
    };
  }
  redirect("/admin");
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token && process.env.DATABASE_URL)
    await db().session.deleteMany({ where: { tokenHash: digest(token) } });
  jar.delete(sessionCookie);
  redirect("/admin/login");
}
export async function save(
  kind: string,
  id: string | undefined,
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(form);
  let target = "/admin";
  const section =
    kind === "content"
      ? "conteudos"
      : kind === "category"
        ? "categorias"
        : kind === "trail"
          ? "trilhas"
          : "configuracoes";
  const editorPath =
    kind === "settings"
      ? "/admin/configuracoes"
      : `/admin/${section}/${encodeURIComponent(id ?? "novo")}`;
  let problem: string | undefined;
  try {
    if (kind === "category") {
      const data = categorySchema.parse(raw);
      if (id) await db().category.update({ where: { id }, data });
      else await db().category.create({ data });
      target = "/admin/categorias";
    } else if (kind === "content") {
      const data = contentSchema.parse({
        ...raw,
        published: form.get("published") === "on",
      });
      await db().$transaction(
        async (tx) => {
          if (
            id &&
            !data.published &&
            (await tx.trailStep.count({
              where: { contentId: id, trail: { published: true } },
            }))
          )
            throw new Error(
              "Retire este material das trilhas publicadas antes de despublicá-lo.",
            );
          if (id) await tx.content.update({ where: { id }, data });
          else await tx.content.create({ data });
        },
        { isolationLevel: "Serializable" },
      );
      target = "/admin/conteudos";
    } else if (kind === "trail") {
      const parsed = trailSchema.parse({
        ...raw,
        published: form.get("published") === "on",
        contentIds: form.getAll("contentIds").filter(Boolean),
      });
      const { contentIds, ...data } = parsed;
      await db().$transaction(
        async (tx) => {
          const count = await tx.content.count({
            where: {
              id: { in: contentIds },
              ...(data.published ? { published: true } : {}),
            },
          });
          if (count !== contentIds.length)
            throw new Error(
              "Uma trilha publicada só pode conter materiais publicados. Confira as etapas.",
            );
          if (id) {
            await tx.trailStep.deleteMany({ where: { trailId: id } });
            await tx.trail.update({
              where: { id },
              data: {
                ...data,
                steps: {
                  create: contentIds.map((contentId, position) => ({
                    contentId,
                    position,
                  })),
                },
              },
            });
          } else
            await tx.trail.create({
              data: {
                ...data,
                steps: {
                  create: contentIds.map((contentId, position) => ({
                    contentId,
                    position,
                  })),
                },
              },
            });
        },
        { isolationLevel: "Serializable" },
      );
      target = "/admin/trilhas";
    } else if (kind === "settings") {
      const feedbackUrl = feedbackSchema.parse(form.get("feedbackUrl"));
      await db().settings.upsert({
        where: { id: "site" },
        create: { id: "site", feedbackUrl },
        update: { feedbackUrl },
      });
      target = "/admin/configuracoes";
    } else return { error: "Operação inválida." };
  } catch (error) {
    if (error instanceof z.ZodError)
      problem = error.issues.map((i) => i.message).join(" ");
    else if (
      error instanceof Error &&
      (error.message.startsWith("Retire") ||
        error.message.startsWith("Uma trilha"))
    )
      problem = error.message;
    else
      problem =
        "Não foi possível salvar. Verifique duplicidades e referências; se outra edição ocorreu, recarregue e tente novamente.";
  }
  // Post/Redirect/Get also completes reliably before client-side hydration.
  if (problem) redirect(editorPath + "?erro=" + encodeURIComponent(problem));
  revalidatePath("/", "layout");
  redirect(target + "?salvo=1");
}
export async function remove(
  kind: string,
  id: string,
  _: ActionState,
): Promise<ActionState> {
  await requireAdmin();
  const section =
    kind === "content"
      ? "conteudos"
      : kind === "category"
        ? "categorias"
        : "trilhas";
  let problem: string | undefined;
  try {
    if (kind === "content") await db().content.delete({ where: { id } });
    else if (kind === "category") await db().category.delete({ where: { id } });
    else if (kind === "trail") await db().trail.delete({ where: { id } });
    else return { error: "Operação inválida." };
  } catch {
    problem =
      "Não foi possível excluir. Remova primeiro os vínculos com conteúdos ou trilhas.";
  }
  if (problem)
    redirect(`/admin/${section}?erro=${encodeURIComponent(problem)}`);
  revalidatePath("/", "layout");
  redirect(`/admin/${section}?salvo=1`);
}
