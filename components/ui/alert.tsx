import { cn } from "@/src/lib/utils/cn";

const variants = {
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  danger: "border-red-200 bg-red-50 text-red-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
};

export function Alert({
  children,
  title,
  variant = "info",
}: {
  children: React.ReactNode;
  title: string;
  variant?: keyof typeof variants;
}) {
  return (
    <div className={cn("rounded-lg border p-4", variants[variant])}>
      <p className="font-semibold">{title}</p>
      <div className="mt-1 text-sm leading-6">{children}</div>
    </div>
  );
}
