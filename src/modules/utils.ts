import { Slider, mergeOptions } from "peakflow";

interface PopulateSwiperOptions {
  amount?: number;
  doc?: Document;
  name?: string;
  template?: Element;
}

const defaultPopulateSwiperOptions: PopulateSwiperOptions = {
  amount: 3,
  doc: document,
  name: "",
};

export function populateSwiper(options: Partial<PopulateSwiperOptions>) {
  const opts = mergeOptions(
    defaultPopulateSwiperOptions,
    options
  ) as PopulateSwiperOptions;

  const swiperElements = opts.doc.body.querySelectorAll(
    Slider.selector("component", opts.name)
  );

  swiperElements.forEach((swiperEl) => {
    const wrappers = Array.from(
      swiperEl.querySelectorAll(Slider.selector("wrapper"))
    );
    const wrapperEl = wrappers[wrappers.length - 1];
    const template = opts.template ?? wrapperEl.firstElementChild;

    for (let i = 0; i < opts.amount; i++) {
      const cloned = template.cloneNode(true);
      wrapperEl.appendChild(cloned);
    }
  });
}
