import type { RefObject } from "react";

type PreviewFrameProps = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  onIframeLoad: () => void;
};

export function PreviewFrame({ iframeRef, onIframeLoad }: PreviewFrameProps) {
  return (
    <div className="flex flex-col gap-3 @3xl:col-span-7">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold tracking-wider text-brand-800/60 uppercase">
          Anzeige-Vorschau
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-brand-800/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Aktiv
        </span>
      </div>

      <div
        className="wf is-scaled custom preview relative w-full overflow-hidden rounded-xl border border-brand-800/20 bg-brand-800 p-8 shadow-md"
        style={{
          aspectRatio: "var(--wf-design-width) / var(--wf-design-height)",
        }}
      >
        <iframe
          ref={iframeRef}
          title="Screen Preview"
          className="h-full w-full rounded-lg border-none"
          onLoad={onIframeLoad}
        />
      </div>
    </div>
  );
}
