import { cn } from "@/lib/utils";

import { VeggieIcon } from "./VeggieIcon";
import { getPriceLabels, isDrink } from "./menu-utils";
import type { MenuItem as MenuItemData } from "./types";

export interface MenuItemProps {
  visibility?: boolean;
  item: MenuItemData;
  compact: boolean;
  scaled?: boolean;
}

export function MenuItem({ visibility = true, item, compact, scaled = false }: MenuItemProps) {
  const prices = getPriceLabels(item);

  return (
    visibility && (
      <article
        className={cn(
          "wf grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4",
          scaled && "is-scaled",
        )}
      >
        <div className="grid min-w-0 gap-1">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex min-w-0 items-start gap-2 font-semibold">
              <span className="min-w-0">{item.displayName}</span>
              {!isDrink(item) && item.isVegetarian && (
                <span className="flex shrink-0 items-center gap-1 text-xs font-normal text-neutral">
                  <VeggieIcon />
                  {/* {!compact && "Vegetarisch"} */}
                </span>
              )}
            </div>
            {prices.length > 0 && (
              <span
                aria-hidden="true"
                className="mt-[0.65em] min-w-0 flex-1 border-t border-beige-200"
              />
            )}
          </div>
          {item.description && (
            <div className="[&_p]:m-0" dangerouslySetInnerHTML={{ __html: item.description }} />
          )}
        </div>
        {prices.length > 0 && (
          <div className="grid justify-items-end gap-1 tabular-nums">
            {prices.map((price, index) => (
              <span key={`${price}-${index}`}>{price}</span>
            ))}
          </div>
        )}
      </article>
    )
  );
}
