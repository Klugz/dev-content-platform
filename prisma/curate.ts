import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { curatedData } from "../lib/curated";
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url)
  throw new Error(
    "Configure DIRECT_URL ou DATABASE_URL antes de importar o catálogo.",
  );
const client = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});
try {
  const imported = await client.$transaction(
    async (tx) => {
      const marker = "curated-catalog-2026-11-18-v1";
      if (await tx.seedRun.findUnique({ where: { id: marker } })) return false;
      const categoryIds = new Map<string, string>();
      for (const category of curatedData.categories) {
        // Reuse an existing category by name without overwriting the curator's edits.
        const stored = await tx.category.upsert({
          where: { name: category.name },
          update: {},
          create: category,
        });
        categoryIds.set(category.id, stored.id);
      }
      for (const content of curatedData.contents)
        await tx.content.create({
          data: {
            ...content,
            categoryId: categoryIds.get(content.categoryId)!,
          },
        });
      for (const { contentIds, ...trail } of curatedData.trails)
        await tx.trail.create({
          data: {
            ...trail,
            steps: {
              create: contentIds.map((contentId, position) => ({
                contentId,
                position,
              })),
            },
          },
        });
      await tx.seedRun.create({ data: { id: marker } });
      return true;
    },
    { isolationLevel: "Serializable", timeout: 30000 },
  );
  console.log(
    imported
      ? `Catálogo importado: ${curatedData.contents.length} cursos e ${curatedData.trails.length} trilhas.`
      : "Catálogo já importado; edições e exclusões foram preservadas.",
  );
} finally {
  await client.$disconnect();
}
