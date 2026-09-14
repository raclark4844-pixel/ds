import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-[transform,background-color,box-shadow,border-color,color] duration-200 ease-out disabled:pointer-events-none disabled:opacity-40 min-h-11 px-5 text-sm whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-fg text-bg shadow-[var(--shadow-glow-hot)] hover:bg-fg/90 active:scale-[0.98]",
        outline:
          "bg-transparent text-fg hairline hover:border-fg/40 hover:bg-elevated active:scale-[0.98]",
        volt: "bg-transparent text-volt border border-volt/40 shadow-[var(--shadow-glow-volt)] hover:bg-volt-dim active:scale-[0.98]",
        ghost: "bg-transparent text-fg hover:bg-elevated",
      },
      size: {
        md: "min-h-11 px-5 text-sm",
        lg: "min-h-12 px-6 text-[15px]",
        sm: "min-h-10 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
