import test from "node:test";
import assert from "node:assert/strict";
import {
  webUrl,
  feedbackSchema,
  contentSchema,
  trailSchema,
} from "../lib/validation";
import { hashPassword, verifyPassword } from "../lib/password";
test("URLs reject executable schemes, credentials, and unrelated feedback domains", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,x",
    "https://user:secret@example.com",
  ])
    assert.equal(webUrl.safeParse(value).success, false);
  assert.equal(
    webUrl.safeParse("https://developer.mozilla.org/pt-BR/").success,
    true,
  );
  assert.equal(
    feedbackSchema.safeParse("https://forms.gle/test").success,
    true,
  );
  assert.equal(
    feedbackSchema.safeParse("https://forms.gle.attacker.com/").success,
    false,
  );
});
test("content rejects invalid classifications and negative duration", () => {
  const valid = {
    title: "Exemplo",
    description: "Descrição de teste",
    url: "https://example.org",
    source: "Fonte",
    categoryId: "1",
    level: "Iniciante",
    format: "Curso",
    minutes: 20,
    published: false,
  };
  assert.equal(contentSchema.safeParse(valid).success, true);
  assert.equal(
    contentSchema.safeParse({ ...valid, minutes: -1 }).success,
    false,
  );
  assert.equal(
    contentSchema.safeParse({ ...valid, level: "Inválido" }).success,
    false,
  );
});
test("a public trail requires steps and rejects duplicates", () => {
  const base = {
    title: "Uma trilha",
    description: "Descrição da trilha",
    level: "Iniciante",
    published: true,
  };
  assert.equal(
    trailSchema.safeParse({ ...base, contentIds: [] }).success,
    false,
  );
  assert.equal(
    trailSchema.safeParse({ ...base, contentIds: ["a", "a"] }).success,
    false,
  );
  assert.equal(
    trailSchema.safeParse({ ...base, contentIds: ["a", "b"] }).success,
    true,
  );
});
test("password hashing is salted and verifies only the original secret", () => {
  const a = hashPassword("testing-long-password");
  const b = hashPassword("testing-long-password");
  assert.notEqual(a, b);
  assert.ok(verifyPassword("testing-long-password", a));
  assert.equal(verifyPassword("incorrect", a), false);
});
