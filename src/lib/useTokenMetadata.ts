"use client";

import { useQuery } from '@tanstack/react-query';

export function useTokenMetadata(tokenUri: string | undefined) {
  return useQuery({
    queryKey: ['metadata', tokenUri],
    queryFn: async () => {
      if (!tokenUri) return null;
      try {
        const response = await fetch(tokenUri);
        if (!response.ok) throw new Error("Failed to fetch metadata");
        return await response.json();
      } catch (error) {
        console.error("Error fetching metadata:", error);
        return null;
      }
    },
    enabled: !!tokenUri,
    staleTime: Infinity, // Metadata is immutable, so it never becomes stale
  });
}
