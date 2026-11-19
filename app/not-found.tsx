import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container page empty">
      <h1>Este caminho não foi encontrado.</h1>
      <p>O conteúdo pode ter sido removido ou ainda não estar publicado.</p>
      <Link className="button" href="/conteudos">
        Todos os conteúdos
      </Link>
    </div>
  );
}
