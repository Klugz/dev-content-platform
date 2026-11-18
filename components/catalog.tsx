import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  FileText,
  Route,
  ArrowRight,
} from "lucide-react";
export type Material = {
  id: string;
  title: string;
  description: string;
  source: string;
  format: string;
  level: string;
  minutes: number;
  category: { name: string };
};
export function ContentCard({ item }: { item: Material }) {
  return (
    <article className="content-card">
      <div className="card-top">
        <span className="tile">
          <FileText size={22} />
        </span>
        <span className="badge">{item.level}</span>
      </div>
      <p className="eyebrow muted">{item.category.name}</p>
      <h3>
        <Link href={`/conteudos/${item.id}`}>{item.title}</Link>
      </h3>
      <p className="description">{item.description}</p>
      <div className="meta">
        <span>
          <FileText size={14} />
          {item.format}
        </span>
        <span>
          <Clock3 size={14} />
          {item.minutes} min
        </span>
      </div>
      <div className="card-bottom">
        <span>{item.source}</span>
        <Link
          href={`/conteudos/${item.id}`}
          aria-label={`Conhecer ${item.title}`}
        >
          <ArrowUpRight size={22} />
        </Link>
      </div>
    </article>
  );
}
export function TrailCard({
  trail,
}: {
  trail: {
    id: string;
    title: string;
    description: string;
    level: string;
    steps: { content: { minutes: number } }[];
  };
}) {
  return (
    <article className="trail-card">
      <span className="tile">
        <Route size={24} />
      </span>
      <div>
        <div className="meta">
          <span className="badge">{trail.level}</span>
          <span>
            {trail.steps.length} {trail.steps.length === 1 ? "etapa" : "etapas"}{" "}
            · {trail.steps.reduce((n, s) => n + s.content.minutes, 0)} min
          </span>
        </div>
        <h3>
          <Link href={`/trilhas/${trail.id}`}>{trail.title}</Link>
        </h3>
        <p>{trail.description}</p>
      </div>
      <Link
        className="round-arrow"
        href={`/trilhas/${trail.id}`}
        aria-label={`Ver trilha ${trail.title}`}
      >
        <ArrowRight size={20} />
      </Link>
    </article>
  );
}
export function Empty({
  title = "Novos caminhos estão chegando.",
  text = "Os materiais estão sendo organizados. Volte em breve para explorar.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty">
      <Route size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function DemoNotice() {
  return (
    <div className="demo-note">
      Catálogo selecionado · prévia sem banco conectado · alterações
      administrativas disponíveis após conectar o banco.
    </div>
  );
}
