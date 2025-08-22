import { Suspense } from 'react';
import { Work, mockWorks, mockCollection, CollectionItem } from "@/app/api/mock/data";
import { notFound } from "next/navigation";
import { CollectionDetailClientPage } from "./collection-detail-client-page";

function getCollectionItem(slug: string): { work: Work; item: CollectionItem } | null {
  const work = mockWorks.find(w => w.slug === slug);
  if (!work) return null;

  const item = mockCollection.find(i => i.work.slug === slug);
  if (!item) return null;

  return { work, item };
}

// This async component isolates the data fetching logic.
async function DetailsLoader({ slug }: { slug: string }) {
  // We add a minimal delay to ensure this component is treated as fully async,
  // which helps avoid certain Next.js compiler bugs.
  await new Promise(resolve => setTimeout(resolve, 1));
  const data = getCollectionItem(slug);

  if (!data) {
    notFound();
  }
  return <CollectionDetailClientPage data={data} />;
}

// The main page component is now synchronous.
export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container py-10">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <DetailsLoader slug={params.slug} />
      </Suspense>
    </div>
  );
}

