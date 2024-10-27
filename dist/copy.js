(()=>{var c=page.querySelectorAll("[copy-component]");c.forEach(t=>{let e=t.querySelector("button"),o=t.dataset.copyText;e.addEventListener("click",()=>{navigator.clipboard.writeText(o)})});})();
