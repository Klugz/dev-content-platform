import test from "node:test";
import assert from "node:assert/strict";
import { curatedCatalog, curatedData } from "../lib/curated";
import { contentSchema, trailSchema } from "../lib/validation";
test("curated catalogue has valid records and complete ordered trails", () => {
  const catalog = curatedCatalog();
  assert.equal(catalog.contents.length, 11);
  assert.equal(catalog.categories.length, 7);
  assert.equal(catalog.trails.length, 7);
  const ids = new Set(catalog.contents.map((c) => c.id));
  assert.equal(ids.size, catalog.contents.length);
  for (const c of catalog.contents) {
    contentSchema.parse(c);
    assert.ok(c.category);
    assert.equal(new URL(c.url).protocol, "https:");
  }
  for (const t of curatedData.trails) {
    trailSchema.parse(t);
    for (const id of t.contentIds) assert.ok(ids.has(id));
  }
  for (const t of catalog.trails)
    assert.ok(t.steps.every((s) => s.content && s.content.published));
  assert.ok(
    catalog.contents.some(
      (c) => c.category.name === "Desenvolvimento de jogos",
    ),
  );
  assert.ok(catalog.contents.every((c) => !c.id.startsWith("demo-")));
});
