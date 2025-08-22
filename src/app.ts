import { onReady } from "@xatom/core";
import { root } from "./routes";
import { job, jobs } from "./routes/jobs";
import { zukunftswohnen } from "./routes/zukunftswohnen";
import { forms } from "./routes/forms";

onReady(() => {
  forms();
  root();
  jobs();
  job();
  zukunftswohnen();
  console.log("HELLO");
});
