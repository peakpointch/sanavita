import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";
import React, { type ReactNode } from "react";

import "@/styles/components/globals.css";
import { canFetchCmsDocuments, getMenuPayload } from "@/modules/cms";
import type { CmsPayload } from "@/modules/cms";

import { MenuCard, type MenuCardMenu } from "./MenuCard";
import { MenuCardSkeleton } from "./MenuCardSkeleton";

interface MenuCardWebflowProps {
  visibility?: boolean;
  collapsible?: boolean;
  startCollapsed?: boolean;
  scaled?: boolean;
  slug?: string;
  displayName?: string;
  description?: string;
  showDescription?: boolean;
  startDate?: string;
  endDate?: string;
  isSeasonal?: boolean;
  showTime?: boolean;
  startTime?: number;
  endTime?: number;
}

const EMPTY_CMS_PAYLOAD: CmsPayload = {
  menus: [],
  categories: [],
  dishes: [],
  drinks: [],
};

function useMenuPayload(): { payload: CmsPayload; isLoading: boolean } {
  const [payload, setPayload] = React.useState(EMPTY_CMS_PAYLOAD);
  const [isLoading, setIsLoading] = React.useState(canFetchCmsDocuments);

  React.useEffect(() => {
    if (!canFetchCmsDocuments()) return;

    let active = true;
    setIsLoading(true);

    getMenuPayload()
      .then((payload) => {
        if (active) setPayload(payload);
      })
      .catch((error) => console.error("Could not load menu content.", error))
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { payload, isLoading };
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return undefined;
  }

  return date;
}

function WebflowMenuCard({
  visibility = true,
  collapsible = true,
  startCollapsed = false,
  scaled = false,
  slug = "",
  displayName = "",
  description,
  showDescription = false,
  startDate,
  endDate,
  isSeasonal = false,
  showTime = false,
  startTime,
  endTime,
}: MenuCardWebflowProps) {
  const { payload, isLoading } = useMenuPayload();
  const fetchedMenu =
    payload.menus.find((menu) => menu.slug === slug) ||
    payload.menus.find((menu) => menu.displayName === displayName);
  const menu: MenuCardMenu = {
    slug: fetchedMenu?.slug ?? slug,
    displayName,
    description: undefined,
    showDescription,
    isSeasonal,
    startDate: parseDate(startDate),
    endDate: parseDate(endDate),
    showTime,
    startTime,
    endTime,
    categoryIds: fetchedMenu?.categoryIds ?? [],
  };

  if (!visibility) return null;
  if (isLoading) {
    return <MenuCardSkeleton collapsed={collapsible && startCollapsed} scaled={scaled} />;
  }

  return (
    <MenuCard
      menu={menu}
      descriptionContent={description as ReactNode}
      categories={payload.categories}
      dishes={payload.dishes}
      drinks={payload.drinks}
      collapsible={collapsible}
      startCollapsed={startCollapsed}
      scaled={scaled}
    />
  );
}

export default declareComponent(WebflowMenuCard, {
  name: "Menu / Card",
  options: {
    ssr: false,
  },
  props: {
    visibility: props.Visibility({
      group: "Visibility",
      name: "Visibility",
      defaultValue: true,
    }),
    collapsible: props.Boolean({
      group: "Behavior",
      name: "Collapsible",
      defaultValue: true,
    }),
    startCollapsed: props.Boolean({
      group: "Behavior",
      name: "Start collapsed",
      defaultValue: false,
    }),
    scaled: props.Boolean({
      group: "Style",
      name: "Scaled",
      defaultValue: false,
    }),
    slug: props.String({
      group: "Menu",
      name: "Slug",
      defaultValue: "",
    }),
    displayName: props.String({
      group: "Menu",
      name: "Display name",
      defaultValue: "",
    }),
    description: props.RichText({
      group: "Menu",
      name: "Description",
      defaultValue: "",
    }),
    showDescription: props.Boolean({
      group: "Menu",
      name: "Show description",
      defaultValue: false,
    }),
    startDate: props.String({
      group: "Menu",
      name: "Start date",
      defaultValue: "",
    }),
    endDate: props.String({
      group: "Menu",
      name: "End date",
      defaultValue: "",
    }),
    isSeasonal: props.Boolean({
      group: "Menu",
      name: "Seasonal",
      defaultValue: false,
    }),
    showTime: props.Boolean({
      group: "Menu",
      name: "Show time",
      defaultValue: false,
    }),
    startTime: props.Number({
      group: "Menu",
      name: "Start time",
      decimals: 2,
    }),
    endTime: props.Number({
      group: "Menu",
      name: "End time",
      decimals: 2,
    }),
  },
});
