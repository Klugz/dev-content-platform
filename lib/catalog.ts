import "server-only";
import { db } from "./db";
import { curatedCatalog } from "./curated";
export const isDemo = () =>
  process.env.DEMO_MODE === "true" && !process.env.DATABASE_URL;
export async function catalog() {
  if (isDemo()) return curatedCatalog();
  const [categories, contents, trails, settings] = await Promise.all([
    db().category.findMany({ orderBy: { name: "asc" } }),
    db().content.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    db().trail.findMany({
      where: { published: true },
      include: {
        steps: {
          where: { content: { published: true } },
          include: { content: { include: { category: true } } },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { title: "asc" },
    }),
    db().settings.findUnique({ where: { id: "site" } }),
  ]);
  return {
    categories,
    contents,
    trails,
    feedbackUrl: settings?.feedbackUrl ?? "",
    demo: false,
  };
}
