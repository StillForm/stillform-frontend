"use client";

import { useQuery } from '@tanstack/react-query';
import { CollectionItem } from '@/app/api/mock/data';
import { ProfileFilters } from '@/components/profile-search-bar';

type PaginatedCollectionResponse = {
  items: CollectionItem[];
  total: number;
  page: number;
  pageSize: number;
};

const fetchCollection = async (
  query: string,
  filters: ProfileFilters,
  page: number
): Promise<PaginatedCollectionResponse> => {
  const filtersStr = JSON.stringify(filters);
  const params = new URLSearchParams({
    query,
    filters: filtersStr,
    page: page.toString(),
  });

  const res = await fetch(`/api/me/collections?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch collection');
  }
  return res.json();
};

export const usePaginatedCollection = (
  query: string,
  filters: ProfileFilters,
  page: number
) => {
  return useQuery({
    queryKey: ['collection', { query, filters, page }],
    queryFn: () => fetchCollection(query, filters, page),
  });
};
