import { WFRoute } from "@xatom/core";
import { initBistroMenus } from "src/modules/menu";

/**
 * WFRoute "/"
 */
export const root = () => {
  new WFRoute("/").execute(() => {});
};

/**
 * Every page with bistro menu cards
 */
export const bistroMenus = () => {
  const routes: string[] = ["/", "/bistro", "/bistro/bankette"];

  for (const currentRoute of routes) {
    new WFRoute(currentRoute).execute(() => {
      initBistroMenus();
    });
  }
};
