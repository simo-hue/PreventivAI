import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils/cn";

const variants = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] hover:shadow-md border-transparent shadow-sm",
  secondary:
    "bg-white text-[var(--foreground)] hover:bg-[var(--surface-strong)] border-[var(--border)] shadow-sm hover:shadow",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-strong)] border-transparent",
  danger: "bg-[var(--danger)] text-white hover:bg-red-900 border-transparent shadow-sm hover:shadow",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: keyof typeof variants;
}) {
  return (
    <Link
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-all active:scale-[0.98]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
