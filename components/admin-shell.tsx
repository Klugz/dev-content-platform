import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Route,
  Settings,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="container admin-layout">
      <aside className="sidebar">
        <p className="eyebrow">ADMINISTRAÇÃO</p>
        <nav aria-label="Administração">
          {[
            ["/admin", "Visão geral", LayoutDashboard],
            ["/admin/conteudos", "Conteúdos", FileText],
            ["/admin/categorias", "Categorias", Folder],
            ["/admin/trilhas", "Trilhas", Route],
            ["/admin/feedback", "Feedback", MessageSquare],
            ["/admin/configuracoes", "Configurações", Settings],
          ].map(([href, label, Icon]) => {
            const I = Icon as typeof FileText;
            return (
              <Link key={href as string} href={href as string}>
                <I size={18} />
                {label as string}
              </Link>
            );
          })}
        </nav>
        <div className="admin-account">
          <small>{admin.email}</small>
          <form action={logout}>
            <button>
              <LogOut size={16} />
              Sair
            </button>
          </form>
        </div>
      </aside>
      <section className="admin-main">{children}</section>
    </div>
  );
}
