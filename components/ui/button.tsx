import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition",
        variant === "primary" && "bg-accent text-white hover:opacity-90",
        variant === "ghost" && "bg-white text-foreground ring-1 ring-black/10 hover:bg-black/[0.03]",
        className
      )}
      {...props}
    />
  );
}
