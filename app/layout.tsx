import type { Metadata } from "next";
import Link from "next/link";
import { CodeXml, ArrowUpRight } from "lucide-react";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Trilha.dev • Aprenda, um passo de cada vez",
    template: "%s | Trilha.dev",
  },
  description:
    "Conteúdos gratuitos de programação organizados para você começar. Explore materiais e trilhas de aprendizagem.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip" href="#main">
          Pular para o conteúdo
        </a>
        <header className="header">
          <div className="container nav">
            <Link className="brand" href="/">
              <span className="brand-icon">
                <CodeXml size={22} />
              </span>
              trilha<span className="brand-dot">.dev</span>
            </Link>
            <nav aria-label="Navegação principal">
              <Link href="/conteudos">Explorar conteúdos</Link>
              <Link href="/trilhas">Trilhas de aprendizagem</Link>
              <Link href="/sobre">Sobre o projeto</Link>
            </nav>
            <Link className="nav-action" href="/conteudos">
              Começar a aprender <ArrowUpRight size={17} />
            </Link>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="container footer">
          <div>
            <Link className="brand" href="/">
              trilha<span className="brand-dot">.dev</span>
            </Link>
            <p>Conhecimento aberto. Novas possibilidades.</p>
          </div>
          <span>Um projeto pela educação de qualidade.</span>
          <Link href="/admin">
            Área administrativa <ArrowUpRight size={14} />
          </Link>
        </footer>
      </body>
    </html>
  );
}
