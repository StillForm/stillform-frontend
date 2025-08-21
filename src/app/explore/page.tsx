"use client";

import { useState } from "react";
import { GalleryGrid } from "@/components/gallery-grid";
import { ExploreSearchBar, Filters } from "@/components/explore-search-bar";
import { usePaginatedWorks } from "@/hooks/use-paginated-works";
import { Button } from "@/components/ui/button";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    price: { min: 0, max: 5 },
    chains: [],
    types: [],
    media: [],
    physical: [],
  });
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = usePaginatedWorks(
    query,
    filters,
    sort,
    page
  );

  const handleSearch = (params: { query: string; filters: Filters; sort: string }) => {
    setPage(1); // Reset to first page on new search
    setQuery(params.query);
    setFilters(params.filters);
    setSort(params.sort);
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <>
      <ExploreSearchBar onSearch={handleSearch} />
      <div className="container py-10">
        {isLoading ? (
          <p>Loading...</p> // Replace with Skeleton component later
        ) : isError ? (
          <div className="text-center">
            <p className="mb-4">Failed to load works. Please try again.</p>
            {/* In a real app, refetch would be ideal here */}
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <GalleryGrid works={data.items} />
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isFetching}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold">No works found</h2>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
