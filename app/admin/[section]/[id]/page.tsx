import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { Editor } from "@/components/admin-forms";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Edit({
  params,
  searchParams,
}: {
  params: Promise<{ section: string; id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  await requireAdmin();
  const { erro } = await searchParams;
  const { section, id } = await params;
  if (!["conteudos", "categorias", "trilhas"].includes(section)) notFound();
  const kind =
    section === "conteudos"
      ? "content"
      : section === "categorias"
        ? "category"
        : "trail";
  const item =
    id === "novo"
      ? {}
      : kind === "content"
        ? await db().content.findUnique({ where: { id } })
        : kind === "category"
          ? await db().category.findUnique({ where: { id } })
          : await db().trail.findUnique({
              where: { id },
              include: { steps: { orderBy: { position: "asc" } } },
            });
  if (!item) notFound();
  const [categories, contents] = await Promise.all([
    db().category.findMany({ orderBy: { name: "asc" } }),
    db().content.findMany({
      select: { id: true, title: true, published: true },
      orderBy: { title: "asc" },
    }),
  ]);
  return (
    <AdminShell>
      <Link className="back" href={`/admin/${section}`}>
        ← Voltar à listagem
      </Link>
      <h1>
        {id === "novo" ? "Adicionar" : "Editar"}{" "}
        {kind === "content"
          ? "conteúdo"
          : kind === "category"
            ? "categoria"
            : "trilha"}
      </h1>
      {erro && (
        <p role="alert" className="error-message">
          {erro}
        </p>
      )}
      <Editor
        kind={kind}
        item={item}
        categories={categories}
        contents={contents}
      />
    </AdminShell>
  );
}
