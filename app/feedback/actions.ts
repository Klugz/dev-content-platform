"use server";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { studentFeedbackSchema } from "@/lib/validation";
export type FeedbackState = { error?: string; success?: string };
export async function submitFeedback(
  _: FeedbackState,
  form: FormData,
): Promise<FeedbackState> {
  if (!process.env.DATABASE_URL)
    return {
      error: "O envio ficará disponível quando o banco estiver conectado.",
    };
  const input = studentFeedbackSchema.safeParse({
    name: form.get("name") ?? "",
    topic: form.get("topic"),
    contentId: form.get("contentId") ?? "",
    message: form.get("message"),
  });
  if (!input.success) return { error: input.error.issues[0].message };
  if (form.get("website"))
    return { error: "Não foi possível enviar o comentário." };
  try {
    const h = await headers();
    const address =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = new Date();
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    const key =
      "feedback:" +
      createHash("sha256")
        .update(address + ":" + Math.floor(Date.now() / 86400000))
        .digest("hex");
    const attempts = await db().$queryRaw<
      { count: number }[]
    >`INSERT INTO "LoginAttempt" ("key", "count", "expiresAt") VALUES (${key}, 1, ${expires}) ON CONFLICT ("key") DO UPDATE SET "count" = CASE WHEN "LoginAttempt"."expiresAt" < ${now} THEN 1 ELSE "LoginAttempt"."count" + 1 END, "expiresAt" = CASE WHEN "LoginAttempt"."expiresAt" < ${now} THEN ${expires} ELSE "LoginAttempt"."expiresAt" END RETURNING "count"`;
    if (attempts[0].count > 5)
      return {
        error: "Muitos envios. Aguarde 15 minutos antes de tentar novamente.",
      };
    const { name, message, topic, contentId } = input.data;
    const content =
      topic === "content"
        ? await db().content.findFirst({
            where: { id: contentId, published: true },
            select: { id: true, title: true },
          })
        : null;
    if (topic === "content" && !content)
      return {
        error: "Este conteúdo não está disponível. Escolha outro conteúdo.",
      };
    await db().studentFeedback.create({
      data: {
        name,
        message,
        contentId: content?.id,
        contentTitle: content?.title,
      },
    });
    await db().loginAttempt.deleteMany({
      where: { key: { startsWith: "feedback:" }, expiresAt: { lt: now } },
    });
  } catch {
    return {
      error:
        "Não foi possível salvar seu comentário. Tente novamente em instantes.",
    };
  }
  revalidatePath("/admin/feedback");
  return {
    success: "Comentário enviado! Obrigado por ajudar a melhorar a plataforma.",
  };
}
