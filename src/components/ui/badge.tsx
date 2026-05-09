import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-accent-subtle text-accent border border-accent/10",
        secondary:
          "bg-bg-elevated text-ink-secondary border border-bg-border",
        destructive:
          "bg-status-red-bg text-status-red border border-status-red/10",
        outline:
          "border border-bg-border text-ink-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
