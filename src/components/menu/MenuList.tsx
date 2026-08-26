import React from "react";

import { cn } from "@/lib/utils";
import { canFetchCmsDocuments, getMenuPayload } from "@/modules/cms";
import type { Menu, MenuCategory, MenuDish, MenuDrink } from "@/modules/cms";

import { MenuCard } from "./MenuCard";
import { MenuCardSkeleton } from "./MenuCardSkeleton";
import { byOrder } from "./menu-utils";

export type MenuPageFilter = "All" | "Bistro" | "Bankette" | "Not set";
export type MenuSeasonalFilter = "All" | "Seasonal" | "Not seasonal";

export interface MenuListProps {
  visibility?: boolean;
  collapsible?: boolean;
  startCollapsed?: boolean;
  skipEmptyMenus?: boolean;
  onPage?: MenuPageFilter;
  seasonal?: MenuSeasonalFilter;
  limit?: number;
  skip?: number;
  scaled?: boolean;
}

function hasMenuItems(menu: Menu, dishes: MenuDish[], drinks: MenuDrink[]): boolean {
  return (
    dishes.some((dish) => dish.menuId === menu.slug) ||
    drinks.some((drink) => drink.menuId === menu.slug)
  );
}

function matchesPage(menu: Menu, onPage: MenuPageFilter): boolean {
  if (onPage === "All") return true;
  if (onPage === "Not set") return !menu.onPage;
  return menu.onPage === onPage;
}

function matchesSeasonal(menu: Menu, seasonal: MenuSeasonalFilter): boolean {
  if (seasonal === "All") return true;
  return menu.isSeasonal === (seasonal === "Seasonal");
}

function getVisibleMenus(
  menus: Menu[],
  dishes: MenuDish[],
  drinks: MenuDrink[],
  options: {
    skipEmptyMenus: boolean;
    onPage: MenuPageFilter;
    seasonal: MenuSeasonalFilter;
    limit: number;
    skip: number;
  },
): Menu[] {
  const start = Math.max(0, Math.trunc(options.skip));
  const count = Math.max(0, Math.trunc(options.limit));
  const end = count === 0 ? undefined : start + count;

  return menus
    .filter((menu) => !options.skipEmptyMenus || hasMenuItems(menu, dishes, drinks))
    .filter((menu) => matchesPage(menu, options.onPage))
    .filter((menu) => matchesSeasonal(menu, options.seasonal))
    .slice(start, end);
}

export function MenuList({
  visibility = true,
  collapsible = true,
  startCollapsed = true,
  skipEmptyMenus = true,
  onPage = "All",
  seasonal = "All",
  limit = 0,
  skip = 0,
  scaled = false,
}: MenuListProps) {
  const [menus, setMenus] = React.useState<Menu[]>([]);
  const [categories, setCategories] = React.useState<MenuCategory[]>([]);
  const [dishes, setDishes] = React.useState<MenuDish[]>([]);
  const [drinks, setDrinks] = React.useState<MenuDrink[]>([]);
  const [isLoading, setIsLoading] = React.useState(canFetchCmsDocuments);

  React.useEffect(() => {
    if (!canFetchCmsDocuments()) return;

    let active = true;
    setIsLoading(true);

    getMenuPayload()
      .then(({ menus, categories, dishes, drinks }) => {
        if (!active) return;

        setMenus([...menus].sort(byOrder));
        setCategories(categories);
        setDishes(dishes);
        setDrinks(drinks);
      })
      .catch((error) => console.error("Could not load menus.", error))
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleMenus = getVisibleMenus(menus, dishes, drinks, {
    skipEmptyMenus,
    onPage,
    seasonal,
    limit,
    skip,
  });

  return (
    visibility && (
      <div className={cn("wf grid w-full gap-8 font-sans text-base", scaled && "is-scaled")}>
        {isLoading ? (
          <>
            <MenuCardSkeleton collapsed={collapsible && startCollapsed} scaled={scaled} />
            <MenuCardSkeleton collapsed={collapsible && startCollapsed} scaled={scaled} />
          </>
        ) : (
          visibleMenus.map((menu) => (
            <MenuCard
              key={menu.slug}
              menu={menu}
              categories={categories}
              dishes={dishes}
              drinks={drinks}
              collapsible={collapsible}
              startCollapsed={startCollapsed}
              scaled={scaled}
            />
          ))
        )}
      </div>
    )
  );
}
