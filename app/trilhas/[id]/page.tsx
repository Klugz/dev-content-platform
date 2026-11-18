import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { catalog } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Trail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await catalog();
  const t = data.trails.find((t) => t.id === id);
  if (!t) notFound();
  return (
    <div className="container page narrow">
      <Link className="back" href="/trilhas">
        <ArrowLeft size={16} /> Todas as trilhas
      </Link>
      <p className="eyebrow">SEU CAMINHO DE APRENDIZAGEM</p>
      <h1>{t.title}</h1>
      <p className="lead">{t.description}</p>
      <div className="meta">
        <span className="badge">{t.level}</span>
        <span>{t.steps.length} etapa(s)</span>
        <span>
          {t.steps.reduce((n, s) => n + s.content.minutes, 0)} min estimados
        </span>
      </div>
      <ol className="steps">
        {t.steps.map((s, i) => (
          <li key={s.id}>
            <span className="step-number">{i + 1}</span>
            <div>
              <p className="eyebrow">
                {s.content.format} · {s.content.minutes} MIN
              </p>
              <h2>
                <Link href={`/conteudos/${s.content.id}`}>
                  {s.content.title}
                </Link>
              </h2>
              <p>{s.content.description}</p>
              <Link className="text-link" href={`/conteudos/${s.content.id}`}>
                Conhecer conteúdo <ArrowUpRight size={16} />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
