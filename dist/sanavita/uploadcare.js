(() => {
  // src/sanavita/js/uploadcare.js
  var UUID_FIELD_ID = "uploadcare-uuid";
  var URLCDN_FIELD_ID = "uploadcare-file";
  var ctxProvider = document.querySelector("uc-upload-ctx-provider");
  ctxProvider.addEventListener("change", (event) => {
    const files = event.detail.successEntries;
    console.log("FILES:", files);
    let uuidArray = files.map((file) => {
      return file.uuid;
    });
    let cdnUrlArray = files.map((file) => {
      return file.cdnUrl;
    });
    const uuidField = document.getElementById(UUID_FIELD_ID);
    uuidField.value = uuidArray.join(", ");
    uuidField.dispatchEvent(new Event("change", { bubbles: true }));
    const urlField = document.getElementById(URLCDN_FIELD_ID);
    urlField.value = cdnUrlArray.join(", ");
    urlField.dispatchEvent(new Event("change", { bubbles: true }));
  });
})();
//# sourceMappingURL=uploadcare.js.map
