(() => {
  // This script will handle multiple file uploads through uploadcare and submit them via webflow forms.
  const UUID_FIELD_ID = 'uploadcare-uuid';  // ID of your input field for the uuid(s)
  const URLCDN_FIELD_ID = 'uploadcare-file';  // ID of your input field for the url(s)

  // Submit files
  const ctxProvider = document.querySelector('uc-upload-ctx-provider')
  ctxProvider.addEventListener('change', event => {
    const files = event.detail.successEntries;
    console.log("FILES:", files);  // Log files to the console

    let uuidArray = files.map(file => {
      return file.uuid;
    });

    let cdnUrlArray = files.map(file => {
      return file.cdnUrl;
    });

    document.getElementById(UUID_FIELD_ID).value = uuidArray.join(', ');
    document.getElementById(URLCDN_FIELD_ID).value = cdnUrlArray.join(', ');
  });
})();