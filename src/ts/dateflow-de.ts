import { dateflow } from "@library/dateflow";
import { de } from "date-fns/locale";

document.addEventListener("DOMContentLoaded", () => {
  let container = document.body;

  dateflow(de, container);
});
