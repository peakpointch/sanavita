import { onReady } from "@xatom/core";
import { root } from "./routes";
import { job, jobs } from "./routes/jobs";
import { zukunftswohnen } from "./routes/zukunftswohnen";
import { adminActivity, adminMenuplan } from "./routes/admin";
import { forms } from "./routes/forms";

onReady(() => {
  forms();
  root();
  jobs();
  job();
  zukunftswohnen();
  adminMenuplan();
  adminActivity();
});
