(()=>{let b=".accordion-content",y="menu",S="menu-section",g="dish",E="drink",p="category",m="-cms-list",L="-cms-item",T=`[aria-role="${y+m}"]`,f=`[aria-role="${S+m}"]`,_=`[aria-role="${g+m}"]`,C=`[aria-role="${E+m}"]`,N=`[aria-role="${p+m}"]`,D="heading-style-h6",G="heading-topic";window.addEventListener("DOMContentLoaded",()=>{let I=document.querySelector(T),v=document.querySelector(_),M=document.querySelector(C),A=document.querySelector(N),O=v.querySelectorAll(".w-dyn-item"),R=M.querySelectorAll(".w-dyn-item"),$=I.querySelectorAll(`[aria-role="${y+L}"]`),q=A.querySelectorAll(".w-dyn-item"),u={},l={},h=[];q.forEach(e=>{let o=e.querySelector("[data-subcategory]"),n=e.dataset.category,a=e.dataset.categoryName,r=e.dataset.categoryGroup,d=e.dataset.categoryType,s=JSON.parse(o&&o.dataset.subcategory||"false"),t=e.querySelector('[data-category-element="description"]'),i=t?t.outerHTML:!1;s?l[r].subcategories.push({id:n,name:a,description:i,isSubcategory:s,dishes:[]}):l[n]||(l[n]={id:n,name:a,type:d,description:i,isSubcategory:s,subcategories:[],dishes:[]})}),R.forEach(e=>{let o=e.dataset.dishName,n=e.dataset.dishType,a=e.dataset.dishMenu,r=e.dataset.dishCategory,d=e.outerHTML;a&&h.push({name:o,type:n,menu:a,category:r,dishElement:e,htmlString:d})}),O.forEach(e=>{let o=e.dataset.dishName,n=e.dataset.dishType,a=e.dataset.dishMenu,r=e.dataset.dishCategory,d=e.outerHTML;a&&h.push({name:o,type:n,menu:a,category:r,dishElement:e,htmlString:d})}),$.forEach(e=>{u[e.dataset.menu]={id:e.dataset.menu,name:e.dataset.menuName,type:e.dataset.menuType,domElement:e,menuContentElement:e.querySelector('.accordion-content[role="menu-content"]'),sections:[],classname:e.dataset.menuType==="Gerichte"?"gerichte-cms_list":"drinks-cms_list"};let o=u[e.dataset.menu];e.querySelector(f).querySelectorAll(".w-dyn-item").forEach(s=>{o.sections.push(s.dataset.menuSection)});let r=h.filter(s=>s.menu===o.id);o.sections.forEach(s=>{let t=l[s];t.subcategories.length>0&&t.subcategories.forEach(i=>{i.dishes=r.filter(c=>c.category===i.id)}),t.dishes=r.filter(i=>i.category===t.id)});let d=(s,t)=>{let i=t.subcategories.filter(c=>c.dishes.length>0);return`
          <div class="dish-group">
            <div class="heading-style-h6">${t.name}</div>
            <div class="spacer-small"></div>
            <div class="${s.classname}">
            <!-- Render dishes that belong directly to the category -->
            ${t.dishes.map(c=>c.htmlString).join("")}
            </div>
            ${t.description?t.description+'<div class="spacer-regular"></div>':""}

            <!-- Now render the subcategories and their dishes (if they have dishes) -->
            ${i.map(c=>`
                <div class="heading-topic">${c.name}</div>
                <div class="spacer-small"></div>
                <div class="${s.classname}">
                  ${c.dishes.map(H=>H.htmlString).join("")}
                </div>
                ${c.description?'<div class="spacer-regular"></div>'+c.description:""}
                <div class="spacer-medium"></div>
              `).join("")}
          </div>
        `};o.sections.forEach(s=>{let t=l[s];if(t.dishes.length>0||t.subcategories.some(i=>i.dishes.length>0)){let i=d(o,t);o.menuContentElement.insertAdjacentHTML("beforeend",i)}})}),console.log("MENUS",u),console.log("CATEGORIES",l),console.log("DISHES",h)})})();
