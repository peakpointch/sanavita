(() => {
  // node_modules/peakflow/dist/webflow/webflow.js
  var siteId = document.documentElement.dataset.wfSite || "";
  var pageId = document.documentElement.dataset.wfPage || "";
  var wfclass = {
    invisible: "w-condition-invisible",
    input: "w-input",
    select: "w-select",
    wradio: "w-radio",
    radio: "w-radio-input",
    wcheckbox: "w-checkbox",
    checkbox: "w-checkbox-input",
    checked: "w--redirected-checked",
    focus: "w--redirected-focus",
    focusVisible: "w--redirected-focus-visible",
    cmsWrapper: "w-dyn-list",
    cmsList: "w-dyn-items",
    cmsItem: "w-dyn-item"
  };
  var inputSelectorList = [
    `.${wfclass.input}`,
    `.${wfclass.select}`,
    `.${wfclass.wradio} input[type="radio"]`,
    `.${wfclass.wcheckbox} input[type="checkbox"]:not(.${wfclass.checkbox})`
  ];
  var wfselect = {
    invisible: `.${wfclass.invisible}`,
    input: `.${wfclass.input}`,
    select: `.${wfclass.select}`,
    wradio: `.${wfclass.wradio}`,
    radio: `.${wfclass.radio}`,
    wcheckbox: `.${wfclass.wcheckbox}`,
    checkbox: `.${wfclass.checkbox}`,
    checked: `.${wfclass.checked}`,
    focused: `:focus-visible, [data-wf-focus-visible]`,
    focus: `.${wfclass.focus}`,
    focusVisible: `.${wfclass.focusVisible}`,
    cmsWrapper: `.${wfclass.cmsWrapper}`,
    cmsList: `.${wfclass.cmsList}`,
    cmsItem: `.${wfclass.cmsItem}`,
    formInput: inputSelectorList.join(", "),
    radioInput: `.${wfclass.wradio} input[type="radio"]`,
    checkboxInput: `.${wfclass.wcheckbox} input[type="checkbox"]:not(.${wfclass.checkbox})`,
    inputSelectorList
  };
  var wf = {
    siteId,
    pageId,
    class: wfclass,
    select: wfselect
  };

  // src/sanavita/ts/menu.ts
  var MENU_CONTENT_SELECTOR = '[data-menu-element="menu-content"]';
  var MENU_NAME = "menu";
  var MENU_SECTION_NAME = "menu-section";
  var DISH_NAME = "dish";
  var DRINK_NAME = "drink";
  var CATEGORY_NAME = "category";
  var cmsListSuffix = "-cms-list";
  var cmsItemSuffix = "-cms-item";
  var MENU_LIST_SELECTOR = `[aria-role="${MENU_NAME + cmsListSuffix}"]`;
  var MENU_SECTION_LIST_SELECTOR = `[aria-role="${MENU_SECTION_NAME + cmsListSuffix}"]`;
  var DISH_LIST_SELECTOR = `[aria-role="${DISH_NAME + cmsListSuffix}"]`;
  var DRINK_LIST_SELECTOR = `[aria-role="${DRINK_NAME + cmsListSuffix}"]`;
  var CATEGORY_LIST_SELECTOR = `[aria-role="${CATEGORY_NAME + cmsListSuffix}"]`;
  var menus = {};
  var categories = {};
  var dishes = [];
  function pushDishes(nodeList) {
    nodeList.forEach((dishEl) => {
      const dishMenu = dishEl.dataset.dishMenu;
      if (dishMenu) {
        const dish = {
          name: dishEl.dataset.dishName,
          type: dishEl.dataset.dishType,
          menu: dishMenu,
          category: dishEl.dataset.dishCategory,
          dishElement: dishEl,
          htmlString: dishEl.outerHTML
        };
        dishes.push(dish);
      }
    });
  }
  function DISH_GROUP_TEMPLATE(menu, category) {
    const filteredSubcategories = category.subcategories.filter(
      (sub) => sub.dishes.length > 0
    );
    return `
      <div class="dish-group">
        <div class="heading-style-h6">${category.name}</div>
        <div class="spacer-small"></div>
        <div class="${menu.classname}">
        <!-- Render dishes that belong directly to the category -->
        ${category.dishes.map((dish) => dish.htmlString).join("")}
        </div>
        ${category.description ? category.description + '<div class="spacer-regular"></div>' : ""}

        <!-- Now render the subcategories and their dishes (if they have dishes) -->
        ${filteredSubcategories.map(
      (sub) => `
            <div class="heading-topic">${sub.name}</div>
            <div class="spacer-small"></div>
            <div class="${menu.classname}">
              ${sub.dishes.map((dish) => dish.htmlString).join("")}
            </div>
            ${sub.description ? '<div class="spacer-regular"></div>' + sub.description : ""}
            <div class="spacer-medium"></div>
          `
    ).join("")}
      </div>
    `;
  }
  function getDishItems() {
    const dishListElement = document.querySelector(DISH_LIST_SELECTOR);
    const dishListItems = dishListElement.querySelectorAll(
      wf.select.cmsItem
    );
    return Array.from(dishListItems);
  }
  function getDrinkItems() {
    const drinkListElement = document.querySelector(DRINK_LIST_SELECTOR);
    const drinkListItems = drinkListElement.querySelectorAll(
      wf.select.cmsItem
    );
    return Array.from(drinkListItems);
  }
  function getMenuItems() {
    const menuListElement = document.querySelector(MENU_LIST_SELECTOR);
    const menuListItems = menuListElement.querySelectorAll(
      `[aria-role="${MENU_NAME + cmsItemSuffix}"]`
    );
    return Array.from(menuListItems);
  }
  function getCategoryItems() {
    const categoryListElement = document.querySelector(
      CATEGORY_LIST_SELECTOR
    );
    const categoryListItems = categoryListElement.querySelectorAll(
      wf.select.cmsItem
    );
    return Array.from(categoryListItems);
  }
  function initialize() {
    const menuListItems = getMenuItems();
    const dishListItems = getDishItems();
    const drinkListItems = getDrinkItems();
    const categoryListItems = getCategoryItems();
    categoryListItems.forEach((item) => {
      const subcategoryElement = item.querySelector(
        "[data-is-subcategory]"
      );
      const category = item.dataset.category;
      const categoryName = item.dataset.categoryName;
      const parentCategory = item.dataset.categoryGroup;
      const categoryType = item.dataset.categoryType;
      const isSubcategory = subcategoryElement?.dataset.isSubcategory === "true" ? true : false;
      const descriptionElement = item.querySelector(
        '[data-category-element="description"]'
      );
      const description = descriptionElement ? descriptionElement.outerHTML : false;
      if (!isSubcategory) {
        if (!categories[category]) {
          categories[category] = {
            id: category,
            name: categoryName,
            type: categoryType,
            description,
            isSubcategory,
            subcategories: [],
            dishes: []
          };
        }
      } else {
        categories[parentCategory].subcategories.push({
          id: category,
          name: categoryName,
          description,
          isSubcategory,
          dishes: []
        });
      }
    });
    pushDishes(drinkListItems);
    pushDishes(dishListItems);
    menuListItems.forEach((menuElement) => {
      menus[menuElement.dataset.menu] = {
        id: menuElement.dataset.menu,
        name: menuElement.dataset.menuName,
        type: menuElement.dataset.menuType,
        domElement: menuElement,
        menuContentElement: menuElement.querySelector(MENU_CONTENT_SELECTOR),
        sections: [],
        classname: menuElement.dataset.menuType === "Gerichte" ? "gerichte-cms_list" : "drinks-cms_list"
      };
      let menu = menus[menuElement.dataset.menu];
      const menuSectionListElement = menuElement.querySelector(
        MENU_SECTION_LIST_SELECTOR
      );
      const menuSectionListItems = menuSectionListElement.querySelectorAll(".w-dyn-item");
      menuSectionListItems.forEach((section) => {
        menu.sections.push(section.dataset.menuSection);
      });
      let menuDishes = dishes.filter((dish) => dish.menu === menu.id);
      menu.sections.forEach((section) => {
        let sectionCategory = categories[section];
        if (!sectionCategory.isSubcategory && sectionCategory.subcategories.length > 0) {
          sectionCategory.subcategories.forEach((subcat) => {
            subcat.dishes = menuDishes.filter(
              (dish) => dish.category === subcat.id
            );
          });
        }
        sectionCategory.dishes = menuDishes.filter(
          (dish) => dish.category === sectionCategory.id
        );
        if (sectionCategory) {
          const sectionHTML = DISH_GROUP_TEMPLATE(menu, sectionCategory);
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
})();
//# sourceMappingURL=menu.js.map
