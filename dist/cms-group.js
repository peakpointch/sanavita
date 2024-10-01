(()=>{let S=".accordion-content",h="menu",g="menu-section",E="dish",p="drink",L="category",l="-cms-list",T="-cms-item",f=`[aria-role="${h+l}"]`,_=`[aria-role="${g+l}"]`,C=`[aria-role="${E+l}"]`,N=`[aria-role="${p+l}"]`,v=`[aria-role="${L+l}"]`,D="heading-style-h6",w="heading-topic";window.addEventListener("DOMContentLoaded",()=>{let G=document.querySelector(S),I=document.querySelector(C),M=document.querySelector(N),A=document.querySelector(f),O=document.querySelector(v),$=I.querySelectorAll(".w-dyn-item"),q=M.querySelectorAll(".w-dyn-item"),R=A.querySelectorAll(`[aria-role="${h+T}"]`),b=O.querySelectorAll(".w-dyn-item"),y={},m={},u=[];b.forEach(e=>{let o=e.querySelector("[data-subcategory]"),c=e.dataset.category,a=e.dataset.categoryName,r=e.dataset.categoryGroup,d=e.dataset.categoryType,s=JSON.parse(o&&o.dataset.subcategory||"false"),t=e.querySelector('[data-category-element="description"]'),i=t?t.outerHTML:!1;s?m[r].subcategories.push({id:c,name:a,description:i,isSubcategory:s,dishes:[]}):m[c]||(m[c]={id:c,name:a,type:d,description:i,isSubcategory:s,subcategories:[],dishes:[]})}),q.forEach(e=>{let o=e.dataset.dishName,c=e.dataset.dishType,a=e.dataset.dishMenu,r=e.dataset.dishCategory,d=e.outerHTML;a&&u.push({name:o,type:c,menu:a,category:r,dishElement:e,htmlString:d})}),$.forEach(e=>{let o=e.dataset.dishName,c=e.dataset.dishType,a=e.dataset.dishMenu,r=e.dataset.dishCategory,d=e.outerHTML;a&&u.push({name:o,type:c,menu:a,category:r,dishElement:e,htmlString:d})}),R.forEach(e=>{y[e.dataset.menu]={id:e.dataset.menu,name:e.dataset.menuName,type:e.dataset.menuType,domElement:e,menuContentElement:e.querySelector('.accordion-content[role="menu-content"]'),sections:[],classname:e.dataset.menuType==="Gerichte"?"gerichte-cms_list":"drinks-cms_list"};let o=y[e.dataset.menu];e.querySelector(_).querySelectorAll(".w-dyn-item").forEach(s=>{o.sections.push(s.dataset.menuSection)});let r=u.filter(s=>s.menu===o.id);o.sections.forEach(s=>{let t=m[s];t.subcategories.length>0&&t.subcategories.forEach(i=>{i.dishes=r.filter(n=>n.category===i.id)}),t.dishes=r.filter(i=>i.category===t.id)});let d=(s,t)=>{let i=t.subcategories.filter(n=>n.dishes.length>0);return`
          <div class="dish-group">
            <div class="heading-style-h6">${t.name}</div>
            <div class="spacer-small"></div>
            <div class="${s.classname}">
            <!-- Render dishes that belong directly to the category -->
            ${t.dishes.map(n=>n.htmlString).join("")}
            </div>
            ${t.description?t.description+'<div class="spacer-regular"></div>':""}

            <!-- Now render the subcategories and their dishes (if they have dishes) -->
            ${i.map(n=>`
                <div class="heading-topic">${n.name}</div>
                <div class="spacer-small"></div>
                <div class="${s.classname}">
                  ${n.dishes.map(H=>H.htmlString).join("")}
                </div>
                ${n.description?'<div class="spacer-regular"></div>'+n.description:""}
                <div class="spacer-medium"></div>
              `).join("")}
          </div>
        `};o.sections.forEach(s=>{let t=m[s];if(t.dishes.length>0||t.subcategories.some(i=>i.dishes.length>0)){let i=d(o,t);o.menuContentElement.insertAdjacentHTML("beforeend",i)}})})})})();
