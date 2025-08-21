"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ProfileFilters = {
  status: string[];
};

type ProfileSearchBarProps = {
  onSearch: (params: { query: string; filters: ProfileFilters }) => void;
};

const STATUS_OPTIONS = {
  owned: 'Owned',
  listed: 'Listed',
  physicalizing: 'Physicalizing',
  locked: 'Locked',
};

export function ProfileSearchBar({ onSearch }: ProfileSearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ProfileFilters>({
    status: [],
  });

  const handleSearch = () => {
    onSearch({ query, filters });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    setFilters((prev) => {
      const newStatus = checked
        ? [...prev.status, status]
        : prev.status.filter((s) => s !== status);
      return { ...prev, status: newStatus };
    });
  };

  return (
    <div className="flex gap-4 items-center">
      <Input
        placeholder="Search your collection..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="flex-grow"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Status ({filters.status.length > 0 ? filters.status.length : 'All'})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filters.status.includes(value)}
              onCheckedChange={(checked) => handleStatusChange(value, !!checked)}
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
}
