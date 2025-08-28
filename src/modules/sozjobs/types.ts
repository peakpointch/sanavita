interface SozjobsEndpointDefinition {
  categories: {
    path: "/api/categories";
    type: SozjobsCategory;
    single: false;
  };
  contractTypes: {
    path: "/api/contracttypes";
    type: SozjobsContractType;
    single: false;
  };
  jobs: {
    path: "/api/jobs";
    type: SozjobsJob;
    single: false;
  };
  publications: {
    path: "/api/publications";
    type: any;
    single: false;
  };
  publicationsOwn: {
    path: "/api/publicationsown";
    type: SozjobsPublicationOwn;
    single: false;
  };
}

// interface SozjobsEndpointDefinitionType {
//   [x: string]: {
//     path: string;
//     type: any;
//     single: boolean;
//   };
// }

type SozjobsGender = "male" | "female" | "" | string;
type SozjobsProtocol = "https" | "http";
type SozjobsContractTypeKey =
  | string
  | "temporary"
  | "permanent"
  | "voluntary"
  | "mandate";
export type SozjobsEndpointName = keyof SozjobsEndpointDefinition;

interface SozjobsEndpoint<
  P extends string = string,
  T extends boolean = boolean,
> {
  path: P;
  single: T;
}

export type SozjobsResponse = {
  [K in keyof SozjobsEndpointDefinition]?: SozjobsEndpointDefinition[K]["type"];
};

export type SozjobsCollectionResponse = {
  [K in keyof SozjobsEndpointDefinition]?: SozjobsEndpointDefinition[K]["single"] extends true
    ? SozjobsEndpointDefinition[K]["type"]
    : SozjobsEndpointDefinition[K]["type"][];
};

export interface SozjobsConfig {
  apiKey: string;
  version: string;
  protocol: SozjobsProtocol;
  host: string;
  endpoints: {
    [K in keyof SozjobsEndpointDefinition]?: SozjobsEndpoint<
      SozjobsEndpointDefinition[K]["path"],
      SozjobsEndpointDefinition[K]["single"]
    >;
  };
}

export type SozjobsContractType = {
  key: SozjobsContractTypeKey;
  value: string;
};

export interface SozjobsCategory {
  id: number;
  name: string;
  description: string;
  groupname: string;
}

export interface SozjobsPublicationOwn {
  jobidentitynumber: string;
}

export interface SozjobsApplication {
  url: string;
  email: string;
  emailfrequency: string;
  byemail: string;
  allow: boolean;
}

export interface SozjobsContact {
  lead: string;
  companyname: string;
  addition: string;
  gender: SozjobsGender;
  title: string;
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  haspobox: boolean;
  poboxnumber: string;
  postcode: string;
  city: string;
  canton: string;
  country: string;
  email: string;
  showcontact?: boolean;
  showemail?: boolean;
  url: string;
  phonebusiness: string;
  phonedirect: string;
  remark?: string;
}

export interface SozjobsQuickContact {
  callback: string;
  email: string;
  whatsapp: string;
}

export interface SozjobsLogo {
  alignment: string;
  url: string;
}

export interface SozjobsInvoiceContact {
  identitynumber: string;
  clientidentitynumber: string;
  companyname: string;
  addition: string;
  gender: SozjobsGender;
  title: string;
  firstname: string;
  lastname: string;
  address1: string;
  address2: string;
  haspobox: boolean;
  poboxnumber: string;
  postcode: string;
  city: string;
  canton: string;
  country: string;
  email: string;
  phonebusiness: string;
  phonedirect: string;
}

export interface SozjobsCategory {
  id: number;
  name: string;
  description: string;
  groupname: string;
}

export interface SozjobsBenefitBundle {
  identitynumber: string;
  label: string;
  clientidentitynumber: string;
}

export interface SozjobsJob {
  id: string;
  abstract: string;
  accessionper: string;
  application: SozjobsApplication;
  contact: SozjobsContact;
  canton: string;
  city: string;
  quickcontact: SozjobsQuickContact;
  contracttype: SozjobsContractTypeKey;
  country: string;
  customreference: string;
  detail: string;
  employmenttype: string;
  externallink: string;
  externalid: string;
  findinallcantons: boolean;
  jobhtml: string;
  identitynumber: string;
  isarchived: boolean;
  isparttime: boolean;
  logo: SozjobsLogo;
  parttimefrom: number;
  parttimeto: number;
  postcode: string;
  requirement: string;
  street: string;
  streetnumber: string;
  subtitle: string;
  title: string;
  istrashed: boolean;
  invoicecontact: SozjobsInvoiceContact;
  headerimage: string;
  footerimage: string;
  categories: SozjobsCategory[];
  categorynumbers: number[];
  categoriesown: any[];
  url: string;
  profileidentitynumber: string;
  profile: Record<string, any>;
  benefitbundleidentitynumber: string;
  benefitbundle: SozjobsBenefitBundle;
  publications: any[];
}
