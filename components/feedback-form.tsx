"use client";
import { useActionState, useState } from "react";
import { submitFeedback } from "@/app/feedback/actions";
export function FeedbackForm({
  contents,
  disabled,
}: {
  contents: { id: string; title: string }[];
  disabled: boolean;
}) {
  const [state, action, pending] = useActionState(submitFeedback, {});
  const [topic, setTopic] = useState("platform");
  if (state.success)
    return (
      <div className="feedback-box" role="status">
        <h2>Obrigado por participar!</h2>
        <p>{state.success}</p>
        <a className="button" href="/feedback">
          Enviar outro comentário
        </a>
      </div>
    );
  return (
    <form action={action} className="editor">
      <label>
        Nome (opcional)
        <input
          name="name"
          maxLength={80}
          autoComplete="given-name"
          placeholder="Como você gostaria de ser chamado?"
        />
      </label>
      <label>
        Sobre o que você quer falar?
        <select
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="platform">A plataforma</option>
          <option value="content">Um conteúdo</option>
        </select>
      </label>
      {topic === "content" && (
        <label>
          Conteúdo
          <select name="contentId" required defaultValue="">
            <option value="" disabled>
              Selecione um conteúdo
            </option>
            {contents.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {!contents.length && (
            <small>Nenhum conteúdo disponível para comentar.</small>
          )}
        </label>
      )}
      <label>
        Seu comentário
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={7}
          aria-describedby="message-hint"
          placeholder="O que ajudou nos seus estudos? O que podemos melhorar?"
        />
        <small id="message-hint">
          De 10 a 2.000 caracteres. Não inclua senhas, telefone ou outros dados
          pessoais.
        </small>
      </label>
      <div className="feedback-trap" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="muted">
        Seu comentário será lido apenas pela equipe responsável. Ele não será
        publicado no site.
      </p>
      {state.error && <p role="alert">{state.error}</p>}
      {disabled && (
        <p role="status">
          O envio ficará disponível quando o banco estiver conectado.
        </p>
      )}
      <button
        className="button"
        disabled={
          disabled || pending || (topic === "content" && !contents.length)
        }
      >
        {pending ? "Enviando…" : "Enviar comentário"}
      </button>
    </form>
  );
}
