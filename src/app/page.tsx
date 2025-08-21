"use client";

import { GalleryGrid } from "@/components/gallery-grid";
import { usePaginatedWorks } from "@/hooks/use-paginated-works";
import { useState } from "react";

export default function Home() {
  const [query] = useState("");
  const [filters] = useState({
    price: { min: 0, max: Infinity },
    chains: [],
    types: [],
    media: [],
    physical: [],
  });
  const [sort] = useState("createdAt:desc");
  const [page] = useState(1);

  const { data, isLoading, isError } = usePaginatedWorks(
    query,
    filters,
    sort,
    page
  );

  if (isLoading) {
    return <div>Loading...</div>; // We can replace this with a skeleton loader later
  }

  if (isError) {
    return <div>Failed to load works. Please try again later.</div>;
  }

  const works = data?.items ?? [];

  return (
    <div className="container py-10">
      <section>
        <h1 className="text-4xl font-bold tracking-tight">Featured Works</h1>
        <p className="mt-2 text-muted-foreground">
          Discover unique pieces from talented creators.
        </p>
        <div className="mt-8">
          <GalleryGrid works={works.slice(0, 4)} />
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-3xl font-bold tracking-tight">New Releases</h2>
        <p className="mt-2 text-muted-foreground">
          The latest additions to our curated collection.
        </p>
        <div className="mt-8">
          <GalleryGrid works={works} />
        </div>
      </section>
    </div>
  );
}
