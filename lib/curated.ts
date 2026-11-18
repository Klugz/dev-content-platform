import data from "../data/curated-catalog.json";
export const curatedData = data;
// The preview and database import use exactly the same reviewed records.
export function curatedCatalog() {
  const date = new Date(data.reviewedAt + "T00:00:00Z");
  const categories = data.categories;
  const contents = data.contents.map((c) => ({
    ...c,
    category: categories.find((category) => category.id === c.categoryId)!,
    createdAt: date,
    updatedAt: date,
  }));
  const trails = data.trails.map(({ contentIds, ...trail }) => ({
    ...trail,
    updatedAt: date,
    steps: contentIds.map((contentId, position) => ({
      id: `${trail.id}-${position}`,
      trailId: trail.id,
      contentId,
      position,
      content: contents.find((c) => c.id === contentId)!,
    })),
  }));
  return { categories, contents, trails, feedbackUrl: "", demo: true };
}
