import { wf } from "peakflow";

const MENU_CONTENT_SELECTOR = '[data-menu-element="menu-content"]';
const MENU_NAME = "menu";
const MENU_SECTION_NAME = "menu-section";
const DISH_NAME = "dish";
const DRINK_NAME = "drink";
const CATEGORY_NAME = "category";

const cmsListSuffix = "-cms-list";
const cmsItemSuffix = "-cms-item";

const MENU_LIST_SELECTOR = `[aria-role="${MENU_NAME + cmsListSuffix}"]`;
const MENU_SECTION_LIST_SELECTOR = `[aria-role="${MENU_SECTION_NAME + cmsListSuffix}"]`;
const DISH_LIST_SELECTOR = `[aria-role="${DISH_NAME + cmsListSuffix}"]`;
const DRINK_LIST_SELECTOR = `[aria-role="${DRINK_NAME + cmsListSuffix}"]`;
const CATEGORY_LIST_SELECTOR = `[aria-role="${CATEGORY_NAME + cmsListSuffix}"]`;

type DishType = "food" | "drink";
type CategoryType = string;
type CategoryList = Record<string, Category>;
type MenuList = Record<string, Menu>;

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description: string | boolean;
  dishes: Dish[];
  isSubcategory: boolean;
  subcategories: SubCategory[];
}

interface SubCategory extends Omit<Category, "type" | "subcategories"> {}

interface Menu {
  id: string;
  name: string;
  type: string;
  domElement: HTMLElement;
  menuContentElement: HTMLElement;
  /** Sections inside a menu represent a dish category */
  sections: string[];
  className: string;
}

interface Dish {
  name: string;
  type: DishType;
  menu: string;
  category: string;
  dishElement: HTMLElement;
  htmlString: string;
}

function parseDishes(nodeList: HTMLElement[]): Dish[] {
  const dishes: Dish[] = [];
  nodeList.forEach((dishEl) => {
    const dishMenu = dishEl.dataset.dishMenu;

    if (dishMenu) {
      const dish: Dish = {
        name: dishEl.dataset.dishName,
        type: dishEl.dataset.dishType as DishType,
        menu: dishMenu,
        category: dishEl.dataset.dishCategory,
        dishElement: dishEl,
        htmlString: dishEl.outerHTML,
      };
      dishes.push(dish);
    }
  });
  return dishes;
}

function DISH_GROUP_TEMPLATE(menu: Menu, category: Category) {
  const filteredSubcategories = category.subcategories.filter(
    (sub) => sub.dishes.length > 0,
  );

  return `
      <div class="dish-group">
        <div class="heading-style-h6">${category.name}</div>
        <div class="spacer-small"></div>
        <div class="${menu.className}">
        <!-- Render dishes that belong directly to the category -->
        ${category.dishes.map((dish) => dish.htmlString).join("")}
        </div>
        ${category.description ? category.description + '<div class="spacer-regular"></div>' : ""}

        <!-- Now render the subcategories and their dishes (if they have dishes) -->
        ${filteredSubcategories
          .map(
            (sub) => `
            <div class="tagline">${sub.name}</div>
            <div class="spacer-small"></div>
            <div class="${menu.className}">
              ${sub.dishes.map((dish) => dish.htmlString).join("")}
            </div>
            ${sub.description ? '<div class="spacer-regular"></div>' + sub.description : ""}
            <div class="spacer-medium"></div>
          `,
          )
          .join("")}
      </div>
    `;
}

function getDishItems(root: HTMLElement | Document): HTMLElement[] {
  const dishListElement = root.querySelector<HTMLElement>(DISH_LIST_SELECTOR);
  const dishListItems = dishListElement.querySelectorAll<HTMLElement>(
    wf.select.cmsItem,
  );
  return Array.from(dishListItems);
}

function getDrinkItems(root: HTMLElement | Document): HTMLElement[] {
  const drinkListElement = root.querySelector<HTMLElement>(DRINK_LIST_SELECTOR);
  const drinkListItems = drinkListElement.querySelectorAll<HTMLElement>(
    wf.select.cmsItem,
  );
  return Array.from(drinkListItems);
}

function getMenuItems(root: HTMLElement | Document): HTMLElement[] {
  const menuListElement = root.querySelector<HTMLElement>(MENU_LIST_SELECTOR);
  const menuListItems = menuListElement.querySelectorAll<HTMLElement>(
    `[aria-role="${MENU_NAME + cmsItemSuffix}"]`,
  );
  return Array.from(menuListItems);
}

