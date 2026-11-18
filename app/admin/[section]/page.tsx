import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { Editor, DeleteButton } from "@/components/admin-forms";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function List({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ salvo?: string; erro?: string }>;
}) {
  await requireAdmin();
  const { section } = await params;
  const p = await searchParams;
  if (
    !["conteudos", "categorias", "trilhas", "configuracoes"].includes(section)
  )
    notFound();
  if (section === "configuracoes") {
    const settings = await db().settings.findUnique({ where: { id: "site" } });
    return (
      <AdminShell>
        <h1>Configurações</h1>
        <p className="lead">Convide os estudantes a avaliar a experiência.</p>
        {p.erro && (
          <p role="alert" className="error-message">
            {p.erro}
          </p>
        )}
        {p.salvo && (
          <p role="status" className="success-message">
            Configurações salvas.
          </p>
        )}
        <Editor kind="settings" item={settings ?? { feedbackUrl: "" }} />
      </AdminShell>
    );
  }
  const kind =
    section === "conteudos"
      ? "content"
      : section === "categorias"
        ? "category"
        : "trail";
  const rows =
    kind === "content"
      ? (
          await db().content.findMany({
            include: { category: true },
            orderBy: { updatedAt: "desc" },
          })
        ).map((r) => ({
          id: r.id,
          name: r.title,
          detail: r.category.name,
          published: r.published,
        }))
      : kind === "category"
        ? (
            await db().category.findMany({
              include: { _count: { select: { contents: true } } },
              orderBy: { name: "asc" },
            })
          ).map((r) => ({
            id: r.id,
            name: r.name,
            detail: `${r._count.contents} conteúdo(s)`,
            published: null,
          }))
        : (
            await db().trail.findMany({
              include: { _count: { select: { steps: true } } },
              orderBy: { updatedAt: "desc" },
            })
          ).map((r) => ({
            id: r.id,
            name: r.title,
            detail: `${r._count.steps} etapa(s)`,
            published: r.published,
          }));
  const title =
    { conteudos: "Conteúdos", categorias: "Categorias", trilhas: "Trilhas" }[
      section
    ] ?? "";
  return (
    <AdminShell>
      <div className="section-heading">
        <div>
          <p className="eyebrow">GESTÃO DO CATÁLOGO</p>
          <h1>{title}</h1>
        </div>
        <Link className="button" href={`/admin/${section}/novo`}>
          Adicionar
        </Link>
      </div>
      {p.salvo && (
        <p role="status" className="success-message">
          Alterações salvas.
        </p>
      )}
      {p.erro && (
        <p role="alert" className="error-message">
          {p.erro}
        </p>
      )}
      <div className="admin-list">
        {rows.length ? (
          rows.map((r) => (
            <article key={r.id}>
              <div>
                <h3>{r.name}</h3>
                <p>{r.detail}</p>
                {r.published !== null && (
                  <span className={r.published ? "badge" : "badge draft"}>
                    {r.published ? "Publicado" : "Rascunho"}
                  </span>
                )}
              </div>
              <div className="row-actions">
                <Link href={`/admin/${section}/${r.id}`}>Editar</Link>
                <DeleteButton kind={kind} id={r.id} />
              </div>
            </article>
          ))
        ) : (
          <p className="empty">
            Nenhum registro. Adicione o primeiro pela plataforma.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
