import { useLayoutEffect, useRef, useState, type RefObject } from "react";

type PreviewFrameProps = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  onIframeLoad: () => void;
};

export function PreviewFrame({ iframeRef, onIframeLoad }: PreviewFrameProps) {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [iframeScale, setIframeScale] = useState(1);

  useLayoutEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const updateScale = (availableWidth: number) => {
      const designWidth = Number.parseFloat(
        getComputedStyle(preview).getPropertyValue("--wf-design-width"),
      );

      if (!Number.isFinite(designWidth) || designWidth <= 0 || availableWidth <= 0) return;

      setIframeScale(availableWidth / designWidth);
    };

    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateScale(entry.contentRect.width);
    });

    observer.observe(preview);

    const computedStyle = getComputedStyle(preview);
    const horizontalPadding =
      Number.parseFloat(computedStyle.paddingLeft) + Number.parseFloat(computedStyle.paddingRight);
    updateScale(preview.clientWidth - horizontalPadding);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-3 @3xl:col-span-7">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold tracking-wider text-neutral-700/60 uppercase">
          Anzeige-Vorschau
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-700/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Aktiv
        </span>
      </div>

      <div
        ref={previewRef}
        className="wf is-scaled custom preview relative w-full overflow-hidden rounded-xl border border-neutral-700/20 bg-neutral-700 p-8 shadow-md"
        style={{
          aspectRatio: "var(--wf-design-width) / var(--wf-design-height)",
        }}
      >
        <iframe
          ref={iframeRef}
          title="Screen Preview"
          className="rounded-lg border-none"
          style={{
            width: "calc(var(--wf-design-width) * 1px)",
            height: "calc(var(--wf-design-height) * 1px)",
            transform: `scale(${iframeScale})`,
            transformOrigin: "top left",
          }}
          onLoad={onIframeLoad}
        />
      </div>
    </div>
  );
}
