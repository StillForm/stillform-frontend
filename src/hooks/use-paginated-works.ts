"use client";

import { useQuery } from '@tanstack/react-query';
import { Work } from '@/app/api/mock/data';
import { Filters } from '@/components/explore-search-bar';

type PaginatedWorksResponse = {
  items: Work[];
  total: number;
  page: number;
  pageSize: number;
};

const fetchWorks = async (
  query: string,
  filters: Filters,
  sort: string,
  page: number,
  status: string = 'listed'
): Promise<PaginatedWorksResponse> => {
  const filtersStr = JSON.stringify(filters);
  const params = new URLSearchParams({
    query,
    filters: filtersStr,
    sort,
    page: page.toString(),
    status,
  });

  const res = await fetch(`/api/works?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch works');
  }
  return res.json();
};

export const usePaginatedWorks = (
  query: string,
  filters: Filters,
  sort: string,
  page: number,
  status: string = 'listed'
) => {
  return useQuery({
    queryKey: ['works', { query, filters, sort, page, status }],
    queryFn: () => fetchWorks(query, filters, sort, page, status),
  });
};
