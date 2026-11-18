"use client";
import { useActionState, useState } from "react";
import { save, remove, login } from "@/app/admin/actions";
import { levels, formats } from "@/lib/validation";
import { ArrowUp, ArrowDown, X, Plus } from "lucide-react";
type RecordData = {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  url?: string;
  source?: string;
  level?: string;
  format?: string;
  minutes?: number;
  categoryId?: string;
  published?: boolean;
  feedbackUrl?: string;
  steps?: { contentId: string }[];
};
export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="editor">
      <label>
        E-mail
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          maxLength={254}
        />
      </label>
      <label>
        Senha
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
      </label>
      {state.error && (
        <p role="alert" className="error-message">
          {state.error}
        </p>
      )}
      <button className="button" disabled={pending}>
        {pending ? "Entrando…" : "Entrar na administração"}
      </button>
    </form>
  );
}
export function Editor({
  kind,
  item = {},
  categories = [],
  contents = [],
}: {
  kind: string;
  item?: RecordData;
  categories?: { id: string; name: string }[];
  contents?: { id: string; title: string; published: boolean }[];
}) {
  const [state, action, pending] = useActionState(
    save.bind(null, kind, item.id),
    {},
    kind === "settings"
      ? "/admin/configuracoes"
      : `/admin/${kind === "content" ? "conteudos" : kind === "category" ? "categorias" : "trilhas"}/${item.id ?? "novo"}`,
  );
  const [steps, setSteps] = useState(item.steps?.map((s) => s.contentId) ?? []);
  const [selected, setSelected] = useState("");
  function move(index: number, dir: number) {
    setSteps((old) => {
      const a = [...old];
      [a[index], a[index + dir]] = [a[index + dir], a[index]];
      return a;
    });
  }
  return (
    <form action={action} className="editor">
      {kind === "settings" ? (
        <label>
          Link do questionário Google Forms
          <input
            name="feedbackUrl"
            type="url"
            defaultValue={item.feedbackUrl}
            placeholder="https://forms.gle/…"
          />
          <small>
            Deixe vazio para manter o questionário como indisponível.
          </small>
        </label>
      ) : (
        <>
          <label>
            {kind === "category" ? "Nome da categoria" : "Título"}
            <input
              name={kind === "category" ? "name" : "title"}
              defaultValue={item.name ?? item.title}
              required
              maxLength={120}
            />
          </label>
          <label>
            Descrição
            <textarea
              name="description"
              defaultValue={item.description}
              required={kind !== "category"}
              rows={4}
              maxLength={kind === "category" ? 500 : 2000}
            />
          </label>
          {kind !== "category" && (
            <label>
              Nível
              <select name="level" defaultValue={item.level ?? levels[0]}>
                {levels.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          )}
          {kind === "content" && (
            <>
              <div className="form-grid">
                <label>
                  Categoria
                  <select
                    name="categoryId"
                    defaultValue={item.categoryId ?? ""}
                    required
                  >
                    <option value="" disabled>
                      Selecione uma categoria
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Formato
                  <select
                    name="format"
                    defaultValue={item.format ?? formats[0]}
                  >
                    {formats.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Link original
                <input
                  type="url"
                  name="url"
                  defaultValue={item.url}
                  placeholder="https://…"
                  required
                  maxLength={2048}
                />
              </label>
              <div className="form-grid">
                <label>
                  Fonte / instituição
                  <input
                    name="source"
                    defaultValue={item.source}
                    required
                    maxLength={120}
                  />
                </label>
                <label>
                  Duração estimada (minutos)
                  <input
                    type="number"
                    name="minutes"
                    defaultValue={item.minutes ?? 20}
                    min={1}
                    max={100000}
                    required
                  />
                </label>
              </div>
              <p className="hint">
                Cadastre apenas recursos gratuitos e confira o endereço na fonte
                original.
              </p>
            </>
          )}
          {kind === "trail" && (
            <fieldset>
              <legend>Etapas da trilha</legend>
              <p className="hint">
                Adicione materiais e use as setas para definir a ordem de
                aprendizagem.
              </p>
              {steps.map((id, i) => (
                <div className="step-editor" key={id}>
                  <input type="hidden" name="contentIds" value={id} />
                  <span>
                    {i + 1}.{" "}
                    {contents.find((c) => c.id === id)?.title ??
                      "Material indisponível"}
                  </span>
                  <button
                    type="button"
                    aria-label={`Mover etapa ${i + 1} para cima`}
                    disabled={!i}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Mover etapa ${i + 1} para baixo`}
                    disabled={i === steps.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remover etapa ${i + 1}`}
                    onClick={() => setSteps((s) => s.filter((v) => v !== id))}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <div className="inline-form">
                <select
                  aria-label="Material para adicionar"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">Selecione um material</option>
                  {contents
                    .filter((c) => !steps.includes(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                        {!c.published ? " (rascunho)" : ""}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="button secondary"
                  disabled={!selected}
                  onClick={() => {
                    setSteps((s) => [...s, selected]);
                    setSelected("");
                  }}
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>
            </fieldset>
          )}
          {kind !== "category" && (
            <label className="checkbox">
              <input
                type="checkbox"
                name="published"
                defaultChecked={item.published ?? false}
              />{" "}
              Publicar e tornar visível aos estudantes
            </label>
          )}
        </>
      )}
      {state.error && (
        <p role="alert" className="error-message">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="success-message">
          {state.success}
        </p>
      )}
      <button className="button" disabled={pending}>
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
export function DeleteButton({ kind, id }: { kind: string; id: string }) {
  const [state, action, pending] = useActionState(
    remove.bind(null, kind, id),
    {},
  );
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Excluir este registro? Esta ação não pode ser desfeita."))
          e.preventDefault();
      }}
    >
      <button className="danger-link" disabled={pending}>
        {pending ? "Excluindo…" : "Excluir"}
      </button>
      {state.error && (
        <p role="alert" className="error-message">
          {state.error}
        </p>
      )}
    </form>
  );
}
