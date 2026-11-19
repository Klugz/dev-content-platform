# Curadoria inicial — 18 de novembro de 2026

Seleção aprovada pelo usuário para ampliar o catálogo inicial. Foram priorizados conteúdos em PT-BR com acesso gratuito, sequência definida e conclusão de um módulo ou projeto. Curso modular está identificado como módulo, sem sugerir que cobre uma formação inteira. Não foram cadastradas páginas genéricas de canais, eventos encerrados ou playlists sem um percurso definido.

O conjunto compartilhado entre prévia e importação está em `data/curated-catalog.json`. O comando `pnpm db:seed` (ou o alias compatível `pnpm db:curate`) importa os cursos e trilhas no PostgreSQL configurado. Sem banco, a prévia já apresenta os mesmos cursos; isso não representa persistência no Supabase.

## Seleção e evidências

| Curso e fonte                                                                                                                                 | Estrutura e conclusão                                                                    | Evidência de qualidade / ressalva                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Algoritmos — Curso em Vídeo](https://www.cursoemvideo.com/curso/curso-de-algoritmo/)                                                         | Aulas e exercícios de lógica, decisões e repetições                                      | Didática recomendada por estudantes; reputação qualitativa, sem nota específica verificada                                                          |
| [Python Mundo 1 — Curso em Vídeo](https://www.cursoemvideo.com/curso/python-3-mundo-1/)                                                       | Primeiro módulo completo com desafios                                                    | Avaliação do conjunto de Python do autor no Cursa: 5/5, 14 avaliações; não é nota exclusiva deste módulo                                            |
| [Discover — Rocketseat](https://www.rocketseat.com.br/discover)                                                                               | Sete módulos, site de links ao final                                                     | Experiência positiva declarada pelo usuário; ementa e projeto verificáveis. Sem nota consolidada                                                    |
| [HTML/CSS módulo 1 — Curso em Vídeo](https://www.cursoemvideo.com/curso/html5-css3-modulo1/)                                                  | Módulo com vídeos, PDFs e exercícios                                                     | Reputação do autor e adequação para iniciantes; não representa todos os cinco módulos                                                               |
| [Java Básico — Curso em Vídeo](https://www.cursoemvideo.com/curso/java-basico/)                                                               | Fundamentos, exemplos e exercícios até vetores/métodos                                   | Base antes de Spring; instalações e interfaces gráficas antigas, aviso no catálogo                                                                  |
| [Java com Spring Boot — Rocketseat](https://app.rocketseat.com.br/journey/java-com-spring-boot-curso-introdutorio/overview)                   | 29 aulas, API de tarefas                                                                 | Projeto com escopo definido; cadastrado como intermediário pela necessidade de base em Java, embora a fonte use iniciante                           |
| [PHP Moderno módulo 1 — Curso em Vídeo](https://www.cursoemvideo.com/curso/curso-de-php-moderno-modulo-01/)                                   | Sequência de aulas e desafios de formulários e dados                                     | Selecionada a versão moderna; familiaridade com HTML e lógica recomendada                                                                           |
| [MySQL — Curso em Vídeo](https://www.cursoemvideo.com/curso/mysql/)                                                                           | Aulas de tabelas até JOINs e exercícios                                                  | Fundamentos transferíveis; telas de instalação antigas                                                                                              |
| [IA módulo 1 — Curso em Vídeo](https://www.cursoemvideo.com/curso/curso-gratis-de-inteligencia-artificial/)                                   | Conceitos, prompts, prática e limitações                                                 | Alfabetização em IA, não treinamento de modelos; planos de ferramentas podem mudar                                                                  |
| [Conceitos de nuvem — Microsoft Learn](https://learn.microsoft.com/pt-br/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts) | Três módulos com avaliações, 56 minutos                                                  | Fonte oficial em PT-BR, sem nota pública verificada. Exceção baseada na credibilidade técnica e estrutura; não apresentado como avaliado por alunos |
| [Jogo 2D com Godot — Papai Game Maker / Cursa](https://cursa.app/pt/curso-gratuito/desenvolvimento-de-jogos-usando-godot-bddd)                | 21 aulas e exercícios, da criação do projeto aos inimigos finalizados e controles mobile | 4,6/5 em 11 avaliações. Material antigo com APIs como Position2D; não anunciado como Godot 4. A versão exata não foi confirmada                     |

As avaliações são da plataforma indicada, com amostras pequenas; não são notas atribuídas pela Trilha.dev. Boa reputação não é equivalente a nota numérica. A revisão conferiu páginas públicas, ementas e condições anunciadas, sem concluir integralmente todos os cursos ou refazer todos os projetos.

Fontes complementares de recepção:

- [Avaliações de Python do Curso em Vídeo no Cursa](https://cursa.com.br/curso-python-3-b%C3%A1sico-ao-avan%C3%A7ado-gr%C3%A1tis/92).
- [Relatos de estudantes sobre lógica e Python do Guanabara](https://www.reddit.com/r/brdev/comments/spg247/qual_o_melhor_curso_de_l%C3%B3gica_de_programa%C3%A7%C3%A3o_do/).

## Duração e custos

As 40h declaradas nos cursos do Guanabara são cargas horárias do provedor, não a soma medida dos vídeos. Para Spring foram usadas as 7h de estudo informadas pela Rocketseat, não as 3h53 de vídeo. O catálogo mantém estimativas em minutos conforme o modelo existente.

Os cursos do Guanabara cobram certificado opcional. Discover informa certificado gratuito. Cursa informa conteúdo e certificado gratuitos; obtenção do certificado pode envolver o aplicativo. Cloud limita-se ao percurso conceitual: contratação de recursos e provas não é necessária. Planos pagos das ferramentas de IA e hospedagem de APIs não fazem parte da gratuidade das aulas.

## Organização

Sete trilhas: começar a programar; construir o primeiro site; primeira API em Java; back-end com PHP; conceitos de nuvem; IA com senso crítico; primeiro jogo 2D. Trilhas introdutórias podem terminar em uma etapa intermediária, com a base construída nas etapas anteriores. Não é necessário fazer todas as trilhas nem repetir um curso já concluído.

Ficaram fora desta rodada: Node.js de 2022 por exigir revisão das dependências; ofertas AWS sem idioma PT-BR confirmado no destino; bootcamps antigos com inscrições encerradas; DSA e Mente Binária com avaliação ainda insuficientemente verificada para esta seleção. DevDojo continua como opção futura, após delimitar um percurso e revisar sua extensão para o público escolar.

A inclusão de Godot prioriza um projeto estruturado e avaliação pública, com a limitação de versão visível. Antes de uma oficina acompanhada, o responsável deve preparar o ambiente compatível e testar o projeto do curso.
