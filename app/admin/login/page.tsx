import { LoginForm } from "@/components/admin-forms";
import { getAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function Login() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="container page login">
      <span className="tile">
        <LockKeyhole />
      </span>
      <h1>Bem-vindo de volta.</h1>
      <p className="lead">
        Entre para organizar novos caminhos de aprendizagem.
      </p>
      {!process.env.DATABASE_URL && (
        <p className="demo-note">
          A administração estará disponível após configurar o Supabase e criar
          seu acesso com o comando admin:create.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
