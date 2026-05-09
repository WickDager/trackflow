"use client";

import { Search, Plus } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShipmentStatus } from "@/types";
import { useEffect, useState } from "react";

interface ShipmentFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ShipmentStatus | "all") => void;
  onAdd: () => void;
  isAdmin: boolean;
}

export function ShipmentFilters({
  onSearchChange,
  onStatusChange,
  onAdd,
  isAdmin,
}: ShipmentFiltersProps) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <Input
          placeholder="Search by tracking #, origin, or destination..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select
        defaultValue="all"
        onValueChange={(value) =>
          onStatusChange(value as ShipmentStatus | "all")
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_transit">In Transit</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      {/* Add Button (admin only) */}
      {isAdmin && (
        <Button onClick={onAdd} size="sm" className="flex-shrink-0">
          <Plus className="mr-1 h-4 w-4" />
          Add Shipment
        </Button>
      )}
    </div>
  );
}
