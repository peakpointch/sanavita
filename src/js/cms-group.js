const MENU_CONTENT_SELECTOR = '[data-menu-element="menu-content"]';
const MENU_NAME = 'menu';
const MENU_SECTION_NAME = 'menu-section'
const DISH_NAME = 'dish';
const DRINK_NAME = 'drink';
const CATEGORY_NAME = 'category';

const cmsListSuffix = '-cms-list';
const cmsItemSuffix = '-cms-item';

const MENU_LIST_SELECTOR = `[aria-role="${MENU_NAME + cmsListSuffix}"]`;
const MENU_SECTION_LIST_SELECTOR = `[aria-role="${MENU_SECTION_NAME + cmsListSuffix}"]`;
const DISH_LIST_SELECTOR = `[aria-role="${DISH_NAME + cmsListSuffix}"]`;
const DRINK_LIST_SELECTOR = `[aria-role="${DRINK_NAME + cmsListSuffix}"]`;
const CATEGORY_LIST_SELECTOR = `[aria-role="${CATEGORY_NAME + cmsListSuffix}"]`;

const DISH_CATEGORY_CLASS = `heading-style-h6`;
const DISH_SUBCATEGORY_CLASS = `heading-topic`;

let menus = {};
let categories = {};
let dishes = [];

function pushDishes(list) {
  list.forEach(dish => {
    const dishMenu = dish.dataset.dishMenu;

    if (dishMenu) {
      dishes.push({
        name: dish.dataset.dishName,
        type: dish.dataset.dishType,
        menu: dishMenu,
        category: dish.dataset.dishCategory,
        dishElement: dish,
        htmlString: dish.outerHTML,
      });
    }
  });
}

function DISH_GROUP_TEMPLATE(menu, category) {
  const filteredSubcategories = category.subcategories.filter(sub => sub.dishes.length > 0);

  return `
      <div class="dish-group">
        <div class="heading-style-h6">${category.name}</div>
        <div class="spacer-small"></div>
        <div class="${menu.classname}">
        <!-- Render dishes that belong directly to the category -->
        ${category.dishes.map(dish => dish.htmlString).join('')}
        </div>
        ${category.description ? category.description + '<div class="spacer-regular"></div>' : ''}

        <!-- Now render the subcategories and their dishes (if they have dishes) -->
        ${filteredSubcategories.map(sub => `
            <div class="heading-topic">${sub.name}</div>
            <div class="spacer-small"></div>
            <div class="${menu.classname}">
              ${sub.dishes.map(dish => dish.htmlString).join('')}
            </div>
            ${sub.description ? '<div class="spacer-regular"></div>' + sub.description : ''}
            <div class="spacer-medium"></div>
          `).join('')}
      </div>
    `;
};


window.addEventListener('DOMContentLoaded', () => {

  const menuListElement = document.querySelector(MENU_LIST_SELECTOR);
  const dishListElement = document.querySelector(DISH_LIST_SELECTOR);
  const drinkListElement = document.querySelector(DRINK_LIST_SELECTOR);
  const categoryListElement = document.querySelector(CATEGORY_LIST_SELECTOR);

  const dishListItems = dishListElement.querySelectorAll('.w-dyn-item');
  const drinkListItems = drinkListElement.querySelectorAll('.w-dyn-item');
  const menuListItems = menuListElement.querySelectorAll(`[aria-role="${MENU_NAME + cmsItemSuffix}"]`);
  const categoryListItems = categoryListElement.querySelectorAll('.w-dyn-item');

  // Iterate through each category item
  categoryListItems.forEach(item => {
    const subcategoryElement = item.querySelector('[data-subcategory]');
    const category = item.dataset.category;
    const categoryName = item.dataset.categoryName;
    const parentCategory = item.dataset.categoryGroup;
    const categoryType = item.dataset.categoryType;
    const isSubcategory = JSON.parse(subcategoryElement && subcategoryElement.dataset.subcategory || 'false');
    const descriptionElement = item.querySelector('[data-category-element="description"]');
    const description = descriptionElement ? descriptionElement.outerHTML : false;

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
          dishes: []
        };
      }
    } else {
      // If it's a subcategory, find the parent and add it to the subcategories array
      categories[parentCategory].subcategories.push({
        id: category,
        name: categoryName,
        description: description,
        isSubcategory: isSubcategory,
        dishes: []
      });
    }
  });

  pushDishes(drinkListItems);
  pushDishes(dishListItems);

  menuListItems.forEach(menuElement => {
    // console.log("MENU: " + menuElement.dataset.menuName.toUpperCase());

    menus[menuElement.dataset.menu] = {
      id: menuElement.dataset.menu,
      name: menuElement.dataset.menuName,
      type: menuElement.dataset.menuType,
      domElement: menuElement,
      menuContentElement: menuElement.querySelector(MENU_CONTENT_SELECTOR),
      sections: [],
      classname: menuElement.dataset.menuType === 'Gerichte' ? 'gerichte-cms_list' : 'drinks-cms_list'
    }

    let menu = menus[menuElement.dataset.menu]

    const menuSectionListElement = menuElement.querySelector(MENU_SECTION_LIST_SELECTOR);
    const menuSectionListItems = menuSectionListElement.querySelectorAll('.w-dyn-item');

    menuSectionListItems.forEach(section => {
      menu.sections.push(section.dataset.menuSection);
    });

    let menuDishes = dishes.filter(dish => dish.menu === menu.id)

    // Assuming you already have the categories array structure
    menu.sections.forEach(section => {
      let sectionCategory = categories[section];

      // If sectionCategory has subcategories, handle them
      if (sectionCategory.subcategories.length > 0) {
        sectionCategory.subcategories.forEach(subcat => {
          // Find dishes belonging to this subcategory and store them in subcat.dishes
          subcat.dishes = menuDishes.filter(dish => dish.category === subcat.id);
        });
      }

      // Store dishes directly under the category if they don't belong to subcategories
      sectionCategory.dishes = menuDishes.filter(dish => dish.category === sectionCategory.id);

      // Only render the section if it has dishes in the main category or subcategories
      if (sectionCategory) {
        // Create HTML for the section with its subcategories and dishes
        const sectionHTML = DISH_GROUP_TEMPLATE(menu, sectionCategory);

        // Insert the sectionHTML into your desired DOM element
        menu.menuContentElement.insertAdjacentHTML('beforeend', sectionHTML);
      }
    });
  });


  console.log("MENUS", menus);
  console.log("CATEGORIES", categories);
  console.log("DISHES", dishes);
});
