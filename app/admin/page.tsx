import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Admin() {
  await requireAdmin();
  const [contents, published, trails, categories] = await Promise.all([
    db().content.count(),
    db().content.count({ where: { published: true } }),
    db().trail.count(),
    db().category.count(),
  ]);
  return (
    <AdminShell>
      <p className="eyebrow">SEU ESPAÇO DE CURADORIA</p>
      <h1>Vamos abrir novos caminhos?</h1>
      <p className="lead">
        Organize os materiais que vão fazer parte da próxima descoberta de
        alguém.
      </p>
      <div className="stats">
        {[
          [contents, "Conteúdos"],
          [published, "Publicados"],
          [trails, "Trilhas"],
          [categories, "Categorias"],
        ].map(([n, label]) => (
          <div key={label}>
            <strong>{n}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="admin-welcome">
        <h2>Da descoberta à aprendizagem.</h2>
        <p>
          Cadastre uma categoria, adicione um recurso gratuito e organize seus
          materiais em uma trilha. Salve como rascunho enquanto revisa.
        </p>
        <Link className="button" href="/admin/conteudos/novo">
          Adicionar conteúdo
        </Link>
      </div>
    </AdminShell>
  );
}
