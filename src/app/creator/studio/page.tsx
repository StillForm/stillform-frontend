"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GalleryGrid } from "@/components/gallery-grid";
import { usePaginatedWorks } from "@/hooks/use-paginated-works";

export default function CreatorStudioPage() {
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

  // We'll just filter for the first two works to simulate "my works"
  const myWorks = data?.items?.slice(0, 2);

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Creator Studio</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your works, view sales, and more.
          </p>
        </div>
        <Button asChild>
          <Link href="/creator/new">Create New Work</Link>
        </Button>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold">My Works</h2>
        <div className="mt-6">
          {isLoading && <div>Loading your works...</div>}
          {isError && <div>Failed to load your works.</div>}
          {myWorks && <GalleryGrid
              works={myWorks}
              pathPrefix="/creator/studio"
            />}
        </div>
      </div>
    </div>
  );
}
