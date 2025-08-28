import type { HTMLFormInput } from "peakflow";

type UCUploadStatus = "uploading" | "success" | "failed" | "idle";
type UCEvent = CustomEvent<UCEventDetail>;

interface UCEventDetail {
  progress: number;
  errors: any[];
  group: string | null;
  totalCount: number;
  failedCount: number;
  successCount: number;
  uploadingCount: number;
  status: UCUploadStatus;
  isSuccess: boolean;
  isUploading: boolean;
  isFailed: boolean;
  allEntries: UCFile[];
  successEntries: UCFile[];
  failedEntries: UCFile[];
  uploadingEntries: UCFile[];
  idleEntries: UCFile[];
}

interface UCFile {
  uuid: string | null;
  internalId: string;
  name: string;
  size: number;
  isImage: boolean;
  mimeType: string;
  file: Record<string, any>; // can be more specific if needed
  externalUrl: string | null;
  cdnUrlModifiers: any; // keep as any or type properly if known
  cdnUrl: string | null;
  fullPath: string | null;
  uploadProgress: number;
  fileInfo: any; // can type this more specifically if needed
  metadata: any; // can type this more specifically if needed
  isSuccess: boolean;
  isUploading: boolean;
  isFailed: boolean;
  isRemoved: boolean;
  errors: any[];
  status: UCUploadStatus;
  source: "local" | "remote";
}

export function initUploadcare(component: HTMLElement): void {
  // This script will handle multiple file uploads through uploadcare and submit them via webflow forms.
  const UUID_FIELD_ID = "uploadcare-uuid"; // ID of your input field for the uuid(s)
  const URLCDN_FIELD_ID = "uploadcare-file"; // ID of your input field for the url(s)

  // Submit files
  const ctxProvider = component.querySelector("uc-upload-ctx-provider");
  ctxProvider.addEventListener("change", (event: UCEvent) => {
    const files = event.detail.successEntries;
    console.log("EVENT:", event);
    console.log("FILES:", files); // Log files to the console

    let uuidArray = files.map((file) => {
      return file.uuid;
    });

    let cdnUrlArray = files.map((file) => {
      return file.cdnUrl;
    });

    const uuidField = component.querySelector<HTMLFormInput>(
      `#${UUID_FIELD_ID}`,
    );
    uuidField.value = uuidArray.join(", ");
    uuidField.dispatchEvent(new Event("change", { bubbles: true }));
    const urlField = component.querySelector<HTMLFormInput>(
      `#${URLCDN_FIELD_ID}`,
    );
    urlField.value = cdnUrlArray.join(", ");
    urlField.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
