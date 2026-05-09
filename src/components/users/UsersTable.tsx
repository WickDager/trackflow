"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { Profile, Role } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UsersTableProps {
  users: Profile[];
  loading: boolean;
  error: string | null;
  currentUserId: string;
  onRoleChange: (userId: string, newRole: Role) => Promise<boolean>;
  onRemove: (userId: string) => Promise<void>;
}

export function UsersTable({
  users,
  loading,
  error,
  currentUserId,
  onRoleChange,
  onRemove,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(!!column.getIsSorted())}
          className="-ml-3 h-8 text-ink-muted hover:text-ink-primary"
        >
          Name
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="bg-bg-elevated text-xs text-ink-primary">
                {getInitials(user.full_name ?? user.id)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-ink-primary">
                {user.full_name ?? "Unnamed User"}
              </p>
              <p className="text-xs text-ink-muted">
                {user.id.slice(0, 8)}...
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: () => (
        <span className="text-ink-muted text-xs uppercase tracking-wider font-medium">
          Role
        </span>
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as Role;
        return (
          <Badge
            variant={role === "admin" ? "default" : "secondary"}
            className="text-xs"
          >
            {role}
          </Badge>
        );
      },
    },
    {
      id: "status",
      header: () => (
        <span className="text-ink-muted text-xs uppercase tracking-wider font-medium">
          Status
        </span>
      ),
      cell: () => (
        <Badge variant="default" className="text-xs bg-status-green-bg text-status-green border-status-green/10">
          Active
        </Badge>
      ),
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(!!column.getIsSorted())}
          className="-ml-3 h-8 text-ink-muted hover:text-ink-primary"
        >
          Joined
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-ink-secondary">
          {formatDate(row.getValue("updated_at"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => (
        <span className="text-ink-muted text-xs uppercase tracking-wider font-medium">
          Actions
        </span>
      ),
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = user.id === currentUserId;

        if (isCurrentUser) {
          return (
            <Badge variant="outline" className="text-xs">
              You
            </Badge>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="User actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  const newRole: Role =
                    user.role === "admin" ? "user" : "admin";
                  if (confirm(`Change role to ${newRole}?`)) {
                    await onRoleChange(user.id, newRole);
                  }
                }}
              >
                Change role to {user.role === "admin" ? "user" : "admin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-status-red"
                onClick={async () => {
                  if (confirm(`Remove ${user.full_name ?? "this user"}?`)) {
                    await onRemove(user.id);
                  }
                }}
              >
                Remove user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-bg-border/60 bg-bg-surface">
        <p className="text-ink-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-bg-border/60 bg-bg-surface overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-bg-border/60 hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-bg-border/40">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-ink-secondary"
              >
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
