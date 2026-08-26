import type { Menu, MenuDrink } from "@/modules/cms";

import type { MenuItem } from "./types";

const pageCollator = new Intl.Collator("de-CH");
const priceFormatter = new Intl.NumberFormat("de-CH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

function getOrder(value: unknown): number {
  if (typeof value !== "object" || value === null || !("order" in value)) return 0;
  return typeof value.order === "number" ? value.order : 0;
}

export const byOrder = <T>(a: T, b: T) => getOrder(a) - getOrder(b);

export function byPageThenOrder(a: Menu, b: Menu): number {
  return pageCollator.compare(a.onPage, b.onPage) || byOrder(a, b);
}

export function isDrink(item: MenuItem): item is MenuDrink {
  return "offers" in item;
}

function formatPrice(price?: number): string {
  return typeof price === "number" && Number.isFinite(price) ? priceFormatter.format(price) : "";
}

export function formatTime(value?: number): string {
  if (value === undefined) return "";

  const hours = value <= 24 ? Math.floor(value) : Math.floor(value / 60);
  const minutes = value <= 24 ? Math.round((value - hours) * 100) : Math.round(value % 60);

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

export function formatDate(value?: Date): string {
  if (!value || Number.isNaN(value.getTime())) return "";

  const day = value.getDate().toString().padStart(2, "0");
  const month = (value.getMonth() + 1).toString().padStart(2, "0");

  return `${day}.${month}.${value.getFullYear()}`;
}

function getDrinkOfferLabel(offer: MenuDrink["offers"][number]): string {
  const hasAmount = typeof offer.amount === "number" && Number.isFinite(offer.amount);
  const quantity = hasAmount ? [String(offer.amount), offer.unit].filter(Boolean).join(" ") : "";
  const price = formatPrice(offer.price);

  return [quantity, price].filter(Boolean).join(" | ");
}

export function getPriceLabels(item: MenuItem): string[] {
  if (isDrink(item)) {
    return item.offers.map(getDrinkOfferLabel).filter(Boolean);
  }

  return [formatPrice(item.price), formatPrice(item.priceSmall)].filter(Boolean);
}
