// library/parameterize.ts
function parameterize(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
}
function toDashCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function toDataset(str) {
  return `${str.charAt(0).toUpperCase() + str.slice(1)}`;
}
export {
  parameterize,
  toDashCase,
  toDataset
};
