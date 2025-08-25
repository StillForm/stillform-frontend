"use client";

import { useQuery } from '@tanstack/react-query';
import { Work } from '@/app/api/mock/data';
import { Address } from 'viem';

// Matches the structure of a single collection item from the backend API,
// based on the Prisma schema.
type ApiCollection = {
  id: Address;
  name: string;
  creatorAddress: Address;
  price: string; // Prisma serializes BigInt to a string in JSON
  maxSupply: number;
  coverImageUrl?: string;
  status: string;
  type: 'NORMAL' | 'BLIND_BOX';
  createdAt: string;
};

// Matches the paginated response structure from the backend.
type CollectionsApiResponse = {
  items: ApiCollection[];
  total: number;
  page: number;
  pageSize: number;
};

// Fetcher function that now includes pagination and search query.
const fetchCollections = async (page: number, query: string): Promise<CollectionsApiResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: '12',
  });
  if (query) {
    params.set('query', query);
  }

  const response = await fetch(`/api/collections?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch collections from backend');
  }
  return response.json();
};

/**
 * A simplified hook that fetches paginated works directly from the backend API,
 * without making any on-chain calls.
 */
export const usePaginatedWorks = (
  query: string,
  filters: any, // filters and sort are not yet supported by the backend endpoint
  sort: any,
  page: number
) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['collections', { page, query }],
    queryFn: () => fetchCollections(page, query),
    keepPreviousData: true,
  });

  // Map the raw API data to the frontend's 'Work' type.
  const works: Work[] = data?.items.map(item => ({
    id: item.id,
    slug: item.id,
    title: item.name,
    description: '', // Not available from this endpoint
    media: [{ type: 'image', url: item.coverImageUrl || '/vercel.svg' }],
    creator: {
      address: item.creatorAddress,
      displayName: `Creator ${item.creatorAddress.slice(0, 6)}...`,
      avatarUrl: '/vercel.svg',
    },
    editions: [{
      editionId: 1,
      supply: item.maxSupply,
      price: Number(BigInt(item.price)) / 1e18, // Convert price from string format
      currency: 'ETH'
    }],
    chain: {
      type: 'evm',
      chainId: 11155111, // Sepolia
      contractAddress: item.id,
    },
    status: item.status.toLowerCase() as 'listed' | 'draft' | 'sold_out',
    type: item.type === 'NORMAL' ? 'standard' : 'blindbox',
    tags: [],
    physicalOptions: [],
    stats: {
      favorites: 0,
      sales: 0, // Not available from this endpoint
    },
    createdAt: item.createdAt,
  })) ?? [];

  return {
    isLoading,
    isError,
    data: data ? {
      items: works,
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
    } : undefined,
  };
};
