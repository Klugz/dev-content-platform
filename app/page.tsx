import Link from "next/link";
import {
  ArrowRight,
  Search,
  CodeXml,
  Braces,
  Terminal,
  Database,
  GitBranch,
  Sparkles,
  BookOpen,
  Compass,
  Route,
} from "lucide-react";
import { catalog } from "@/lib/catalog";
import {
  ContentCard,
  TrailCard,
  Empty,
  DemoNotice,
} from "@/components/catalog";
export const dynamic = "force-dynamic";
export default async function Home() {
  const data = await catalog();
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="pill">
              <span className="status-dot" /> SEU PRÓXIMO PASSO COMEÇA AQUI
            </span>
            <h1>
              O mundo da tecnologia.
              <br />
              <em>Ao seu alcance.</em>
            </h1>
            <p>
              Aprenda programação com conteúdos gratuitos,
              <br className="desktop" /> organizados para você encontrar seu
              caminho.
            </p>
            <form action="/conteudos" className="hero-search">
              <Search size={21} />
              <input
                name="q"
                aria-label="O que você quer aprender?"
                placeholder="O que você quer aprender?"
                maxLength={100}
              />
              <button aria-label="Buscar conteúdos">
                <ArrowRight size={21} />
              </button>
            </form>
            <div className="hero-foot">
              <span>
                <span className="check">✓</span> 100% gratuito
              </span>
              <span>
                <span className="check">✓</span> No seu ritmo
              </span>
              <span>
                <span className="check">✓</span> Para todos
              </span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="float-icon icon-code">
              <CodeXml />
            </span>
            <span className="float-icon icon-terminal">
              <Terminal />
            </span>
            <span className="float-icon icon-braces">
              <Braces />
            </span>
            <div className="code-window">
              <div className="window-bar">
                <i />
                <i />
                <i />
                <span>seu-futuro.js</span>
              </div>
              <div className="code-body">
                <span className="code-comment">// todo grande caminho</span>
                <br />
                <span className="code-comment">
                  // começa com um primeiro passo
                </span>
                <br />
                <br />
                <span className="purple">const</span> futuro = &#123;
                <br />
                &nbsp; curiosidade: <span className="orange">true</span>,<br />
                &nbsp; possibilidades:{" "}
                <span className="orange">"infinitas"</span>,<br />
                &nbsp; primeiroPasso: <span className="orange">"começar"</span>
                <br />
                &#125;;
                <br />
                <br />
                <span className="purple">vamos</span>.
                <span className="green">aprender</span>();
                <span className="cursor" />
              </div>
            </div>
            <div className="floating-caption">
              <Sparkles size={18} />
              <span>Seu futuro tem muitas possibilidades.</span>
            </div>
          </div>
        </div>
      </section>
      <div className="container">
        {data.demo && <DemoNotice />}
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EXPLORE POSSIBILIDADES</p>
              <h2>Por onde você quer começar?</h2>
            </div>
            <Link href="/conteudos">
              Ver todos os conteúdos <ArrowRight size={17} />
            </Link>
          </div>
          {data.categories.length ? (
            <div className="category-grid">
              {data.categories.map((cat, i) => {
                const Icon = [CodeXml, Braces, Database, GitBranch, Terminal][
                  i % 5
                ];
                return (
                  <Link
                    className="category-card"
                    key={cat.id}
                    href={`/conteudos?categoria=${cat.id}`}
                  >
                    <Icon size={27} />
                    <h3>{cat.name}</h3>
                    <span>
                      {
                        data.contents.filter((c) => c.categoryId === cat.id)
                          .length
                      }{" "}
                      material disponível <ArrowUp />
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Empty />
          )}
        </section>
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">UM PASSO DE CADA VEZ</p>
              <h2>Um caminho para chamar de seu.</h2>
              <p>Não sabe por onde começar? Siga uma trilha de aprendizagem.</p>
            </div>
            <Link href="/trilhas">
              Explorar trilhas <ArrowRight size={17} />
            </Link>
          </div>
          {data.trails.length ? (
            <div className="trail-list">
              {data.trails.slice(0, 3).map((t) => (
                <TrailCard key={t.id} trail={t} />
              ))}
            </div>
          ) : (
            <Empty />
          )}
        </section>
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CONHECIMENTO QUE ABRE PORTAS</p>
              <h2>Encontre sua próxima descoberta.</h2>
            </div>
            <Link href="/conteudos">
              Explorar biblioteca <ArrowRight size={17} />
            </Link>
          </div>
          <div className="cards">
            {data.contents.slice(0, 3).map((c) => (
              <ContentCard key={c.id} item={c} />
            ))}
          </div>
          {!data.contents.length && <Empty />}
        </section>
        <section className="mission">
          <div className="mission-icon">
            <BookOpen size={34} />
          </div>
          <div>
            <p className="eyebrow">APRENDER MUDA CAMINHOS</p>
            <h2>Tecnologia é para você também.</h2>
            <p>
              Uma iniciativa para aproximar estudantes da programação.
              <br />
              Sem custos, sem barreiras. Com curiosidade e um lugar para
              começar.
            </p>
            <Link href="/sobre">
              Conheça o projeto <ArrowRight size={17} />
            </Link>
          </div>
          <div className="mission-side">
            <Compass size={40} />
            <span>
              Mais acesso.
              <br />
              Mais possibilidades.
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
function ArrowUp() {
  return <ArrowRight size={15} />;
}
