(()=>{let S=".accordion-content",u="menu",g="menu-section",E="dish",L="drink",T="category",l="-cms-list",p="-cms-item",f=`[aria-role="${u+l}"]`,_=`[aria-role="${g+l}"]`,C=`[aria-role="${E+l}"]`,N=`[aria-role="${L+l}"]`,I=`[aria-role="${T+l}"]`,D="heading-style-h6",w="heading-topic";window.addEventListener("DOMContentLoaded",()=>{let G=document.querySelector(S),M=document.querySelector(C),v=document.querySelector(N),A=document.querySelector(f),O=document.querySelector(I),b=M.querySelectorAll(".w-dyn-item"),R=v.querySelectorAll(".w-dyn-item"),q=A.querySelectorAll(`[aria-role="${u+p}"]`),$=O.querySelectorAll(".w-dyn-item"),y={},m={},h=[];$.forEach(e=>{let s=e.querySelector("[data-subcategory]"),n=e.dataset.category,c=e.dataset.categoryName,i=e.dataset.categoryGroup,d=e.dataset.categoryType,t=JSON.parse(s&&s.dataset.subcategory||"false");t?m[i].subcategories.push({id:n,name:c,isSubcategory:t,dishes:[]}):m[n]||(m[n]={id:n,name:c,type:d,isSubcategory:t,subcategories:[],dishes:[]})}),R.forEach(e=>{let s=e.dataset.dishName,n=e.dataset.dishType,c=e.dataset.dishMenu,i=e.dataset.dishCategory,d=e.outerHTML;c&&h.push({name:s,type:n,menu:c,category:i,dishElement:e,htmlString:d})}),b.forEach(e=>{let s=e.dataset.dishName,n=e.dataset.dishType,c=e.dataset.dishMenu,i=e.dataset.dishCategory,d=e.outerHTML;c&&h.push({name:s,type:n,menu:c,category:i,dishElement:e,htmlString:d})}),q.forEach(e=>{y[e.dataset.menu]={id:e.dataset.menu,name:e.dataset.menuName,type:e.dataset.menuType,domElement:e,menuContentElement:e.querySelector('.accordion-content[role="menu-content"]'),sections:[],classname:e.dataset.menuType==="Gerichte"?"gerichte-cms_list":"drinks-cms_list"};let s=y[e.dataset.menu];e.querySelector(_).querySelectorAll(".w-dyn-item").forEach(t=>{s.sections.push(t.dataset.menuSection)});let i=h.filter(t=>t.menu===s.id);s.sections.forEach(t=>{let o=m[t];o.subcategories.length>0&&o.subcategories.forEach(a=>{a.dishes=i.filter(r=>r.category===a.id)}),o.dishes=i.filter(a=>a.category===o.id)});let d=(t,o)=>{let a=o.subcategories.filter(r=>r.dishes.length>0);return`
          <div class="dish-group">
            <div class="heading-style-h6">${o.name}</div>
            <div class="spacer-small"></div>
            <div class="${t.classname}">
            <!-- Render dishes that belong directly to the category -->
            ${o.dishes.map(r=>r.htmlString).join("")}
            </div>

            <!-- Now render the subcategories and their dishes (if they have dishes) -->
            ${a.map(r=>`
                <div class="heading-topic">${r.name}</div>
                <div class="spacer-small"></div>
                <div class="${t.classname}">
                  ${r.dishes.map(H=>H.htmlString).join("")}
                </div>
                <div class="spacer-medium"></div>
              `).join("")}
          </div>
        `};s.sections.forEach(t=>{let o=m[t];if(o.dishes.length>0||o.subcategories.some(a=>a.dishes.length>0)){let a=d(s,o);s.menuContentElement.insertAdjacentHTML("beforeend",a)}})})})})();
