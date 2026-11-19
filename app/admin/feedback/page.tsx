import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function FeedbackInbox({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const p = Number((await searchParams).page || 1);
  const page = Number.isSafeInteger(p) && p > 0 ? Math.min(p, 100000) : 1;
  const items = await db().studentFeedback.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * 20,
    take: 21,
  });
  return (
    <AdminShell>
      <p className="eyebrow">ESCUTA DOS ALUNOS</p>
      <h1>Comentários e feedback</h1>
      <p className="lead">Mensagens privadas enviadas pelos alunos.</p>
      {items.length ? (
        items.slice(0, 20).map((item) => (
          <article className="feedback-entry" key={item.id}>
            <h2>{item.contentTitle || "Sobre a plataforma"}</h2>
            <p className="muted">
              {item.name || "Anônimo"} ·{" "}
              <time dateTime={item.createdAt.toISOString()}>
                {item.createdAt.toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </time>
            </p>
            <p className="feedback-message">{item.message}</p>
          </article>
        ))
      ) : (
        <p>Nenhum comentário nesta página.</p>
      )}
      <div className="section-heading">
        {page > 1 && (
          <Link href={`/admin/feedback?page=${page - 1}`}>Página anterior</Link>
        )}
        {items.length > 20 && (
          <Link href={`/admin/feedback?page=${page + 1}`}>Próxima página</Link>
        )}
      </div>
    </AdminShell>
  );
}
