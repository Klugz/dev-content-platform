import Link from "next/link";
import { Search } from "lucide-react";
import { catalog } from "@/lib/catalog";
import { levels, formats } from "@/lib/validation";
import { ContentCard, Empty, DemoNotice } from "@/components/catalog";
export const dynamic = "force-dynamic";
export default async function Contents({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await catalog();
  const p = await searchParams;
  const val = (k: string) => (typeof p[k] === "string" ? (p[k] as string) : "");
  const q = val("q");
  const norm = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = data.contents.filter(
    (c) =>
      (!q ||
        norm(
          `${c.title} ${c.description} ${c.source} ${c.category.name}`,
        ).includes(norm(q))) &&
      (!val("categoria") || c.categoryId === val("categoria")) &&
      (!val("nivel") || c.level === val("nivel")) &&
      (!val("formato") || c.format === val("formato")),
  );
  return (
    <div className="container page">
      {data.demo && <DemoNotice />}
      <p className="eyebrow">SUA BIBLIOTECA ABERTA</p>
      <h1>Todos os conteúdos.</h1>
      <p className="lead">
        Um novo conhecimento pode ser o começo de muitas possibilidades.
      </p>
      <form className="filters" action="/conteudos">
        <label className="search-field">
          <span>Buscar</span>
          <div>
            <Search size={18} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Título, assunto ou fonte"
              maxLength={100}
            />
          </div>
        </label>
        <label>
          Categoria
          <select name="categoria" defaultValue={val("categoria")}>
            <option value="">Todas as categorias</option>
            {data.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nível
          <select name="nivel" defaultValue={val("nivel")}>
            <option value="">Todos os níveis</option>
            {levels.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Formato
          <select name="formato" defaultValue={val("formato")}>
            <option value="">Todos os formatos</option>
            {formats.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <button className="button">Filtrar</button>
      </form>
      <div className="results">
        <span>
          {filtered.length}{" "}
          {filtered.length === 1
            ? "conteúdo encontrado"
            : "conteúdos encontrados"}
        </span>
        <Link href="/conteudos">Limpar filtros</Link>
      </div>
      {filtered.length ? (
        <div className="cards">
          {filtered.map((c) => (
            <ContentCard key={c.id} item={c} />
          ))}
        </div>
      ) : (
        <Empty
          title="Nenhum conteúdo encontrado."
          text="Experimente outro termo ou remova alguns filtros."
        />
      )}
    </div>
  );
}
