import React from "react";
import { gsap } from "gsap";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Menu, MenuCategory, MenuDish, MenuDrink } from "@/modules/cms";

import { CategoryBlock } from "./CategoryBlock";
import { byOrder, formatDate, formatTime } from "./menu-utils";
import type { MenuItem } from "./types";

const COMPACT_MENU_WIDTH = 720;

export type MenuCardMenu = Pick<
  Menu,
  | "slug"
  | "displayName"
  | "description"
  | "showDescription"
  | "isSeasonal"
  | "showTime"
  | "startTime"
  | "endTime"
  | "categoryIds"
> &
  Partial<Pick<Menu, "startDate" | "endDate">>;

interface MenuSubcategoryData {
  category: MenuCategory;
  items: MenuItem[];
}

interface MenuSectionData extends MenuSubcategoryData {
  subcategories: MenuSubcategoryData[];
}

function getMenuSections(menu: MenuCardMenu, categories: MenuCategory[]): MenuCategory[] {
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
  menu: MenuCardMenu,
  categories: MenuCategory[],
  dishes: MenuDish[],
  drinks: MenuDrink[],
): { metaLabel: string; sections: MenuSectionData[] } {
  const items: MenuItem[] = [...dishes, ...drinks].filter((item) => item.menuId === menu.slug);
  const timeLabel = [formatTime(menu.startTime), formatTime(menu.endTime)]
    .filter(Boolean)
    .join(" - ");
  const dateLabel = menu.isSeasonal
    ? [formatDate(menu.startDate), formatDate(menu.endDate)].filter(Boolean).join(" - ")
    : "";
  const metaLabel = [dateLabel, menu.showTime && timeLabel ? `${timeLabel} Uhr` : ""]
    .filter(Boolean)
    .join(" | ");
  const sections = getMenuSections(menu, categories).map((category) => ({
    category,
    items: getItemsForCategory(items, category.slug),
    subcategories: getSubcategories(category, categories, items),
  }));

  return { metaLabel, sections };
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
      const componentPixel = scaleProbe.getBoundingClientRect().width;
      if (componentPixel <= 0) return;

      const widthInComponentPixels = article.getBoundingClientRect().width / componentPixel;
      const nextCompact = widthInComponentPixels < COMPACT_MENU_WIDTH;
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

function useMenuCardCollapse(collapsible: boolean, startCollapsed: boolean) {
  const [expanded, setExpanded] = React.useState(!startCollapsed);
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

function useMenuCardAnimation(collapsible: boolean, expanded: boolean, visible: boolean) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const iconRef = React.useRef<SVGSVGElement>(null);
  const initialized = React.useRef(false);
  const [borderVisible, setBorderVisible] = React.useState(!collapsible || expanded);

  React.useLayoutEffect(() => {
    const content = contentRef.current;
    const icon = iconRef.current;
    if (!content) return;

    if (!initialized.current) {
      gsap.set(content, {
        height: collapsible && !expanded ? 0 : "auto",
        opacity: collapsible && !expanded ? 0 : 1,
      });
      if (icon) gsap.set(icon, { rotation: expanded ? 45 : 0 });
      initialized.current = true;
      return;
    }

    if (!collapsible) {
      gsap.set(content, { clearProps: "height,opacity" });
      setBorderVisible(true);
      return;
    }

    if (expanded) setBorderVisible(true);

    gsap.to(content, {
      height: expanded ? "auto" : 0,
      opacity: expanded ? 1 : 0,
      duration: 0.5,
      ease: "power1.inOut",
      overwrite: true,
      onComplete: () => {
        if (!expanded) setBorderVisible(false);
      },
    });

    if (icon) {
      gsap.to(icon, {
        rotation: expanded ? 45 : 0,
        duration: 0.5,
        ease: "power1.inOut",
        overwrite: true,
      });
    }

    return () => {
      gsap.killTweensOf(content);
      if (icon) gsap.killTweensOf(icon);
    };
  }, [collapsible, expanded, visible]);

  return { contentRef, iconRef, borderVisible };
}

export interface MenuCardProps {
  visibility?: boolean;
  menu: MenuCardMenu;
  descriptionContent?: React.ReactNode;
  categories: MenuCategory[];
  dishes: MenuDish[];
  drinks: MenuDrink[];
  collapsible?: boolean;
  startCollapsed?: boolean;
  scaled?: boolean;
}

export function MenuCard({
  visibility = true,
  menu,
  descriptionContent,
  categories,
  dishes,
  drinks,
  collapsible = true,
  startCollapsed = true,
  scaled = false,
}: MenuCardProps) {
  const layout = useCompactMenuLayout();
  const collapse = useMenuCardCollapse(collapsible, startCollapsed);
  const animation = useMenuCardAnimation(collapsible, collapse.expanded, visibility);
  const data = getMenuCardData(menu, categories, dishes, drinks);

  return (
    visibility && (
      <article
        ref={layout.articleRef}
        className={cn(
          "wf relative w-full overflow-hidden border border-beige-200 bg-neutral-lightest text-black",
          scaled && "is-scaled",
          !collapsible && "flex h-full flex-col",
        )}
      >
        <span
          ref={layout.scaleProbeRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute"
          style={{ width: "var(--wf-px)", height: "var(--wf-px)" }}
        />
        <header
          role={collapsible ? "button" : undefined}
          tabIndex={collapsible ? 0 : undefined}
          aria-expanded={collapsible ? collapse.expanded : undefined}
          aria-controls={collapsible ? collapse.contentId : undefined}
          onClick={collapse.toggleExpanded}
          onKeyDown={collapse.handleHeaderKeyDown}
          className={cn(
            "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 p-6",
            (collapse.contentVisible || animation.borderVisible) &&
              "border-b border-beige-200",
            collapsible &&
              "group cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-400",
          )}
        >
          <div className="grid min-w-0 gap-2">
            {data.metaLabel && (
              <p className="text-sm font-medium tracking-[0.05em] text-brand-400 uppercase">
                {data.metaLabel}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <h2
                className={cn(
                  "text-3xl font-extrabold",
                  collapsible &&
                    "transition-colors duration-200 [transition-timing-function:ease] group-hover:text-brand-400",
                )}
              >
                {menu.displayName}
              </h2>
              {menu.isSeasonal && (
                <span className="bg-beige-100 px-2 py-1 text-xs font-semibold uppercase">
                  Saisonal
                </span>
              )}
            </div>
          </div>
          {collapsible && (
            <Plus
              ref={animation.iconRef}
              aria-hidden="true"
              strokeWidth={1.5}
              strokeLinecap="butt"
              strokeLinejoin="miter"
              className="size-[calc(24*var(--wf-px))] transition-colors duration-200 [transition-timing-function:ease] group-hover:text-brand-400"
            />
          )}
        </header>

        <div
          ref={animation.contentRef}
          id={collapse.contentId}
          aria-hidden={!collapse.contentVisible}
          className={cn(collapsible && "overflow-hidden", !collapsible && "min-h-0 flex-1")}
        >
          <div
            className={cn(
              "grid gap-10 p-6",
              !collapsible && "h-full content-start overflow-y-auto",
            )}
          >
            {menu.showDescription &&
              (descriptionContent ? (
                <div className="[&_p]:m-0">{descriptionContent}</div>
              ) : (
                menu.description && (
                  <div
                    className="[&_p]:m-0"
                    dangerouslySetInnerHTML={{ __html: menu.description }}
                  />
                )
              ))}
            {data.sections.map((section) => (
              <section key={section.category.slug} className="grid gap-6">
                <CategoryBlock
                  category={section.category}
                  items={section.items}
                  compact={layout.compact}
                  scaled={scaled}
                />
                {section.subcategories.map((subcategory) => (
                  <CategoryBlock
                    key={subcategory.category.slug}
                    category={subcategory.category}
                    items={subcategory.items}
                    compact={layout.compact}
                    subcategory
                    scaled={scaled}
                  />
                ))}
              </section>
            ))}
          </div>
        </div>
      </article>
    )
  );
}
