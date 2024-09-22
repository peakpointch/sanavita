(()=>{let u=".accordion-content",g='[role="dish-cms-list"]',y='[role="menu-cms-list"]',S='[role="category-cms-list"]',h=a=>`
    <div class="dish-group">
      <div class="heading-style-h6">${a.name}</div>
      <div class="spacer-small"></div>
      ${a.dishes.map(s=>s.htmlString).join("")}
      ${a.subcategories.map(s=>`
        <div class="heading-topic">${s.name}</div>
        <div class="spacer-small"></div>
        <div class="drinks-cms_list">
          ${s.dishes.map(i=>i.htmlString).join("")}
        </div>
        <div class="spacer-medium"></div>
      `).join("")}
      <div class="spacer-medium"></div>
    </div>
  `,O="heading-style-h6",b="heading-topic";window.addEventListener("DOMContentLoaded",()=>{let a=document.querySelector(u),s=document.querySelector(g),i=document.querySelector(y),E=document.querySelector(S),p=s.querySelectorAll(".w-dyn-item"),L=i.querySelectorAll(".w-dyn-item"),v=E.querySelectorAll(".w-dyn-item"),d={},t={},T=[];L.forEach(e=>{d[e.dataset.menu]={name:e.dataset.menuName,type:e.dataset.menuType,domElement:e,menuContentElement:e.querySelector('.accordion-content[role="menu-content"]'),sections:{}}}),v.forEach(e=>{let n=e.querySelector("[data-subcategory]"),o=e.dataset.category,r=e.dataset.categoryName,m=e.dataset.categoryGroup,l=e.dataset.categoryType,c=JSON.parse(n&&n.dataset.subcategory||"false");c?t[m].subcategories.push({slug:o,name:r,isSubcategory:c,dishes:[]}):t[o]||(t[o]={name:r,type:l,isSubcategory:c,subcategories:[],dishes:[]})}),console.log(d),console.log(t),console.log("SUBCATEGORIES"),p.forEach(e=>{let n=e.dataset.dishCategory,o=e.dataset.dishName,r=e.outerHTML;t[n]?T.push({name:o,htmlString:r}):Object.values(t).forEach(l=>{let c=l.subcategories.find(_=>_.slug===n);c&&c.dishes.push({name:o,htmlString:r})})});let C=Object.values(t).map(e=>h(e)).join("");a.innerHTML=C})})();
