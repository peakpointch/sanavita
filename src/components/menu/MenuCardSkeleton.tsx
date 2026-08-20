import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface MenuCardSkeletonProps {
  collapsed?: boolean;
  scaled?: boolean;
}

export function MenuCardSkeleton({ collapsed = false, scaled = false }: MenuCardSkeletonProps) {
  return (
    <article
      role="status"
      aria-label="Menü wird geladen"
      className={cn(
        "wf w-full overflow-hidden border border-beige-200 bg-neutral-lightest",
        scaled && "is-scaled",
      )}
    >
      <header
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 p-6",
          !collapsed && "border-b border-beige-200",
        )}
      >
        <div className="grid gap-2">
          <span className="skeleton-scan h-3 w-2/5 bg-beige-100" />
          <span className="skeleton-scan h-8 w-3/5 bg-beige-100" />
        </div>
        {collapsed && (
          <Plus
            aria-hidden="true"
            strokeWidth={1.5}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            className="size-[calc(24*var(--wf-px))]"
          />
        )}
      </header>

      {!collapsed && (
        <div className="grid gap-6 p-6">
          <span className="skeleton-scan h-5 w-1/4 bg-beige-100" />
          <div className="grid gap-4">
            {["first", "second", "third"].map((row) => (
              <div key={row} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <span className="skeleton-scan h-4 bg-beige-100" />
                <span className="skeleton-scan h-4 w-14 bg-beige-100" />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
