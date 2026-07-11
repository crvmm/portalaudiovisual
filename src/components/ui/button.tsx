import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-primary text-primary-foreground btn-primary-glow hover:brightness-105 transition-[filter,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-accent transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
  outline:
    "border border-border bg-transparent hover:bg-accent transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
  ghost:
    "bg-transparent hover:bg-accent text-muted-foreground hover:text-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
  danger:
    "bg-red-600/10 text-red-700 hover:bg-red-600/15 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-base",
  lg: "px-6 py-3 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
