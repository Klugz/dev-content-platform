# Trilha.dev

Plataforma de curadoria de conteúdos gratuitos de programação, desenvolvida com Next.js App Router, TypeScript, Prisma 7 e PostgreSQL. Preparada para Supabase e Vercel. Inspirada na arquitetura do [reading-tracker-app](https://github.com/Klugz/reading-tracker-app).

## Funcionalidades

- Catálogo público, busca por título, descrição, fonte e categoria; filtros combinados por categoria, nível e formato.
- Detalhes e links externos seguros para os materiais originais.
- Trilhas com etapas ordenadas e duração estimada.
- Administração autenticada: criar, editar, excluir e publicar materiais e trilhas; gerenciar categorias e ordenar etapas.
- Rascunhos não aparecem no catálogo. Uma trilha publicada exige etapas publicadas. Materiais vinculados não podem ser excluídos sem remover os vínculos.
- Link de feedback Google Forms configurável no painel, na página Sobre.
- Interface responsiva em português, labels acessíveis, navegação por teclado e estados vazios/erros.
- Apenas **um material de teste**, uma categoria e uma trilha de teste no seed opcional.

Não há cadastro de estudantes ou coleta de dados pessoais para navegar. O questionário é externo e administrado pelo responsável pelo projeto. O nome Trilha.dev é uma identidade provisória; não representa domínio registrado.

## Executar

Requisitos: Node.js 24 e pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
pnpm db:generate
pnpm dev
```

Abra http://localhost:3000. Com `DEMO_MODE=true` e sem `DATABASE_URL`, o catálogo exibe uma prévia somente de leitura com o material de teste. A administração exige um banco real. Erros em uma conexão configurada são exibidos como falhas, nunca substituídos por dados de demonstração.

## Conectar ao Supabase

1. Crie um projeto Supabase e obtenha as conexões no painel **Connect**.
2. Em `.env`, defina `DATABASE_URL` com a URL do transaction pooler e `DIRECT_URL` com a conexão direta ou session pooler. Preserve os parâmetros TLS recomendados pelo Supabase. Não desabilite a verificação dos certificados.
3. Use credenciais com acesso às tabelas pelo servidor. A migração habilita RLS sem políticas públicas e revoga permissões de `anon`/`authenticated`. Supabase Auth não é usado: o login administrativo pertence à aplicação, com senhas scrypt e sessões persistidas com hash. Desative a Data API se não for utilizá-la.
4. Execute as migrations no banco destinado a esta plataforma:

```sh
pnpm db:deploy
# Opcional, uma única amostra para testar:
pnpm db:seed
```

5. Defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo de 12 caracteres) no ambiente local e execute:

```sh
pnpm admin:create
```

Remova `ADMIN_PASSWORD` do ambiente após a criação. O comando cria uma conta; não sobrescreve senhas existentes. Nenhuma conta ou senha padrão é inserida pelo seed. Para revogar sessões de uma conta, remova suas linhas na tabela `Session` usando um acesso administrativo ao banco.

6. Defina `DEMO_MODE=false`, inicie a aplicação e acesse `/admin`. Cadastre categorias, materiais e trilhas. Configure o link do Google Forms em **Configurações**.

O seed tem um marcador transacional: executá-lo novamente preserva edições e exclusões. Não existe seed automático em build, startup ou deploy. As migrations são versionadas; não use `db push` ou reset em produção.

## Publicar na Vercel

1. Importe o repositório no painel Vercel, preset **Next.js**, Node **24.x**.
2. Instalação: `pnpm install --frozen-lockfile`. Build: `pnpm build`.
3. Configure `DATABASE_URL` apenas no servidor, sem prefixo `NEXT_PUBLIC_`, e `DEMO_MODE=false`. Use um banco separado para previews. `DIRECT_URL` e as credenciais de criação do administrador ficam no ambiente administrativo, fora da Vercel.
4. Aplique migrations e crie o administrador antes de usar o deploy. O build apenas gera o Prisma Client e compila Next.js; não modifica o banco.
5. Confira o catálogo, login, CRUD, filtros e trilhas no domínio HTTPS. Faça backup do PostgreSQL antes de alterações de esquema.

O pool Prisma usa até três conexões por processo. Para separar privilégios, use uma credencial de migração e outra de runtime com DML nas tabelas da aplicação e `BYPASSRLS`; nunca exponha essas credenciais ao navegador. O servidor aplica a autorização em todas as ações administrativas. Cookies são HttpOnly, SameSite=Lax e Secure em produção, com expiração de oito horas; logout revoga a sessão. Tentativas de login são limitadas por conta no banco, compartilhadas entre instâncias.

## Verificar

```sh
pnpm db:generate
pnpm typecheck
pnpm test
pnpm test:db
pnpm build
pnpm test:http
```

`test:db` e `test:http` criam PostgreSQL descartável em loopback, com dados exclusivamente de teste, sem usar `DATABASE_URL`. O teste HTTP precisa do build pronto. As portas locais 55439, 55441 e 3001 devem estar disponíveis. Em Linux, execute como usuário comum (PostgreSQL não roda como root). A CI usa o runner Ubuntu como usuário comum.

Para inspeção manual com uma base descartável: `pnpm preview:test`. Abra http://127.0.0.1:3000 e use `admin@example.test` / `Preview-testing-2026`. Essas credenciais pertencem **somente ao ambiente temporário criado pelo script**, nunca ao seed de produção. Ctrl+C encerra o servidor e o banco temporário. Não publique esse ambiente de teste.

## Estrutura

- `app/`: páginas públicas e administração com Server Actions.
- `components/`: cartões, formulários e navegação.
- `lib/`: validação, catálogo, autenticação e acesso Prisma.
- `prisma/`: esquema, migration inicial, RLS e seed idempotente.
- `scripts/`: criação de administrador e verificações em banco descartável.
- `tests/`: regras de validação e senhas.

Arquitetura baseada na documentação oficial de [Next.js Authentication](https://nextjs.org/docs/app/guides/authentication), [Prisma com driver PostgreSQL](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers) e [Prisma no Supabase](https://supabase.com/docs/guides/database/prisma).
