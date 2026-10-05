export const VALUES_WHEEL_ITEM_REGISTER = "values-wheel:item-register";
export const VALUES_WHEEL_ITEM_UNREGISTER = "values-wheel:item-unregister";
export const VALUES_WHEEL_SELECT = "values-wheel:select";

export type ValuesWheelItemRegisterDetail = {
  wheelId: string;
  index: number;
  label: string;
  visible: boolean;
};

export type ValuesWheelItemUnregisterDetail = {
  wheelId: string;
  index: number;
};

export type ValuesWheelSelectDetail = {
  wheelId: string;
  index: number;
};
