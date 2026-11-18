// Isolated disposable PostgreSQL, for browser QA only. Never uses DATABASE_URL.
import EmbeddedPostgres from "embedded-postgres";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawn } from "node:child_process";
const dir = await mkdtemp(join(tmpdir(), "trilhadev-preview-"));
const pg = new EmbeddedPostgres({
  databaseDir: join(dir, "db"),
  user: "postgres",
  password: "preview-only",
  port: 55440,
  persistent: false,
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: () => {},
});
await pg.initialise();
await pg.start();
await pg.createDatabase("preview");
const url = "postgresql://postgres:preview-only@127.0.0.1:55440/preview";
const env = {
  ...process.env,
  DATABASE_URL: url,
  DIRECT_URL: url,
  DEMO_MODE: "false",
  ADMIN_EMAIL: "admin@example.test",
  ADMIN_PASSWORD: "Preview-testing-2026",
};
for (const [bin, args] of [
  ["prisma", ["migrate", "deploy"]],
  ["tsx", ["prisma/seed.ts"]],
  ["tsx", ["scripts/create-admin.ts"]],
] as const)
  execFileSync(`node_modules/.bin/${bin}`, [...args], { env, stdio: "pipe" });
const server = spawn(
  "node_modules/.bin/next",
  ["start", "--hostname", "127.0.0.1", "--port", "3000"],
  { env, stdio: "inherit" },
);
async function stop() {
  server.kill("SIGTERM");
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
