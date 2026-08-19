import React from "react";

import type { Menu, MenuCategory, MenuDish, MenuDrink } from "@/modules/cms";

import { CategoryBlock } from "./CategoryBlock";
import { byOrder, formatTime } from "./menu-utils";
import type { MenuItem } from "./types";

const COMPACT_MENU_WIDTH = 720;

interface MenuSubcategoryData {
  category: MenuCategory;
  items: MenuItem[];
}

interface MenuSectionData extends MenuSubcategoryData {
  subcategories: MenuSubcategoryData[];
}

function getMenuSections(menu: Menu, categories: MenuCategory[]): MenuCategory[] {
  const categoriesById = new Map(categories.map((category) => [category.slug, category]));
  const selectedSections = (menu.categoryIds as string[])
    .map((categoryId) => categoriesById.get(categoryId))
    .filter((category): category is MenuCategory => Boolean(category) && !category.isSubcategory);

  if (selectedSections.length > 0) return selectedSections;

  return categories
    .filter((category) => category.menuId === menu.slug && !category.isSubcategory)
    .sort(byOrder);
}

function getItemsForCategory(items: MenuItem[], categoryId: string): MenuItem[] {
  return items.filter((item) => item.categoryId === categoryId).sort(byOrder);
}

function getSubcategories(
  section: MenuCategory,
  categories: MenuCategory[],
  items: MenuItem[],
): MenuSubcategoryData[] {
  return categories
    .filter((category) => category.isSubcategory && category.sectionId === section.slug)
    .sort(byOrder)
    .map((category) => ({
      category,
      items: getItemsForCategory(items, category.slug),
    }));
}

function getMenuCardData(
  menu: Menu,
  categories: MenuCategory[],
  dishes: MenuDish[],
  drinks: MenuDrink[],
): { timeLabel: string; sections: MenuSectionData[] } {
  const items: MenuItem[] = [...dishes, ...drinks].filter((item) => item.menuId === menu.slug);
  const timeLabel = [formatTime(menu.startTime), formatTime(menu.endTime)]
    .filter(Boolean)
    .join("–");
  const sections = getMenuSections(menu, categories).map((category) => ({
    category,
    items: getItemsForCategory(items, category.slug),
    subcategories: getSubcategories(category, categories, items),
  }));

  return { timeLabel, sections };
}

function useCompactMenuLayout() {
  const articleRef = React.useRef<HTMLElement>(null);
  const scaleProbeRef = React.useRef<HTMLSpanElement>(null);
  const [compact, setCompact] = React.useState(false);

  React.useLayoutEffect(() => {
    const article = articleRef.current;
    const scaleProbe = scaleProbeRef.current;
    if (!article || !scaleProbe) return;

    const updateCompactLayout = () => {
      const scaledPixel = scaleProbe.getBoundingClientRect().width;
      if (scaledPixel <= 0) return;

      const widthInDesignPixels = article.getBoundingClientRect().width / scaledPixel;
      const nextCompact = widthInDesignPixels < COMPACT_MENU_WIDTH;
      setCompact((currentCompact) =>
        currentCompact === nextCompact ? currentCompact : nextCompact,
      );
    };

    const observer = new ResizeObserver(updateCompactLayout);
    observer.observe(article);
    observer.observe(scaleProbe);
    updateCompactLayout();

    return () => observer.disconnect();
  }, []);

  return { articleRef, scaleProbeRef, compact };
}

function useMenuCardCollapse(collapsible: boolean) {
  const [expanded, setExpanded] = React.useState(true);
  const contentId = `menu-card-content-${React.useId()}`;
  const contentVisible = !collapsible || expanded;

  const toggleExpanded = () => {
    if (collapsible) setExpanded((currentExpanded) => !currentExpanded);
  };

  const handleHeaderKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!collapsible || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    toggleExpanded();
  };

  return {
    expanded,
    contentId,
    contentVisible,
    toggleExpanded,
    handleHeaderKeyDown,
  };
}

export interface MenuCardProps {
  menu: Menu;
  categories: MenuCategory[];
  dishes: MenuDish[];
  drinks: MenuDrink[];
  collapsible?: boolean;
}

export function MenuCard({ menu, categories, dishes, drinks, collapsible = true }: MenuCardProps) {
  const layout = useCompactMenuLayout();
  const collapse = useMenuCardCollapse(collapsible);
  const data = getMenuCardData(menu, categories, dishes, drinks);

  return (
    <article
      ref={layout.articleRef}
      className="relative w-full overflow-hidden border border-beige-200 bg-neutral-lightest text-black"
    >
      <span
        ref={layout.scaleProbeRef}
        aria-hidden="true"
        className="pointer-events-none absolute invisible"
        style={{ width: "var(--scaled-px)", height: "var(--scaled-px)" }}
      />
      <header
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? collapse.expanded : undefined}
        aria-controls={collapsible ? collapse.contentId : undefined}
        onClick={collapse.toggleExpanded}
        onKeyDown={collapse.handleHeaderKeyDown}
        className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-8 py-7 ${
          collapse.contentVisible ? "border-b border-beige-200" : ""
        } ${
          collapsible
            ? "cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-400"
            : ""
        }`}
      >
        <div className="grid min-w-0 gap-3">
          {menu.showTime && data.timeLabel && (
            <p className="text-sm font-medium uppercase text-brand-400">{data.timeLabel} Uhr</p>
          )}
          <h2 className="text-h5 font-extrabold">{menu.displayName}</h2>
        </div>
        {collapsible && (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className={`size-6 ${collapse.expanded ? "rotate-180" : ""}`}
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </header>

      <div
        id={collapse.contentId}
        aria-hidden={!collapse.contentVisible}
        hidden={!collapse.contentVisible}
      >
        <div className="grid gap-10 px-8 py-6">
          {menu.showDescription && menu.description && (
            <div className="[&_p]:m-0" dangerouslySetInnerHTML={{ __html: menu.description }} />
          )}
          {data.sections.map((section) => (
            <section key={section.category.slug} className="grid gap-8">
              <CategoryBlock
                category={section.category}
                items={section.items}
                compact={layout.compact}
              />
              {section.subcategories.map((subcategory) => (
                <CategoryBlock
                  key={subcategory.category.slug}
                  category={subcategory.category}
                  items={subcategory.items}
                  compact={layout.compact}
                  subcategory
                />
              ))}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
