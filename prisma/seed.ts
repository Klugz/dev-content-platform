import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { demoCategory, demoContent, demoTrail } from "../lib/demo";
const client = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  }),
});
try {
  await client.$transaction(async (tx) => {
    if (await tx.seedRun.findUnique({ where: { id: "sample-v1" } })) return;
    await tx.category.create({ data: demoCategory });
    const { category, ...content } = demoContent;
    await tx.content.create({ data: content });
    const { steps, ...trail } = demoTrail;
    await tx.trail.create({
      data: {
        ...trail,
        steps: {
          create: [{ id: steps[0].id, contentId: content.id, position: 0 }],
        },
      },
    });
    await tx.seedRun.create({ data: { id: "sample-v1" } });
  });
  console.log(
    "Seed concluído: um material de teste, sem redefinir edições anteriores.",
  );
} finally {
  await client.$disconnect();
}
