export const TABS_REGISTER = "tabs:register";
export const TABS_REQUEST_REGISTRATION = "tabs:request-registration";
export const TABS_UNREGISTER = "tabs:unregister";
export const TABS_SELECT = "tabs:select";

export type TabId = number;

export type TabRegisterDetail<TMetadata = unknown> = {
  groupId: string;
  tabId: TabId;
  metadata: TMetadata;
};

export type TabRegistrationRequestDetail = {
  groupId: string;
};

export type TabUnregisterDetail = {
  groupId: string;
  tabId: TabId;
};

export type TabSelectDetail = {
  groupId: string;
  tabId: TabId;
};
