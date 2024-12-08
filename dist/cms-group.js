(()=>{var f='[data-menu-element="menu-content"]',p="menu",v="menu-section",I="dish",N="drink",C="category",l="-cms-list",A="-cms-item",M=`[aria-role="${p+l}"]`,O=`[aria-role="${v+l}"]`,$=`[aria-role="${I+l}"]`,R=`[aria-role="${N+l}"]`,q=`[aria-role="${C+l}"]`;var g={},S={},L=[];function E(o){o.forEach(t=>{let r=t.dataset.dishMenu;r&&L.push({name:t.dataset.dishName,type:t.dataset.dishType,menu:r,category:t.dataset.dishCategory,dishElement:t,htmlString:t.outerHTML})})}function b(o,t){let r=t.subcategories.filter(s=>s.dishes.length>0);return`
      <div class="dish-group">
        <div class="heading-style-h6">${t.name}</div>
        <div class="spacer-small"></div>
        <div class="${o.classname}">
        <!-- Render dishes that belong directly to the category -->
        ${t.dishes.map(s=>s.htmlString).join("")}
        </div>
        ${t.description?t.description+'<div class="spacer-regular"></div>':""}

        <!-- Now render the subcategories and their dishes (if they have dishes) -->
        ${r.map(s=>`
            <div class="heading-topic">${s.name}</div>
            <div class="spacer-small"></div>
            <div class="${o.classname}">
              ${s.dishes.map(y=>y.htmlString).join("")}
            </div>
            ${s.description?'<div class="spacer-regular"></div>'+s.description:""}
            <div class="spacer-medium"></div>
          `).join("")}
      </div>
    `}window.addEventListener("DOMContentLoaded",()=>{let o=document.querySelector(M),t=document.querySelector($),r=document.querySelector(R),s=document.querySelector(q),y=t.querySelectorAll(".w-dyn-item"),T=r.querySelectorAll(".w-dyn-item"),_=o.querySelectorAll(`[aria-role="${p+A}"]`);s.querySelectorAll(".w-dyn-item").forEach(e=>{let a=e.querySelector("[data-subcategory]"),d=e.dataset.category,h=e.dataset.categoryName,m=e.dataset.categoryGroup,n=e.dataset.categoryType,i=JSON.parse(a&&a.dataset.subcategory||"false"),c=e.querySelector('[data-category-element="description"]'),u=c?c.outerHTML:!1;i?S[m].subcategories.push({id:d,name:h,description:u,isSubcategory:i,dishes:[]}):S[d]||(S[d]={id:d,name:h,type:n,description:u,isSubcategory:i,subcategories:[],dishes:[]})}),E(T),E(y),_.forEach(e=>{g[e.dataset.menu]={id:e.dataset.menu,name:e.dataset.menuName,type:e.dataset.menuType,domElement:e,menuContentElement:e.querySelector(f),sections:[],classname:e.dataset.menuType==="Gerichte"?"gerichte-cms_list":"drinks-cms_list"};let a=g[e.dataset.menu];e.querySelector(O).querySelectorAll(".w-dyn-item").forEach(n=>{a.sections.push(n.dataset.menuSection)});let m=L.filter(n=>n.menu===a.id);a.sections.forEach(n=>{let i=S[n];if(i.subcategories.length>0&&i.subcategories.forEach(c=>{c.dishes=m.filter(u=>u.category===c.id)}),i.dishes=m.filter(c=>c.category===i.id),i){let c=b(a,i);a.menuContentElement.insertAdjacentHTML("beforeend",c)}})})});})();
