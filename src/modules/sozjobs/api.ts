interface SozjobsConfig {
  apiKey: string;
  version: string;
  host: string;
  endpoints: {
    categories: string;
    contractTypes: string;
    jobs: string;
    publications: string;
    publicationsOwn: string;
  };
  response?: SozjobsResponse;
}

type SozjobsEndpointName = keyof SozjobsConfig["endpoints"];

type SozjobsResponse = {
  [K in SozjobsEndpointName]?: any[];
};

const sozjobs: SozjobsConfig = {
  apiKey: "JbnUjdeSvrg5YLBX7xvuawBWeamQe4",
  version: "1",
  host: "www.sozjobs.ch",
  endpoints: {
    categories: "/api/categories",
    contractTypes: "/api/contracttypes",
    jobs: "/api/jobs",
    publications: "/api/publications",
    publicationsOwn: "/api/publicationsown",
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

// Main exported function
export async function getSozjobsData(
  endpoints: Exclude<SozjobsEndpointName, "jobs">[],
): Promise<SozjobsConfig> {
  const response: SozjobsResponse = {};

  // fetch the initial endpoints
  for (const endpoint of endpoints) {
    const url = `https://${sozjobs.host}${sozjobs.endpoints[endpoint]}`;
    const res = await fetch(url, requestOptions);
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    const data = await res.json();
    response[endpoint] = data;
  }

  // fetch job data for each jobidentitynumber
  const jobIdentityNumbers = response.publicationsOwn.map(
    (pub) => pub.jobidentitynumber,
  );

  response.jobs = await Promise.all(
    jobIdentityNumbers.map(async (jobId) => {
      const jobUrl = `https://${sozjobs.host}${sozjobs.endpoints.jobs}/${jobId}`;
      const res = await fetch(jobUrl, requestOptions);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch job data for job identity number "${jobId}"`,
        );
      }
      return res.json();
    }),
  );

  sozjobs.response = response;

  return sozjobs;
}
