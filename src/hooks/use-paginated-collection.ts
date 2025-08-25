"use client";

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { CollectionItem } from '@/app/api/mock/data'; // Re-using this type as the backend maps to it
import { ProfileFilters } from '@/components/profile-search-bar';

type PaginatedCollectionResponse = {
  items: CollectionItem[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Fetches the owned items for a specific address from the real backend.
 */
const fetchOwnedItems = async (
  address: string,
  page: number,
  // query and filters are kept for future implementation but are not used in the API call for now.
  query: string, 
  filters: ProfileFilters
): Promise<PaginatedCollectionResponse> => {
  
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: '12', // Default page size
    // TODO: The backend endpoint /api/users/:address/owned-items does not currently
    // support search query or status filters. These are ignored for now.
  });

  const res = await fetch(`/api/users/${address}/owned-items?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch owned items');
  }
  return res.json();
};

/**
 * This hook fetches a paginated list of a user's owned collection items from the backend.
 * It uses the connected wallet address to identify the user.
 */
export const usePaginatedCollection = (
  query: string,
  filters: ProfileFilters,
  page: number
) => {
  const { address, isConnected } = useAccount();

  return useQuery({
    // The query key is now dependent on the user's address and the current page
    queryKey: ['ownedItems', { address, page, query, filters }],
    queryFn: () => fetchOwnedItems(address!, page, query, filters),
    // The query is only enabled if the wallet is connected and an address is available
    enabled: isConnected && !!address,
    // Keep previous data visible while new data is being fetched
    keepPreviousData: true,
  });
};