function getMenuSectionItems(menuElement: HTMLElement): HTMLElement[] {
  const menuSectionListElement = menuElement.querySelector<HTMLElement>(
    MENU_SECTION_LIST_SELECTOR,
  );
  const menuSectionListItems =
    menuSectionListElement.querySelectorAll<HTMLElement>(".w-dyn-item");
  return Array.from(menuSectionListItems);
}

function getCategoryItems(root: HTMLElement | Document): HTMLElement[] {
  const categoryListElement = root.querySelector<HTMLElement>(
    CATEGORY_LIST_SELECTOR,
  );
  const categoryListItems = categoryListElement.querySelectorAll<HTMLElement>(
    wf.select.cmsItem,
  );
  return Array.from(categoryListItems);
}

function parseCategories(categoryListItems: HTMLElement[]): CategoryList {
  let categories: CategoryList = {};
  // Iterate through each category item
  categoryListItems.forEach((item) => {
    const subcategoryElement = item.querySelector<HTMLElement>(
      "[data-is-subcategory]",
    );
    const category = item.dataset.category;
    const categoryName = item.dataset.categoryName;
    const parentCategory = item.dataset.categoryGroup;
    const categoryType = item.dataset.categoryType;
    const isSubcategory =
      subcategoryElement?.dataset.isSubcategory === "true" ? true : false;
    const descriptionElement = item.querySelector(
      '[data-category-element="description"]',
    );
    const description = descriptionElement
      ? descriptionElement.outerHTML
      : false;

    // If it's a top-level category (no parent), create a new entry for it
    if (!isSubcategory) {
      if (!categories[category]) {
        categories[category] = {
          id: category,
          name: categoryName,
          type: categoryType,
          description: description,
          isSubcategory: isSubcategory,
          subcategories: [],
          dishes: [],
        };
      }
    } else {
      // If it's a subcategory, find the parent and add it to the subcategories array
      categories[parentCategory].subcategories.push({
        id: category,
        name: categoryName,
        description: description,
        isSubcategory: isSubcategory,
        dishes: [],
      });
    }
  });

  return categories;
}

function parseMenu(menuElement: HTMLElement): Menu {
  const menuSections = getMenuSectionItems(menuElement);
  return {
    id: menuElement.dataset.menu,
    name: menuElement.dataset.menuName,
    type: menuElement.dataset.menuType,
    domElement: menuElement,
    menuContentElement: menuElement.querySelector(MENU_CONTENT_SELECTOR),
    sections: menuSections.map<string>(
      (section) => section.dataset.menuSection,
    ),
    className:
      menuElement.dataset.menuType === "Gerichte"
        ? "gerichte-cms_list"
        : "drinks-cms_list",
  };
}

function initialize(): void {
  const root = document;
  const menuListItems = getMenuItems(root);
  const dishListItems = getDishItems(root);
  const drinkListItems = getDrinkItems(root);
  const categoryListItems = getCategoryItems(root);

  const dishes = [
    ...parseDishes(drinkListItems),
    ...parseDishes(dishListItems),
  ];
  const categories = parseCategories(categoryListItems);

  let menus: MenuList = {};

  menuListItems.forEach((menuElement) => {
    let menu: Menu = parseMenu(menuElement);
    menus[menu.id] = menu;

    let menuDishes = dishes.filter((dish) => dish.menu === menu.id);

    menu.sections.forEach((section) => {
      let sectionCategory = categories[section];

      // Store dishes directly under the category if they don't belong to subcategories
      sectionCategory.dishes = menuDishes.filter(
        (dish) => dish.category === sectionCategory.id,
      );

      // If sectionCategory has subcategories, handle them
      if (sectionCategory.subcategories.length > 0) {
        sectionCategory.subcategories.forEach((subcat) => {
          // Find dishes belonging to this subcategory and store them in subcat.dishes
          subcat.dishes = menuDishes.filter(
            (dish) => dish.category === subcat.id,
          );
        });
      }

      // Only render the section if it has dishes in the main category or subcategories
      if (sectionCategory) {
        // Create HTML for the section with its subcategories and dishes
        const sectionHTML = DISH_GROUP_TEMPLATE(menu, sectionCategory);

        // Insert the sectionHTML into your desired DOM element
        menu.menuContentElement.insertAdjacentHTML("beforeend", sectionHTML);
      }
    });
  });

  console.log("MENUS", menus);
  console.log("CATEGORIES", categories);
  console.log("DISHES", dishes);
}

window.addEventListener("DOMContentLoaded", () => {
  initialize();
});
