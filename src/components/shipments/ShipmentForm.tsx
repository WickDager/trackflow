"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shipmentSchema, type ShipmentInput } from "@/lib/validations";
import type { Shipment, ShipmentStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShipmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ShipmentInput) => Promise<boolean>;
  initialData?: Shipment | null;
  loading?: boolean;
}

export function ShipmentForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  loading,
}: ShipmentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShipmentInput>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      tracking_number: "",
      origin: "",
      destination: "",
      status: "pending",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      setValue("tracking_number", initialData.tracking_number);
      setValue("origin", initialData.origin);
      setValue("destination", initialData.destination);
      setValue("status", initialData.status);
    } else if (!open) {
      reset();
    }
  }, [initialData, open, setValue, reset]);

  async function handleFormSubmit(data: ShipmentInput) {
    const success = await onSubmit(data);
    if (success) {
      reset();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Edit Shipment" : "Add Shipment"}
            </DialogTitle>
            <DialogDescription>
              {initialData
                ? "Update the shipment details below."
                : "Fill in the details to create a new shipment."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking_number">Tracking Number</Label>
              <Input
                id="tracking_number"
                {...register("tracking_number")}
                disabled={!!initialData}
              />
              {errors.tracking_number && (
                <p className="text-sm text-status-red">
                  {errors.tracking_number.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" {...register("origin")} />
                {errors.origin && (
                  <p className="text-sm text-status-red">
                    {errors.origin.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" {...register("destination")} />
                {errors.destination && (
                  <p className="text-sm text-status-red">
                    {errors.destination.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={undefined}
                onValueChange={(value) =>
                  setValue("status", value as ShipmentStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-status-red">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting || loading
                ? initialData
                  ? "Updating..."
                  : "Creating..."
                : initialData
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
