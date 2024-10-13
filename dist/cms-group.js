(()=>{let T='[data-menu-element="menu-content"]',p="menu",_="menu-section",f="dish",I="drink",N="category",d="-cms-list",v="-cms-item",C=`[aria-role="${p+d}"]`,A=`[aria-role="${_+d}"]`,M=`[aria-role="${f+d}"]`,O=`[aria-role="${I+d}"]`,R=`[aria-role="${N+d}"]`,D="heading-style-h6",H="heading-topic",y={},l={},h=[];function L(a){a.forEach(t=>{let r=t.dataset.dishMenu;r&&h.push({name:t.dataset.dishName,type:t.dataset.dishType,menu:r,category:t.dataset.dishCategory,dishElement:t,htmlString:t.outerHTML})})}function $(a,t){let r=t.subcategories.filter(s=>s.dishes.length>0);return`
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
              ${s.dishes.map(g=>g.htmlString).join("")}
            </div>
            ${s.description?'<div class="spacer-regular"></div>'+s.description:""}
            <div class="spacer-medium"></div>
          `).join("")}
      </div>
    `}window.addEventListener("DOMContentLoaded",()=>{let a=document.querySelector(C),t=document.querySelector(M),r=document.querySelector(O),s=document.querySelector(R),g=t.querySelectorAll(".w-dyn-item"),q=r.querySelectorAll(".w-dyn-item"),b=a.querySelectorAll(`[aria-role="${p+v}"]`);s.querySelectorAll(".w-dyn-item").forEach(e=>{let c=e.querySelector("[data-subcategory]"),m=e.dataset.category,E=e.dataset.categoryName,u=e.dataset.categoryGroup,n=e.dataset.categoryType,i=JSON.parse(c&&c.dataset.subcategory||"false"),o=e.querySelector('[data-category-element="description"]'),S=o?o.outerHTML:!1;i?l[u].subcategories.push({id:m,name:E,description:S,isSubcategory:i,dishes:[]}):l[m]||(l[m]={id:m,name:E,type:n,description:S,isSubcategory:i,subcategories:[],dishes:[]})}),L(q),L(g),b.forEach(e=>{y[e.dataset.menu]={id:e.dataset.menu,name:e.dataset.menuName,type:e.dataset.menuType,domElement:e,menuContentElement:e.querySelector(T),sections:[],classname:e.dataset.menuType==="Gerichte"?"gerichte-cms_list":"drinks-cms_list"};let c=y[e.dataset.menu];e.querySelector(A).querySelectorAll(".w-dyn-item").forEach(n=>{c.sections.push(n.dataset.menuSection)});let u=h.filter(n=>n.menu===c.id);c.sections.forEach(n=>{let i=l[n];if(i.subcategories.length>0&&i.subcategories.forEach(o=>{o.dishes=u.filter(S=>S.category===o.id)}),i.dishes=u.filter(o=>o.category===i.id),i){let o=$(c,i);c.menuContentElement.insertAdjacentHTML("beforeend",o)}})}),console.log("MENUS",y),console.log("CATEGORIES",l),console.log("DISHES",h)})})();
