import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils/cn";

const variants = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] border-transparent",
  secondary:
    "bg-white text-[var(--foreground)] hover:bg-[var(--surface-strong)] border-[var(--border)]",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-strong)] border-transparent",
  danger: "bg-[var(--danger)] text-white hover:bg-red-800 border-transparent",
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
