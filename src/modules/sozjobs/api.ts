import type {
  SozjobsCollectionResponse,
  SozjobsConfig,
  SozjobsEndpointName,
  SozjobsResponse,
} from "@/modules/sozjobs/types";

const sozjobs: SozjobsConfig = {
  apiKey: "JbnUjdeSvrg5YLBX7xvuawBWeamQe4",
  version: "1",
  protocol: "https",
  host: "www.sozjobs.ch",
  endpoints: {
    categories: {
      path: "/api/categories",
      single: false,
    },
    contractTypes: {
      path: "/api/contracttypes",
      single: false,
    },
    jobs: {
      path: "/api/jobs",
      single: false,
    },
    publications: {
      path: "/api/publications",
      single: false,
    },
    publicationsOwn: {
      path: "/api/publicationsown",
      single: false,
    },
  },
};

const requestOptions = {
  method: "GET",
  headers: {
    apikey: sozjobs.apiKey,
    Version: sozjobs.version,
    "Content-Type": "application/json",
  },
};

async function getSozjobsBase<T extends SozjobsEndpointName>(
  endpoint: T,
): Promise<SozjobsCollectionResponse[T]>;

async function getSozjobsBase<T extends SozjobsEndpointName>(
  endpoint: T,
  id: string | number,
): Promise<SozjobsResponse[T]>;

async function getSozjobsBase<T extends SozjobsEndpointName>(
  endpoint: T,
  id?: string | number,
): Promise<SozjobsResponse[T] | SozjobsCollectionResponse[T]> {
  const ep = sozjobs.endpoints[endpoint];

  let url = `${sozjobs.protocol}://${sozjobs.host}${ep.path}`;
  let fetchError = new Error(`Failed to fetch ${endpoint}`);

  if (id !== undefined) {
    url += `/${id}`;
    fetchError.message += ` with id "${id}"`;
  }

  if (ep.single && id !== undefined) {
    throw new Error(
      `TypeError: The endpoint "${endpoint}" is not a collection endpoint. Can't fetch an item on a non-collection endpoint.`,
    );
  }

  const res = await fetch(url, requestOptions);
  if (!res.ok) throw fetchError;

  return res.json();
}

export async function getSozjobsItem<T extends SozjobsEndpointName>(
  endpoint: T,
  id: string | number,
): Promise<SozjobsResponse[T]>;

export async function getSozjobsItem<T extends SozjobsEndpointName>(
  endpoint: T,
  ids: (string | number)[],
): Promise<SozjobsResponse[T][]>;

export async function getSozjobsItem<T extends SozjobsEndpointName>(
  endpoint: T,
  idOrIds: string | number | (string | number)[],
): Promise<SozjobsResponse[T] | SozjobsResponse[T][]> {
  if (Array.isArray(idOrIds)) {
    return Promise.all(
      idOrIds.map((idOrIds) => getSozjobsBase(endpoint, idOrIds)),
    );
  } else {
    return getSozjobsBase(endpoint, idOrIds);
  }
}

export async function getSozjobsCollection<T extends SozjobsEndpointName[]>(
  ...endpoints: T
): Promise<{ [K in T[number]]: SozjobsCollectionResponse[K] }> {
  const response = {} as { [K in T[number]]: SozjobsCollectionResponse[K] };

  for (const endpoint of endpoints) {
    const data = await getSozjobsBase(endpoint); // TS now knows endpoint is a specific key
    response[endpoint] = data;
  }

  return response;
}
