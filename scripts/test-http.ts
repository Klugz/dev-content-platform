// Integration tests against an isolated production server and temporary PostgreSQL.
import EmbeddedPostgres from "embedded-postgres";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import assert from "node:assert/strict";
const dir = await mkdtemp(join(tmpdir(), "trilhadev-http-"));
const pg = new EmbeddedPostgres({
  databaseDir: join(dir, "db"),
  user: "postgres",
  password: "http-test-only",
  port: 55441,
  persistent: false,
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: () => {},
});
const origin = "http://127.0.0.1:3001";
let db: PrismaClient | undefined,
  server: ChildProcess | undefined,
  cookie = "";
const decode = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
async function get(path: string, authenticated = true) {
  return fetch(origin + path, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
    headers: authenticated && cookie ? { cookie } : {},
  });
}
async function post(
  path: string,
  fields: Record<string, string | string[]>,
  formIndex = -1,
  authenticated = true,
) {
  console.log("Testing action:", path);
  const html = await (await get(path)).text();
  const forms = [...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)].map(
    (m) => m[1],
  );
  assert.ok(forms.length, `Form at ${path}`);
  const form = forms.at(formIndex)!;
  const data = new FormData();
  for (const input of form.matchAll(/<input\b[^>]*>/g)) {
    const attrs = Object.fromEntries(
      [...input[0].matchAll(/([\w$:-]+)="([^"]*)"/g)].map((m) => [
        m[1],
        decode(m[2]),
      ]),
    );
    if (attrs.name?.startsWith("$ACTION"))
      data.append(attrs.name, attrs.value ?? "");
  }
  assert.ok(
    [...data.keys()].some((k) => k.startsWith("$ACTION")),
    `Action at ${path}`,
  );
  for (const [k, v] of Object.entries(fields))
    for (const value of Array.isArray(v) ? v : [v]) data.append(k, value);
  return fetch(origin + path, {
    method: "POST",
    body: data,
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
    headers: { origin, ...(authenticated && cookie ? { cookie } : {}) },
  });
}
try {
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("http_test");
  const url = "postgresql://postgres:http-test-only@127.0.0.1:55441/http_test";
  const env = {
    ...process.env,
    DATABASE_URL: url,
    DIRECT_URL: url,
    DEMO_MODE: "false",
    ADMIN_EMAIL: "test@example.test",
    ADMIN_PASSWORD: "HTTP-testing-2026",
  };
  for (const [bin, args] of [
    ["prisma", ["migrate", "deploy"]],
    ["tsx", ["prisma/seed-sample.ts"]],
    ["tsx", ["scripts/create-admin.ts"]],
  ] as const)
    execFileSync(`node_modules/.bin/${bin}`, [...args], { env, stdio: "pipe" });
  db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  server = spawn(
    "node_modules/.bin/next",
    ["start", "--hostname", "127.0.0.1", "--port", "3001"],
    { env, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stderr?.on("data", (chunk) => process.stderr.write(chunk));
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await get("/", false)).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.ok(ready, "Production server ready");
  assert.match(
    await (await get("/admin", false)).text(),
    /NEXT_REDIRECT.*admin\/login/,
  );
  assert.match(
    await (await get("/admin/conteudos/novo", false)).text(),
    /NEXT_REDIRECT.*admin\/login/,
  );
  assert.match(
    await (await get("/conteudos/absent", false)).text(),
    /Este caminho não foi encontrado/,
  );
  assert.match(
    await (await get("/conteudos?q=zzzz")).text(),
    /Nenhum conteúdo encontrado/,
  );
  assert.match(
    await (await get("/conteudos?q=html&nivel=Iniciante")).text(),
    /Seu primeiro passo com HTML/,
  );
  let response = await post("/admin/login", {
    email: "test@example.test",
    password: "incorrect",
  });
  assert.match(await response.text(), /E-mail ou senha incorretos/);
  response = await post("/admin/login", {
    email: "test@example.test",
    password: "HTTP-testing-2026",
  });
  assert.equal(response.status, 303);
  const setCookie = response.headers.get("set-cookie")!;
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=lax/i);
  cookie = setCookie.split(";")[0];
  assert.equal((await get("/admin")).status, 200);
  response = await post("/admin/categorias/novo", {
    name: "Teste HTTP",
    description: "Categoria temporária",
  });
  assert.equal(response.status, 303);
  const category = await db.category.findUniqueOrThrow({
    where: { name: "Teste HTTP" },
  });
  const content = {
    title: "Conteúdo HTTP",
    description: "Material temporário para validar o cadastro.",
    url: "https://example.com/material",
    source: "Teste HTTP",
    categoryId: category.id,
    level: "Iniciante",
    format: "Tutorial",
    minutes: "15",
  };
  response = await post("/admin/conteudos/novo", content);
  assert.equal(response.status, 303);
  const draft = await db.content.findFirstOrThrow({
    where: { title: "Conteúdo HTTP" },
  });
  assert.equal(draft.published, false);
  assert.match(
    await (await get(`/conteudos/${draft.id}`, false)).text(),
    /Este caminho não foi encontrado/,
  );
  const count = await db.content.count();
  response = await post(
    "/admin/conteudos/novo",
    { ...content, title: "Unauthorized" },
    -1,
    false,
  );
  assert.equal(response.status, 303);
  assert.match(response.headers.get("location")!, /admin\/login/);
  assert.equal(await db.content.count(), count);
  response = await post(`/admin/conteudos/${draft.id}`, {
    ...content,
    published: "on",
  });
  assert.equal(response.status, 303);
  assert.equal((await get(`/conteudos/${draft.id}`, false)).status, 200);
  response = await post("/admin/trilhas/novo", {
    title: "Trilha HTTP",
    description: "Trilha de teste automatizado.",
    level: "Iniciante",
    published: "on",
    contentIds: [draft.id, "demo-html"],
  });
  assert.equal(response.status, 303);
  const trail = await db.trail.findFirstOrThrow({
    where: { title: "Trilha HTTP" },
    include: { steps: { orderBy: { position: "asc" } } },
  });
  assert.deepEqual(
    trail.steps.map((s) => s.contentId),
    [draft.id, "demo-html"],
  );
  response = await post(`/admin/trilhas/${trail.id}`, {
    title: "Trilha HTTP",
    description: "Trilha de teste automatizado.",
    level: "Iniciante",
    published: "on",
    contentIds: ["demo-html", draft.id],
  });
  assert.equal(response.status, 303);
  assert.deepEqual(
    (
      await db.trailStep.findMany({
        where: { trailId: trail.id },
        orderBy: { position: "asc" },
      })
    ).map((s) => s.contentId),
    ["demo-html", draft.id],
  );
  response = await post(`/admin/conteudos/${draft.id}`, content);
  assert.equal(response.status, 303);
  assert.match(
    await (await get(response.headers.get("location")!)).text(),
    /Retire este material/,
  );
  assert.equal(
    (await db.content.findUniqueOrThrow({ where: { id: draft.id } })).published,
    true,
  );
  response = await post("/admin/configuracoes", {
    feedbackUrl: "https://forms.gle/test-questionnaire",
  });
  assert.equal(response.status, 303);
  assert.match(
    await (await get(response.headers.get("location")!)).text(),
    /Configurações salvas/,
  );
  assert.match(
    await (await get("/sobre")).text(),
    /https:\/\/forms.gle\/test-questionnaire/,
  );
  // Delete forms follow the sidebar logout form. Find the matching form from the list order.
  const trails = await db.trail.findMany({ orderBy: { updatedAt: "desc" } });
  response = await post(
    "/admin/trilhas",
    {},
    trails.findIndex((t) => t.id === trail.id) + 1,
  );
  assert.equal(await db.trail.count({ where: { id: trail.id } }), 0);
  const contents = await db.content.findMany({
    orderBy: { updatedAt: "desc" },
  });
  await post(
    "/admin/conteudos",
    {},
    contents.findIndex((c) => c.id === draft.id) + 1,
  );
  assert.equal(await db.content.count({ where: { id: draft.id } }), 0);
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  await post(
    "/admin/categorias",
    {},
    categories.findIndex((c) => c.id === category.id) + 1,
  );
  assert.equal(await db.category.count({ where: { id: category.id } }), 0);
  const oldCookie = cookie;
  response = await post("/admin", {}, 0);
  assert.equal(response.status, 303);
  assert.equal(await db.session.count(), 0);
  cookie = oldCookie;
  assert.match(
    await (await get("/admin")).text(),
    /NEXT_REDIRECT.*admin\/login/,
  );
  cookie = "";
  for (let i = 0; i < 7; i++)
    response = await post("/admin/login", {
      email: "test@example.test",
      password: "incorrect",
    });
  assert.match(await response.text(), /Muitas tentativas/);
  console.log(
    "PASS: public routes, filters, auth, cookies, unauthorized actions, CRUD, drafts, ordered trails, publication rules, feedback, logout and persistent rate limit.",
  );
} finally {
  if (server && server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill("SIGTERM");
    const force = setTimeout(() => server?.kill("SIGKILL"), 3000);
    await exited;
    clearTimeout(force);
  }
  await db?.$disconnect();
  await pg.stop();
}
