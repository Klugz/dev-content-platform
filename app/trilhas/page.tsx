import { catalog } from "@/lib/catalog";
import { TrailCard, Empty, DemoNotice } from "@/components/catalog";
export const dynamic = "force-dynamic";
export default async function Trails() {
  const data = await catalog();
  return (
    <div className="container page">
      {data.demo && <DemoNotice />}
      <p className="eyebrow">APRENDA COM DIREÇÃO</p>
      <h1>Um passo de cada vez.</h1>
      <p className="lead">
        Trilhas organizadas para transformar curiosidade em conhecimento.
      </p>
      <div className="trail-list">
        {data.trails.map((t) => (
          <TrailCard key={t.id} trail={t} />
        ))}
      </div>
      {!data.trails.length && <Empty />}
    </div>
  );
}
