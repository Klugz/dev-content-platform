"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container page empty">
      <h1>Não foi possível carregar a plataforma.</h1>
      <p>
        Tente novamente. Se o problema continuar, verifique a configuração e a
        disponibilidade do banco de dados.
      </p>
      <button className="button" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
