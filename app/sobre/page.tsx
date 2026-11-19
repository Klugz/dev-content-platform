import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { ArrowUpRight, BookOpen } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function About() {
  const { feedbackUrl } = await catalog();
  return (
    <div className="container page narrow">
      <p className="eyebrow">SOBRE O PROJETO</p>
      <h1>
        Conhecimento aberto.
        <br />
        Novas possibilidades.
      </h1>
      <p className="lead">
        A Trilha.dev aproxima estudantes da rede pública de conteúdos gratuitos
        de programação e tecnologia.
      </p>
      <div className="prose">
        <h2>Um lugar para começar</h2>
        <p>
          Existem muitos materiais gratuitos na internet. Encontrar um bom ponto
          de partida nem sempre é fácil. Esta plataforma reúne recursos
          organizados por assunto, nível e formato, com trilhas que ajudam a
          orientar os estudos.
        </p>
        <h2>Como funciona</h2>
        <p>
          Explore o catálogo, filtre pelo que você quer aprender ou siga uma
          trilha. Cada material leva à sua fonte original. Não é necessário
          criar uma conta para estudar.
        </p>
        <h2>Educação que amplia oportunidades</h2>
        <p>
          Projeto extensionista de Análise e Desenvolvimento de Sistemas,
          desenvolvido por Henrique Klug, com foco em estudantes da rede pública
          em Curitiba. A iniciativa se relaciona ao ODS 4, Educação de
          Qualidade, e ao ODS 10, Redução das Desigualdades.
        </p>
      </div>
      <section className="feedback-box">
        <BookOpen size={28} />
        <h2>Sua experiência ajuda a melhorar.</h2>
        <p>
          Conte o que achou da organização, da facilidade de uso e dos
          materiais.
        </p>
        <Link className="button" href="/feedback">
          Deixar um comentário
        </Link>
        {feedbackUrl ? (
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button"
          >
            Responder questionário <ArrowUpRight size={17} />
          </a>
        ) : null}
      </section>
    </div>
  );
}
