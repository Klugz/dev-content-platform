export const demoCategory = {
  id: "demo-web",
  name: "Desenvolvimento web",
  description: "Os primeiros passos para construir na web.",
};
export const demoContent = {
  id: "demo-html",
  title: "Seu primeiro passo com HTML",
  description:
    "Material de teste: conheça os elementos básicos de uma página e experimente a estrutura de um documento HTML.",
  url: "https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax",
  source: "MDN Web Docs",
  level: "Iniciante",
  format: "Documentação",
  minutes: 20,
  published: true,
  categoryId: demoCategory.id,
  category: demoCategory,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};
export const demoTrail = {
  id: "demo-trail",
  title: "Primeiros passos na web",
  description:
    "Uma trilha de teste para conhecer a plataforma. Comece pela estrutura de uma página com HTML.",
  level: "Iniciante",
  published: true,
  updatedAt: new Date("2026-01-01"),
  steps: [
    {
      id: "demo-step",
      trailId: "demo-trail",
      contentId: "demo-html",
      position: 0,
      content: demoContent,
    },
  ],
};
