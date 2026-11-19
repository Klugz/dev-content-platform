import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3, FileText } from "lucide-react";
import { catalog } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await catalog();
  const c = data.contents.find((c) => c.id === id);
  if (!c) notFound();
  return (
    <div className="container page narrow">
      <Link className="back" href="/conteudos">
        <ArrowLeft size={16} /> Todos os conteúdos
      </Link>
      <div className="detail">
        <p className="eyebrow">{c.category.name}</p>
        <h1>{c.title}</h1>
        <div className="meta">
          <span className="badge">{c.level}</span>
          <span>
            <FileText size={16} />
            {c.format}
          </span>
          <span>
            <Clock3 size={16} />
            {c.minutes} min estimados
          </span>
        </div>
        <p className="lead">{c.description}</p>
        <div className="source-box">
          <div>
            <small>DISPONÍVEL GRATUITAMENTE EM</small>
            <h3>{c.source}</h3>
            <p>O material será aberto no site original.</p>
          </div>
          <a
            className="button"
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Acessar conteúdo <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
