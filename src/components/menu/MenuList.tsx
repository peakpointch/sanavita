import React from "react";

import { getMenus, getCategories, getDishes, getDrinks } from "@/modules/cms";
import type { Menu, MenuCategory, MenuDish, MenuDrink } from "@/modules/cms";

import { MenuCard } from "./MenuCard";
import { byOrder } from "./menu-utils";

import "@/styles/components/screen.css";

export interface MenuListProps {
  collapsible?: boolean;
  skipEmptyMenus?: boolean;
}

export function MenuList({ collapsible = true, skipEmptyMenus = true }: MenuListProps) {
  const [menus, setMenus] = React.useState<Menu[]>([]);
  const [categories, setCategories] = React.useState<MenuCategory[]>([]);
  const [dishes, setDishes] = React.useState<MenuDish[]>([]);
  const [drinks, setDrinks] = React.useState<MenuDrink[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const [menus, categories, dishes, drinks] = await Promise.all([
        getMenus(),
        getCategories(),
        getDishes(),
        getDrinks(),
      ]);

      setMenus(menus.sort(byOrder));
      setCategories(categories);
      setDishes(dishes);
      setDrinks(drinks);
    };

    fetchData().catch((error) => console.error("Could not load menus.", error));
  }, []);

  return (
    <div className="screen-container-bistro grid w-full gap-8">
      {menus
        .filter(
          (menu) =>
            !skipEmptyMenus ||
            dishes.some((dish) => dish.menuId === menu.slug) ||
            drinks.some((drink) => drink.menuId === menu.slug),
        )
        .map((menu) => (
          <MenuCard
            key={menu.slug}
            menu={menu}
            categories={categories}
            dishes={dishes}
            drinks={drinks}
            collapsible={collapsible}
          />
        ))}
    </div>
  );
}
