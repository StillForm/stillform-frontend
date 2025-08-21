import { Work } from "@/app/api/mock/data";
import { notFound } from "next/navigation";
import { CollectionDetailClientPage } from "./collection-detail-client-page";

async function getWork(slug: string): Promise<Work | null> {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/works/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    console.error(`Failed to fetch work: ${res.status} ${res.statusText}`);
    throw new Error('Failed to fetch work');
  }
  return res.json();
}

export default async function CollectionDetailPage({ params: { slug } }: { params: { slug: string } }) {
  const work = await getWork(slug);

  if (!work) {
    notFound();
  }

  return (
    <div className="container py-10">
      <CollectionDetailClientPage work={work} />
    </div>
  );
}
