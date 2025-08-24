import { Work, mockWorks } from "@/app/api/mock/data";
import { notFound } from "next/navigation";
import { CreatorArtDetailClientPage } from "./creator-art-detail-client-page";

// No longer using fetch, directly access mock data
async function getWork(slug: string): Promise<Work | null> {
  const work = mockWorks.find(w => w.slug === slug);
  return work || null;
}

export default async function CreatorArtDetailPage({ params }: { params: { slug: string } }) {
  const work = await getWork(params.slug);

  if (!work) {
    notFound();
  }

  return (
    <div className="container py-10">
      <CreatorArtDetailClientPage work={work} />
    </div>
  );
}
