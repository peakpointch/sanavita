import { CollectionList, Payload, fetchOwnDocument } from "peakflow";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);
const PUBLISHED_HOSTNAMES = new Set([
  "sanavita-ag.webflow.io",
  "sanavita-ag.ch",
  "www.sanavita-ag.ch",
]);

export function canFetchCmsDocuments(): boolean {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname;
  return LOCAL_HOSTNAMES.has(hostname) || PUBLISHED_HOSTNAMES.has(hostname);
}

export const slugSchema = Payload.define(
  {
    slug: Payload.String(),
  },
  {
    primitivesFromString: true,
  },
);

export const dishSchema = Payload.define(
  {
    slug: Payload.String(),
    displayName: Payload.String(),
    description: Payload.String({ required: false }),
    course: Payload.String(),
    order: Payload.Number({ required: false, default: 0 }),
    price: Payload.Number({ required: false }),
    priceSmall: Payload.Number({ required: false }),
    isVegetarian: Payload.Boolean(),
    menuId: Payload.String(),
    categoryId: Payload.String({ required: false }),
  },
  {
    primitivesFromString: true,
  },
);

export const drinkSchema = Payload.define(
  {
    slug: Payload.String(),
    displayName: Payload.String(),
    description: Payload.String(),
    offers: Payload.Array(
      Payload.Object({
        price: Payload.Number({ required: false }),
        amount: Payload.Number({ required: false }),
        unit: Payload.String(),
      }),
    ),
    menuId: Payload.String(),
    categoryId: Payload.String(),
  },
  {
    primitivesFromString: true,
  },
);

export const categorySchema = Payload.define(
  {
    slug: Payload.String(),
    displayName: Payload.String(),
    description: Payload.String(),
    showDescription: Payload.Boolean(),
    type: Payload.String(),
    order: Payload.Number({ required: false, default: 0 }),
    menuId: Payload.String(),
    isSubcategory: Payload.Boolean(),
    sectionId: Payload.String(),
    sectionName: Payload.String(),
  },
  {
    primitivesFromString: true,
  },
);

export const menuSchema = Payload.define(
  {
    slug: Payload.String(),
    displayName: Payload.String(),
    description: Payload.String({ required: false }),
    showDescription: Payload.Boolean(),
    type: Payload.String(),
    onPage: Payload.String(),
    order: Payload.Number({ required: false, default: 0 }),
    isSeasonal: Payload.Boolean(),
    startDate: (dateStr) => new Date(dateStr),
    endDate: (dateStr) => new Date(dateStr),
    showTime: Payload.Boolean(),
    startTime: Payload.Number({ required: false }),
    endTime: Payload.Number({ required: false }),
    categoryIds: Payload.Array(Payload.String()), // THIS IS AN ARRAY OF SLUGS FROM THE NESTED LIST
  },
  {
    primitivesFromString: true,
  },
);

export type MenuDish = Payload.Parsed<typeof dishSchema>;
export type MenuDrink = Payload.Parsed<typeof drinkSchema>;
export type MenuCategory = Payload.Parsed<typeof categorySchema>;
export type Menu = Payload.Parsed<typeof menuSchema>;

export interface CmsPayload {
  menus: Menu[];
  categories: MenuCategory[];
  dishes: MenuDish[];
  drinks: MenuDrink[];
}

let cmsMenuPayloadPromise: Promise<CmsPayload> | undefined;

export async function getMenus(): Promise<Menu[]> {
  const menusRoot = await fetchOwnDocument("/cms/menus");
  const menuListElement = CollectionList.select("wrapper", "menus", {
    doc: menusRoot,
  });

  const menuList = new CollectionList(menuListElement, {
    id: "menus",
    schema: menuSchema,
    nestedLists: {
      categories: {},
    },
  });

  return menuList.parse();
}

export async function getDishes(): Promise<MenuDish[]> {
  const dishesRoot = await fetchOwnDocument("/cms/dishes");
  const dishListElement = CollectionList.select("wrapper", "dishes", {
    doc: dishesRoot,
  });

  const dishList = new CollectionList(dishListElement, {
    id: "dishes",
    schema: dishSchema,
  });

  return dishList.parse();
}

export async function getDrinks(): Promise<MenuDrink[]> {
  const drinksRoot = await fetchOwnDocument("/cms/drinks");
  const drinkListElement = CollectionList.select("wrapper", "drinks", {
    doc: drinksRoot,
  });

  const drinkList = new CollectionList(drinkListElement, {
    id: "drinks",
    schema: drinkSchema,
  });

  return drinkList.parse();
}

export async function getCategories(): Promise<MenuCategory[]> {
  const categoriesRoot = await fetchOwnDocument("/cms/categories");
  const categoryListElement = CollectionList.select("wrapper", "categories", {
    doc: categoriesRoot,
  });

  const categoryList = new CollectionList(categoryListElement, {
    id: "categories",
    schema: categorySchema,
  });

  return categoryList.parse();
}

export function getMenuPayload(): Promise<CmsPayload> {
  cmsMenuPayloadPromise ??= Promise.all([
    getMenus(),
    getCategories(),
    getDishes(),
    getDrinks(),
  ]).then(([menus, categories, dishes, drinks]) => ({ menus, categories, dishes, drinks }));

  return cmsMenuPayloadPromise;
}
