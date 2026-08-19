import type { MenuCategory } from "@/modules/cms";

import { MenuItemRow } from "./MenuItemRow";
import type { MenuItem } from "./types";

export interface CategoryBlockProps {
  category: MenuCategory;
  items: MenuItem[];
  compact: boolean;
  subcategory?: boolean;
}

export function CategoryBlock({
  category,
  items,
  compact,
  subcategory = false,
}: CategoryBlockProps) {
  if (subcategory && items.length === 0) return null;

  return (
    <section className={subcategory ? "grid gap-4" : "grid gap-6"}>
      {subcategory ? (
        <h4 className="text-sm font-medium uppercase text-brand-400">{category.displayName}</h4>
      ) : (
        <h3 className="text-2xl font-bold">{category.displayName}</h3>
      )}
      {category.showDescription && category.description && (
        <div className="[&_p]:m-0" dangerouslySetInnerHTML={{ __html: category.description }} />
      )}
      {items.length ? (
        <div className="grid gap-5">
          {items.map((item) => (
            <MenuItemRow key={item.slug} item={item} compact={compact} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
