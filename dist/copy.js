page.querySelectorAll("[copy-component]").forEach(t=>{let o=t.querySelector("button"),e=t.dataset.copyText;o.addEventListener("click",()=>{navigator.clipboard.writeText(e)})});
