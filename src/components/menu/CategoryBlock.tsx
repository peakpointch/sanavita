import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/modules/cms";

import { MenuItem } from "./MenuItem";
import type { MenuItem as MenuItemData } from "./types";

export interface CategoryBlockProps {
  category: MenuCategory;
  items: MenuItemData[];
  compact: boolean;
  subcategory?: boolean;
  scaled?: boolean;
}

export function CategoryBlock({
  category,
  items,
  compact,
  subcategory = false,
  scaled = false,
}: CategoryBlockProps) {
  if (subcategory && items.length === 0) return null;

  return (
    <section className={cn("wf grid gap-3", scaled && "is-scaled")}>
      {subcategory ? (
        <h4 className="text-sm font-medium tracking-[0.05em] text-brand-400 uppercase">
          {category.displayName}
        </h4>
      ) : (
        <h3 className="bla text-2xl font-bold">{category.displayName}</h3>
      )}
      {category.showDescription && category.description && (
        <div className="[&_p]:m-0" dangerouslySetInnerHTML={{ __html: category.description }} />
      )}
      {items.length ? (
        <div className="grid gap-4">
          {items.map((item) => (
            <MenuItem key={item.slug} item={item} compact={compact} scaled={scaled} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
