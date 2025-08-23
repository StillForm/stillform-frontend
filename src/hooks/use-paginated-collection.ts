"use client";

import { useQuery } from '@tanstack/react-query';
import { CollectionItem } from '@/app/api/mock/data'; // This type might need adjustment
import { ProfileFilters } from '@/components/profile-search-bar';
import { useAccount } from 'wagmi';

type PaginatedCollectionResponse = {
  items: CollectionItem[];
  total: number;
  page: number;
  pageSize: number;
};

const fetchMyCollection = async (
  address: string | undefined,
  query: string,
  filters: ProfileFilters,
  page: number
): Promise<PaginatedCollectionResponse> => {
  if (!address) {
    // Return empty state if wallet is not connected
    return { items: [], total: 0, page: 1, pageSize: 12 };
  }

  const params = new URLSearchParams({
    query,
    status: filters.status.join(','),
    page: page.toString(),
  });

  // Targeting the real backend now
  const res = await fetch(`http://localhost:3001/api/users/${address}/owned-items?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch owned collection items');
  }
  return res.json();
};

export const usePaginatedCollection = (
  query: string,
  filters: ProfileFilters,
  page: number
) => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['my-collection', { address, query, filters, page }],
    queryFn: () => fetchMyCollection(address, query, filters, page),
    enabled: !!address, // The query will only run if the user is connected
  });
};
