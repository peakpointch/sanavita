const dishes = {
  starter: {
    title: "{{wf {&quot;path&quot;:&quot;vorspeise-titel&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
    description: "",
  },
  main: {
    title: "{{wf {&quot;path&quot;:&quot;hauptspeise-titel&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
    description: "",
  },
  mainVegetarian: {
    title: "{{wf {&quot;path&quot;:&quot;vegetarisch-titel&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
    description: "",
  },
  dessert: {
    title: "{{wf {&quot;path&quot;:&quot;dessert&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
    description: null,
  }
}

const data = {
  id: "{{wf {&quot;path&quot;:&quot;slug&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
  name: "{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}",
  date: "{{wf {&quot;path&quot;:&quot;datum&quot;,&quot;transformers&quot;:[{&quot;name&quot;:&quot;date&quot;,&quot;arguments&quot;:[&quot;MMM DD, YYYY&quot;]\}],&quot;type&quot;:&quot;Date&quot;\} }}",
  wochenhit: "{{wf {&quot;path&quot;:&quot;wochenhit&quot;,&quot;type&quot;:&quot;Bool&quot;\} }}",
  dishes: dishes,
}

window.wfCollections.hit = [];
window.wfCollections.hit.push(data);
