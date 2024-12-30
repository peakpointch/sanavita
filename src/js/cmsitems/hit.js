window.addEventListener('DOMContentLoaded', () => {
  const itemSlug = "{{wf {&quot;path&quot;:&quot;slug&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}";
  const itemSelector = `[wf-collection="hit"] [data-wf-item-id="${itemSlug}"]`
  const itemElement = document.querySelector(itemSelector);

  if (!itemElement) {
    console.error(`Item ${itemSlug} not found.`);
    return;
  }

  const getDescription = (course) => {
    const query = `[data-dish-course="${course}"] [data-pdf-field="dishDescription"]`
    const descriptionElement = itemElement.querySelector(query);
    return descriptionElement.innerHTML || null;
  }

  const dishes = {
    starter: {
      title: "{{wf {&quot;path&quot;:&quot;vorspeise-titel&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}" || null,
      description: getDescription('starter'),
    },
    main: {
      title: "{{wf {&quot;path&quot;:&quot;hauptspeise-titel&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}" || null,
      description: getDescription('main'),
    },
    mainVegetarian: {
      title: "{{wf {&quot;path&quot;:&quot;vegetarisch-titel&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}" || null,
      description: getDescription('mainVegetarian'),
    },
    dessert: {
      title: "{{wf {&quot;path&quot;:&quot;dessert&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}" || null,
      description: getDescription('dessert'),
    }
  };

  const data = {
    id: itemSlug,
    name: "{{wf {&quot;path&quot;:&quot;name&quot;,&quot;type&quot;:&quot;PlainText&quot;\} }}" || null,
    date: new Date("{{wf {&quot;path&quot;:&quot;datum&quot;,&quot;transformers&quot;:[{&quot;name&quot;:&quot;date&quot;,&quot;arguments&quot;:[&quot;MMM DD, YYYY&quot;]\}],&quot;type&quot;:&quot;Date&quot;\} }}" || null),
    endDate: new Date("{{wf {&quot;path&quot;:&quot;enddatum-wochenhit&quot;,&quot;transformers&quot;:[{&quot;name&quot;:&quot;date&quot;,&quot;arguments&quot;:[&quot;MMM DD, YYYY&quot;]\}],&quot;type&quot;:&quot;Date&quot;\} }}" || null),
    wochenhit: "{{wf {&quot;path&quot;:&quot;wochenhit&quot;,&quot;type&quot;:&quot;Bool&quot;\} }}" || null,
    dishes: dishes,
  };

  window.wfCollections.hit.push(data);
});
