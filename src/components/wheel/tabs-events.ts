export const TABS_REGISTER = "tabs:register";
export const TABS_UNREGISTER = "tabs:unregister";
export const TABS_SELECT = "tabs:select";

export type TabRegisterDetail<TMetadata = unknown> = {
  groupId: string;
  index: number;
  metadata?: TMetadata;
};

export type TabUnregisterDetail = {
  groupId: string;
  index: number;
};

export type TabSelectDetail = {
  groupId: string;
  index: number;
};
