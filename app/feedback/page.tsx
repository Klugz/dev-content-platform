import { catalog } from "@/lib/catalog";
import { FeedbackForm } from "@/components/feedback-form";
export const dynamic = "force-dynamic";
export const metadata = { title: "Comentários e feedback" };
export default async function Feedback() {
  const data = await catalog();
  return (
    <div className="container page narrow">
      <p className="eyebrow">SUA VOZ FAZ PARTE</p>
      <h1>Ajude a melhorar a Trilha.dev.</h1>
      <p className="lead">
        Compartilhe sua experiência com a plataforma ou com os conteúdos.
        Sugestões, dificuldades e elogios são bem-vindos.
      </p>
      <FeedbackForm
        contents={data.contents.map((c) => ({ id: c.id, title: c.title }))}
        disabled={data.demo}
      />
    </div>
  );
}
