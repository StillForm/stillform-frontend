import { Work, mockWorks } from "@/app/api/mock/data";
import { notFound } from "next/navigation";
import { ArtDetailClientPage } from "./art-detail-client-page";

async function getWork(slug: string): Promise<Work | null> {
  const work = mockWorks.find(w => w.slug === slug);
  return work || null;
}

export default async function ArtDetailPage({ params }: { params: { slug: string } }) {
  const work = await getWork(params.slug);

  if (!work) {
    notFound();
  }

  return (
    <div className="container py-10">
      <ArtDetailClientPage work={work} />
    </div>
  );
}

