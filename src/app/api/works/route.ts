import { NextRequest, NextResponse } from "next/server";
import { mockWorks, Work } from "../mock/data";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // --- PARSE QUERY PARAMS ---
  const status = searchParams.get("status") || "listed";
  const query = searchParams.get("query")?.toLowerCase() || "";
  const filtersParam = searchParams.get("filters");
  const sort = searchParams.get("sort") || "createdAt:desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

  let filters = {
    price: { min: 0, max: Infinity },
    chains: [] as string[],
    types: [] as string[],
    media: [] as string[],
    creators: [] as string[],
    physical: [] as string[],
  };

  if (filtersParam) {
    try {
      const parsedFilters = JSON.parse(filtersParam);
      // Handle case where Infinity was stringified to null
      if (parsedFilters.price && parsedFilters.price.max === null) {
        parsedFilters.price.max = Infinity;
      }
      filters = { ...filters, ...parsedFilters };
    } catch (e) {
      return NextResponse.json({ message: "Invalid filters format" }, { status: 400 });
    }
  }

  // --- FILTERING ---
  let filteredWorks = mockWorks.filter((work) => {
    // Hardcoded filter for storefront pages
    if (work.status !== 'listed' || work.editions.every((e) => e.supply === 0)) {
      return false;
    }

    // 2. Text query search
    if (query) {
      const queryMatch =
        work.title.toLowerCase().includes(query) ||
        work.description.toLowerCase().includes(query) ||
        work.creator.displayName.toLowerCase().includes(query) ||
        work.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!queryMatch) return false;
    }

    // 3. Structured filters
    const editionPrice = work.editions[0]?.price ?? 0;
    if (editionPrice < filters.price.min || editionPrice > filters.price.max) {
      return false;
    }
    if (filters.chains.length > 0 && !filters.chains.includes(work.chain.type)) {
      return false;
    }
    if (filters.types.length > 0 && !filters.types.includes(work.type)) {
      return false;
    }
    if (filters.media.length > 0 && !filters.media.includes(work.media[0].type)) {
      return false;
    }
    if (
      filters.creators.length > 0 &&
      !filters.creators.some(
        (c) =>
          work.creator.displayName.toLowerCase().includes(c.toLowerCase()) ||
          work.creator.address.toLowerCase() === c.toLowerCase()
      )
    ) {
      return false;
    }
    if (
      filters.physical.length > 0 &&
      !filters.physical.some((p) => work.physicalOptions.includes(p))
    ) {
      return false;
    }

    return true;
  });

  // --- SORTING ---
  const [sortField, sortOrder] = sort.split(":");
  filteredWorks.sort((a, b) => {
    let valA, valB;

    switch (sortField) {
      case "price":
        valA = a.editions[0]?.price ?? 0;
        valB = b.editions[0]?.price ?? 0;
        break;
      case "favorites":
        valA = a.stats.favorites;
        valB = b.stats.favorites;
        break;
      case "sales":
        valA = a.stats.sales;
        valB = b.stats.sales;
        break;
      case "createdAt":
      default:
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  // --- PAGINATION ---
  const total = filteredWorks.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filteredWorks.slice(start, end);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
  });
}

