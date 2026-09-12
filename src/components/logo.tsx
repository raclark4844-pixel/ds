import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "header",
}: {
  className?: string;
  size?: "header" | "footer";
}) {
  return (
    <Link
      to="/"
      aria-label="Demore Technology Solutions home"
      className={cn("inline-flex items-center no-underline focus-visible:outline-none", className)}
    >
      <img
        src="/logo.png"
        alt="Demore Technology Solutions"
        width={1076}
        height={292}
        className={cn("w-auto", size === "footer" ? "h-9" : "h-[34px] sm:h-10 xl:h-11")}
      />
    </Link>
  );
}
