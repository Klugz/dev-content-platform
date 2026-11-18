import EmbeddedPostgres from "embedded-postgres";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import assert from "node:assert/strict";
const dir = await mkdtemp(join(tmpdir(), "trilhadev-test-"));
const pg = new EmbeddedPostgres({
  databaseDir: join(dir, "db"),
  user: "postgres",
  password: "test-local-only",
  port: 55439,
  persistent: false,
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: () => {},
});
let db: PrismaClient | undefined;
try {
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("platform_test");
  const url =
    "postgresql://postgres:test-local-only@127.0.0.1:55439/platform_test";
  const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url };
  execFileSync("node_modules/.bin/prisma", ["migrate", "deploy"], {
    env,
    stdio: "pipe",
  });
  db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  execFileSync("node_modules/.bin/tsx", ["prisma/seed.ts"], {
    env,
    stdio: "pipe",
  });
  assert.equal(await db.content.count(), 1);
  assert.equal(await db.trail.count(), 1);
  await db.content.update({
    where: { id: "demo-html" },
    data: { title: "Editado pelo administrador" },
  });
  execFileSync("node_modules/.bin/tsx", ["prisma/seed.ts"], {
    env,
    stdio: "pipe",
  });
  assert.equal(await db.content.count(), 1);
  assert.equal(
    (await db.content.findUniqueOrThrow({ where: { id: "demo-html" } })).title,
    "Editado pelo administrador",
  );
  await assert.rejects(db.category.delete({ where: { id: "demo-web" } }));
  await assert.rejects(db.content.delete({ where: { id: "demo-html" } }));
  await db.trail.delete({ where: { id: "demo-trail" } });
  assert.equal(await db.trailStep.count(), 0);
  const tables = await db.$queryRaw<
    { relrowsecurity: boolean }[]
  >`SELECT relrowsecurity FROM pg_class WHERE relname IN ('Admin','Session','Content','Trail','Category','Settings','LoginAttempt','SeedRun','TrailStep')`;
  assert.equal(tables.length, 9);
  assert.ok(tables.every((t) => t.relrowsecurity));
  console.log(
    "PASS: migrations, seed idempotency, preserved edits, foreign keys, cascade, RLS.",
  );
} finally {
  await db?.$disconnect();
  await pg.stop();
}
