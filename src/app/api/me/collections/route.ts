import { NextRequest, NextResponse } from 'next/server';
import { mockCollection, CollectionItem } from '@/app/api/mock/data';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // --- PARSE QUERY PARAMS ---
  const query = searchParams.get('query')?.toLowerCase() || '';
  const filtersParam = searchParams.get('filters');
  const sort = searchParams.get('sort') || 'purchaseDate:desc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
  
  let filters = {
    status: [] as string[],
    chains: [] as string[],
    // ... other filters from explore page if needed
  };

  if (filtersParam) {
    try {
      const parsedFilters = JSON.parse(filtersParam);
      filters = { ...filters, ...parsedFilters };
    } catch (e) {
      return NextResponse.json({ message: 'Invalid filters format' }, { status: 400 });
    }
  }

  // --- FILTERING ---
  let filteredCollection = mockCollection.filter((item) => {
    // 1. Text query search (on work details)
    if (query) {
      const work = item.work;
      const queryMatch =
        work.title.toLowerCase().includes(query) ||
        work.description.toLowerCase().includes(query) ||
        work.creator.displayName.toLowerCase().includes(query) ||
        work.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!queryMatch) return false;
    }

    // 2. Structured filters
    if (filters.status.length > 0 && !filters.status.includes(item.status)) {
      return false;
    }
    if (filters.chains.length > 0 && !filters.chains.includes(item.work.chain.type)) {
      return false;
    }
    
    return true;
  });

  // --- SORTING ---
  const [sortField, sortOrder] = sort.split(':');
  filteredCollection.sort((a, b) => {
    let valA, valB;

    switch (sortField) {
      case 'price':
        valA = a.work.editions[0]?.price ?? 0;
        valB = b.work.editions[0]?.price ?? 0;
        break;
      case 'purchaseDate':
      default:
        valA = new Date(a.purchaseDate).getTime();
        valB = new Date(b.purchaseDate).getTime();
        break;
    }

    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  // --- PAGINATION ---
  const total = filteredCollection.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filteredCollection.slice(start, end);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
  });
}
