"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import type { Shipment, ShipmentStatus } from "@/types";
import type { ShipmentInput } from "@/lib/validations";
import { formatDate, cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ShipmentForm } from "./ShipmentForm";
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

interface ShipmentsTableProps {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  onUpdate: (id: string, data: Partial<Shipment>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onCreate: (
    data: Omit<Shipment, "id" | "created_by" | "created_at" | "updated_at">
  ) => Promise<boolean>;
}

export function ShipmentsTable({
  shipments,
  loading,
  error,
  isAdmin,
  onUpdate,
  onDelete,
  onCreate,
}: ShipmentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const columns: ColumnDef<Shipment>[] = [
    {
      accessorKey: "tracking_number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(!!column.getIsSorted())}
          className="-ml-3 h-8 text-ink-muted hover:text-ink-primary"
        >
          Tracking #
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs tracking-wide text-ink-primary">
          {row.getValue("tracking_number")}
        </span>
      ),
    },
    {
      accessorKey: "origin",
      header: () => (
        <span className="text-ink-muted text-xs uppercase tracking-wider font-medium">
          Origin
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-ink-primary">
          {row.getValue("origin")}
        </span>
      ),
    },
    {
      accessorKey: "destination",
      header: () => (
        <span className="text-ink-muted text-xs uppercase tracking-wider font-medium">
          Destination
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-ink-primary">
          {row.getValue("destination")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(!!column.getIsSorted())}
          className="-ml-3 h-8 text-ink-muted hover:text-ink-primary"
        >
          Status
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <StatusBadge status={row.getValue("status") as ShipmentStatus} />
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(!!column.getIsSorted())}
          className="-ml-3 h-8 text-ink-muted hover:text-ink-primary"
        >
          Date
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-ink-secondary">
          {formatDate(row.getValue("created_at"))}
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
        const shipment = row.original;
        if (!isAdmin) return null;

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-ink-muted hover:text-ink-primary"
              onClick={() => {
                setEditingShipment(shipment);
                setFormOpen(true);
              }}
              aria-label="Edit shipment"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-status-red/70 hover:text-status-red"
              onClick={async () => {
                if (confirm(`Delete shipment ${shipment.tracking_number}?`)) {
                  await onDelete(shipment.id);
                }
              }}
              aria-label="Delete shipment"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: shipments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  async function handleFormSubmit(data: ShipmentInput) {
    setSubmitting(true);
    let success = false;
    if (editingShipment) {
      success = await onUpdate(
        editingShipment.id,
        data as Partial<Shipment>
      );
    } else {
      success = await onCreate(data);
    }
    setSubmitting(false);
    return success;
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
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

  if (shipments.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-bg-border/60 bg-bg-surface">
        <p className="mb-3 text-ink-secondary">No shipments found</p>
        {isAdmin && (
          <Button onClick={() => setFormOpen(true)} size="sm">
            Add your first shipment
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-ink-secondary">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Shipment Form Dialog */}
      <ShipmentForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingShipment(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingShipment}
        loading={submitting}
      />
    </>
  );
}
