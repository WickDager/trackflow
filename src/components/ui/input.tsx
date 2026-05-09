import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-bg-border bg-bg-elevated px-3.5 py-2 text-sm text-ink-primary transition-colors duration-200",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink-primary",
        "placeholder:text-ink-muted/70",
        "hover:border-bg-border-hover",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent/30",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
