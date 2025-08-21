"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

export type Filters = {
  price: { min: number; max: number };
  chains: string[];
  types: string[];
  media: string[];
  physical: string[];
};

type ExploreSearchBarProps = {
  onSearch: (params: { query: string; filters: Filters; sort: string }) => void;
};

const SORT_OPTIONS = {
  'createdAt:desc': 'Newest',
  'price:asc': 'Price: Low to High',
  'price:desc': 'Price: High to Low',
  'favorites:desc': 'Most Favorited',
  'sales:desc': 'Most Sales',
};

export function ExploreSearchBar({ onSearch }: ExploreSearchBarProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [filters, setFilters] = useState<Filters>({
    price: { min: 0, max: 5 },
    chains: [],
    types: [],
    media: [],
    physical: [],
  });

  const handleSearch = () => {
    onSearch({ query, filters, sort });
  };

  const handleFilterChange = (category: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [category]: value }));
  };
  
  const handleChainsChange = (checked: boolean, chain: string) => {
    setFilters((prev) => {
      const newChains = checked
        ? [...prev.chains, chain]
        : prev.chains.filter((c) => c !== chain);
      return { ...prev, chains: newChains };
    });
  };

  return (
    <div className="p-4 bg-background border-b sticky top-14 z-40">
      <div className="container flex gap-4 items-center">
        <Input
          placeholder="Search by title, creator, or tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-grow"
        />
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Filters</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Advanced Filters</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-6">
              <div>
                <Label>Price Range (ETH)</Label>
                 <Slider
                  min={0}
                  max={5}
                  step={0.1}
                  value={[filters.price.min, filters.price.max]}
                  onValueChange={([min, max]) => handleFilterChange('price', { min, max })}
                />
                <div className="flex justify-between text-sm mt-2">
                  <span>{filters.price.min} ETH</span>
                  <span>{filters.price.max} ETH</span>
                </div>
              </div>
              <div>
                <Label>Chains</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="chain-evm" onCheckedChange={(checked) => handleChainsChange(!!checked, 'evm')} />
                    <Label htmlFor="chain-evm">EVM</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="chain-sui" onCheckedChange={(checked) => handleChainsChange(!!checked, 'sui')} />
                    <Label htmlFor="chain-sui">Sui</Label>
                  </div>
                </div>
              </div>
               {/* Add more filters for types, media, physical here */}
            </div>
          </SheetContent>
        </Sheet>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-48 justify-between">
              <span>{SORT_OPTIONS[sort as keyof typeof SORT_OPTIONS]}</span>
              <span>▼</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
              {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={handleSearch}>Search</Button>
      </div>
    </div>
  );
}
