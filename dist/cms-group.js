(()=>{var f='[data-menu-element="menu-content"]',L="menu",I="menu-section",N="dish",v="drink",C="category",m="-cms-list",A="-cms-item",M=`[aria-role="${L+m}"]`,O=`[aria-role="${I+m}"]`,R=`[aria-role="${N+m}"]`,$=`[aria-role="${v+m}"]`,q=`[aria-role="${C+m}"]`;var g={},l={},E=[];function p(a){a.forEach(t=>{let r=t.dataset.dishMenu;r&&E.push({name:t.dataset.dishName,type:t.dataset.dishType,menu:r,category:t.dataset.dishCategory,dishElement:t,htmlString:t.outerHTML})})}function b(a,t){let r=t.subcategories.filter(s=>s.dishes.length>0);return`
      <div class="dish-group">
        <div class="heading-style-h6">${t.name}</div>
        <div class="spacer-small"></div>
        <div class="${a.classname}">
        <!-- Render dishes that belong directly to the category -->
        ${t.dishes.map(s=>s.htmlString).join("")}
        </div>
        ${t.description?t.description+'<div class="spacer-regular"></div>':""}

        <!-- Now render the subcategories and their dishes (if they have dishes) -->
        ${r.map(s=>`
            <div class="heading-topic">${s.name}</div>
            <div class="spacer-small"></div>
            <div class="${a.classname}">
              ${s.dishes.map(y=>y.htmlString).join("")}
            </div>
            ${s.description?'<div class="spacer-regular"></div>'+s.description:""}
            <div class="spacer-medium"></div>
          `).join("")}
      </div>
    `}window.addEventListener("DOMContentLoaded",()=>{let a=document.querySelector(M),t=document.querySelector(R),r=document.querySelector($),s=document.querySelector(q),y=t.querySelectorAll(".w-dyn-item"),T=r.querySelectorAll(".w-dyn-item"),_=a.querySelectorAll(`[aria-role="${L+A}"]`);s.querySelectorAll(".w-dyn-item").forEach(e=>{let c=e.querySelector("[data-subcategory]"),d=e.dataset.category,h=e.dataset.categoryName,u=e.dataset.categoryGroup,n=e.dataset.categoryType,i=JSON.parse(c&&c.dataset.subcategory||"false"),o=e.querySelector('[data-category-element="description"]'),S=o?o.outerHTML:!1;i?l[u].subcategories.push({id:d,name:h,description:S,isSubcategory:i,dishes:[]}):l[d]||(l[d]={id:d,name:h,type:n,description:S,isSubcategory:i,subcategories:[],dishes:[]})}),p(T),p(y),_.forEach(e=>{g[e.dataset.menu]={id:e.dataset.menu,name:e.dataset.menuName,type:e.dataset.menuType,domElement:e,menuContentElement:e.querySelector(f),sections:[],classname:e.dataset.menuType==="Gerichte"?"gerichte-cms_list":"drinks-cms_list"};let c=g[e.dataset.menu];e.querySelector(O).querySelectorAll(".w-dyn-item").forEach(n=>{c.sections.push(n.dataset.menuSection)});let u=E.filter(n=>n.menu===c.id);c.sections.forEach(n=>{let i=l[n];if(i.subcategories.length>0&&i.subcategories.forEach(o=>{o.dishes=u.filter(S=>S.category===o.id)}),i.dishes=u.filter(o=>o.category===i.id),i){let o=b(c,i);c.menuContentElement.insertAdjacentHTML("beforeend",o)}})}),console.log("MENUS",g),console.log("CATEGORIES",l),console.log("DISHES",E)});})();
