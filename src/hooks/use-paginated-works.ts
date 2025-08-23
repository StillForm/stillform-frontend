"use client";

"use client";

import { useQuery } from '@tanstack/react-query';
import { Work } from '@/app/api/mock/data';
import { Address } from 'viem';
import { Filters } from '@/components/explore-search-bar';

const fetchCollections = async (
  query: string,
  filters: Filters,
  sort: string,
  page: number,
  pageSize: number = 12
): Promise<any> => {
  console.log(`%c[usePaginatedWorks] Fetching collections with key:`, 'color: orange;', { query, filters, sort, page });
  const params: Record<string, string> = {
    query,
    sort,
    page: page.toString(),
    pageSize: pageSize.toString(),
    minPrice: (filters.price.min * 1e18).toString(),
    chains: filters.chains.join(','),
    types: filters.types.join(','),
    media: filters.media.join(','),
    physical: filters.physical.join(','),
  };

  if (isFinite(filters.price.max)) {
    params.maxPrice = (filters.price.max * 1e18).toString();
  }

  const response = await fetch(`http://localhost:3001/api/collections?${new URLSearchParams(params).toString()}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const usePaginatedWorks = (
  query: string,
  filters: Filters,
  sort: string,
  page: number
) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['collections', query, filters, sort, page],
    queryFn: () => fetchCollections(query, filters, sort, page),
  });

  const works: Work[] = data?.items
    ?.map((collection: any) => {
      if (!collection) return null;

      const creatorAddress = collection.creatorAddress as Address || "0x0000000000000000000000000000000000000000";
      
      const imageUrl = collection.coverImageUrl || '/vercel.svg'; 
      
      const totalMinted = collection.nfts?.length || 0;

      const work: Work = {
        id: collection.id,
        slug: collection.id,
        title: collection.name || `Collection ${collection.id}`,
        description: 'Fetched from backend.',
        media: [{ type: 'image', url: imageUrl }],
        creator: {
          address: creatorAddress,
          displayName: `Creator ${creatorAddress.slice(0, 6)}...`,
          avatarUrl: '/vercel.svg',
        },
        editions: [{
          editionId: 1,
          supply: collection.maxSupply,
          price: collection.price ? parseFloat(collection.price) / 1e18 : 0,
          currency: 'ETH'
        }],
        chain: {
          type: 'evm',
          chainId: 11155111,
          contractAddress: collection.id,
        },
        status: collection.status?.toLowerCase() || 'listed',
        type: collection.type === 'NORMAL' ? 'standard' : 'blindbox',
        tags: [],
        physicalOptions: [],
        stats: {
          favorites: 0,
          sales: totalMinted,
        },
        createdAt: collection.createdAt || new Date().toISOString(),
      };
      return work;
    })
    .filter((w): w is Work => w !== null) || [];
      
  if (isError) {
    console.error("Failed to fetch works:", error);
  }

  return {
    isLoading,
    isError,
    data: {
      items: works,
      total: data?.total || 0,
      page: data?.page || 1,
      pageSize: data?.pageSize || 12,
    },
  };
};
