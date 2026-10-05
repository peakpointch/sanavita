import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

type AdminHeaderProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  compact?: boolean;
  reserveNavigationSpace?: boolean;
};

export function AdminHeader({
  title,
  description,
  icon: Icon,
  compact = false,
  reserveNavigationSpace = false,
}: AdminHeaderProps) {
  return (
    <header
      className={cn(
        "flex w-full flex-col gap-1 border-b border-neutral-700/10",
        compact ? "p-4" : "p-8",
        reserveNavigationSpace && "pl-16",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg bg-beige-100 text-neutral-700",
            compact ? "h-10 w-10" : "h-12 w-12",
            reserveNavigationSpace && "hidden",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1
            className={cn(
              "font-bold tracking-tight text-neutral-700",
              compact ? "text-2xl" : "text-3xl",
            )}
          >
            {title}
          </h1>
          {description && <p className="text-sm text-neutral-700/60">{description}</p>}
        </div>
      </div>
    </header>
  );
}
