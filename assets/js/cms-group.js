(() => {

  const MENU_SELECTOR = '.accordion-content';
  const DISH_LIST_SELECTOR = '[role="dish-cms-list"]';
  const MENU_LIST_SELECTOR = '[role="menu-cms-list"]';
  const CATEGORY_LIST_SELECTOR = '[role="category-cms-list"]';
  const DISH_GROUP_TEMPLATE = (category) => `
    <div class="dish-group">
      <div class="heading-style-h6">${category.name}</div>
      <div class="spacer-small"></div>
      ${category.dishes.map(dish => dish.htmlString).join('')}
      ${category.subcategories.map(sub => `
        <div class="heading-topic">${sub.name}</div>
        <div class="spacer-small"></div>
        <div class="drinks-cms_list">
          ${sub.dishes.map(dish => dish.htmlString).join('')}
        </div>
        <div class="spacer-medium"></div>
      `).join('')}
      <div class="spacer-medium"></div>
    </div>
  `;

  const DISH_CATEGORY_CLASS = `heading-style-h6`;
  const DISH_SUBCATEGORY_CLASS = `heading-topic`;

  window.addEventListener('DOMContentLoaded', () => {

    const menuElement = document.querySelector(MENU_SELECTOR);
    const dishListElement = document.querySelector(DISH_LIST_SELECTOR);
    const menuListElement = document.querySelector(MENU_LIST_SELECTOR);
    const categoryListElement = document.querySelector(CATEGORY_LIST_SELECTOR);

    const dishListItems = dishListElement.querySelectorAll('.w-dyn-item');
    const menuListItems = menuListElement.querySelectorAll('.w-dyn-item');
    const categoryListItems = categoryListElement.querySelectorAll('.w-dyn-item');

    let menus = {};
    let categories = {};
    let dishes = [];

    menuListItems.forEach(item => {


      menus[item.dataset.menu] = {
        name: item.dataset.menuName,
        type: item.dataset.menuType,
        domElement: item,
        menuContentElement: item.querySelector('.accordion-content[role="menu-content"]'),
        sections: {}
      }
    });

    // Iterate through each category item
    categoryListItems.forEach(item => {
      const subcategoryElement = item.querySelector('[data-subcategory]');
      const category = item.dataset.category;
      const categoryName = item.dataset.categoryName;
      const parentCategory = item.dataset.categoryGroup;
      const categoryType = item.dataset.categoryType;
      const isSubcategory = JSON.parse(subcategoryElement && subcategoryElement.dataset.subcategory || 'false');

      // If it's a top-level category (no parent), create a new entry for it
      if (!isSubcategory) {
        if (!categories[category]) {
          categories[category] = {
            name: categoryName,
            type: categoryType,
            isSubcategory: isSubcategory,
            subcategories: [],
            dishes: []
          };
        }
      } else {
        // If it's a subcategory, find the parent and add it to the subcategories array
        categories[parentCategory].subcategories.push({
          slug: category,
          name: categoryName,
          isSubcategory: isSubcategory,
          dishes: [] // Add a place for subcategory dishes
        });
      }
    });

    console.log(menus);
    console.log(categories);
    console.log("SUBCATEGORIES");

    // Group dishes under the right category or subcategory
    dishListItems.forEach(dish => {
      const dishCategory = dish.dataset.dishCategory; // This is the category or subcategory name
      const dishName = dish.dataset.dishName;
      const dishHtml = dish.outerHTML;

      // Find the category or subcategory in the categoryMap
      let category = categories[dishCategory];

      if (category) {
        // Add the dish directly to the category
        category.dishes.push({ name: dishName, htmlString: dishHtml });
      } else {
        // If no category is found, search for a matching subcategory
        Object.values(categories).forEach(cat => {
          const subcategory = cat.subcategories.find(sub => sub.slug === dishCategory);
          if (subcategory) {
            // Add the dish to the subcategory
            subcategory.dishes.push({ name: dishName, htmlString: dishHtml });
          }
        });
      }
    });

    // Render the grouped dishes
    const dishGroupHTML = Object.values(categories).map(category => {
      //console.log(category.subcategories);
      // [category.subcategories].forEach(sub => console.log(sub))

      return DISH_GROUP_TEMPLATE(category);
    }).join('');

    // Insert the rendered content into the DOM
    menuElement.innerHTML = dishGroupHTML;
  });

})();