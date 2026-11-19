import { z } from "zod";
export const levels = ["Iniciante", "Intermediário", "Avançado"] as const;
export const formats = [
  "Curso",
  "Vídeo",
  "Documentação",
  "Exercício",
  "Tutorial",
] as const;
export const webUrl = z
  .string()
  .trim()
  .max(2048)
  .url("Informe uma URL válida.")
  .refine((v) => {
    const u = new URL(v);
    return (
      ["https:", "http:"].includes(u.protocol) && !u.username && !u.password
    );
  }, "Use um link HTTP ou HTTPS sem credenciais.");
const title = z
  .string()
  .trim()
  .min(2, "Informe ao menos 2 caracteres.")
  .max(120);
export const categorySchema = z.object({
  name: title,
  description: z.string().trim().max(500),
});
export const contentSchema = z.object({
  title,
  description: z
    .string()
    .trim()
    .min(10, "Descreva o material com ao menos 10 caracteres.")
    .max(2000),
  url: webUrl,
  source: title,
  categoryId: z.string().min(1, "Selecione uma categoria."),
  level: z.enum(levels),
  format: z.enum(formats),
  minutes: z.coerce.number().int().min(1).max(100000),
  published: z.boolean(),
});
export const trailSchema = z
  .object({
    title,
    description: z.string().trim().min(10).max(2000),
    level: z.enum(levels),
    published: z.boolean(),
    contentIds: z
      .array(z.string().min(1))
      .max(100)
      .refine(
        (a) => new Set(a).size === a.length,
        "Não repita materiais na trilha.",
      ),
  })
  .refine(
    (v) => !v.published || v.contentIds.length > 0,
    "Adicione um material antes de publicar a trilha.",
  );
export const feedbackSchema = z.union([
  z.literal(""),
  webUrl.refine(
    (v) => ["docs.google.com", "forms.gle"].includes(new URL(v).hostname),
    "Use um endereço do Google Forms.",
  ),
]);

export const studentFeedbackSchema = z
  .object({
    name: z.string().trim().max(80, "Use até 80 caracteres no nome."),
    topic: z.enum(["platform", "content"]),
    contentId: z.string().max(100),
    message: z
      .string()
      .trim()
      .min(10, "Escreva pelo menos 10 caracteres.")
      .max(2000, "Use até 2.000 caracteres."),
  })
  .refine(
    (v) => v.topic !== "content" || !!v.contentId,
    "Selecione o conteúdo que deseja comentar.",
  );
