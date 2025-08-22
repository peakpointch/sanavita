import { WFRoute } from "@xatom/core";
import { initCircleTabs } from "./circle-tabs.js";
import { initSozjobsList } from "./sozjobs.js";
import { initJob } from "./sozjobs-job.js";

/**
 * WFRoute "/jobs"
 */
export const jobs = () => {
  new WFRoute("/jobs").execute(() => {
    initCircleTabs();
    initSozjobsList();
  });
};

/**
 * WFRoute "/jobs/job"
 */
export const job = () => {
  new WFRoute("/jobs/job").execute(() => {
    initJob();
  });
};
