import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoSize = "sm" | "lg";

const sizeStyles: Record<
  BrandLogoSize,
  { wrapper: string; dot: string; pulse?: boolean }
> = {
  sm: {
    wrapper:
      "gap-2.5 font-display text-[1.05rem] font-medium leading-none tracking-tight sm:text-[1.15rem]",
    dot: "rec-dot rec-dot-sm",
    pulse: true,
  },
  lg: {
    wrapper:
      "gap-3 font-display text-3xl font-medium leading-none tracking-tight sm:text-4xl",
    dot: "rec-dot rec-dot-lg",
    pulse: false,
  },
};

interface BrandLogoProps {
  size?: BrandLogoSize;
  href?: string;
  className?: string;
}

export function BrandLogo({ size = "sm", href, className }: BrandLogoProps) {
  const { wrapper, dot, pulse } = sizeStyles[size];

  const mark = (
    <span className={cn("inline-flex items-center text-foreground", wrapper, className)}>
      <span
        className={cn(dot, pulse && "rec-dot-pulse")}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap">
        Portal<span className="text-stage">.</span>Audiovisual
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-opacity hover:opacity-90">
        {mark}
      </Link>
    );
  }

  return mark;
}
