import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fetchOwnDocument } from "peakflow";
import { Presentation } from "lucide-react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { getOverlays, Overlay } from "@/modules/cms";
import type {
  AdminPreviewMessage,
  AdminPreviewMode,
  AdminPreviewParams,
} from "@/modules/screen/home";

import { ControlPanel, type ScreenSelection } from "./PreviewControls";
import { PreviewFrame } from "./PreviewFrame";
import { AdminHeader } from "./AdminHeader";

type AdminScreenProps = {
  visibility?: boolean;
};

const PREVIEW_ROUTE = "/screen/home";
const STACKED_LAYOUT_BREAKPOINT = 768;

const overlayScreenFields = {
  lindenpark: "lindenpark",
  sonnenweg: "sonnenweg",
  residenzZurLinde: "residenzZurLinde",
} as const satisfies Record<string, keyof Overlay>;

export function AdminScreen({ visibility = true }: AdminScreenProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  const [doc, setDoc] = useState<Document | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  // Configuration State
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<ScreenSelection>("any");
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [previewMode, setPreviewMode] = useState<Exclude<AdminPreviewMode, "live">>("overlay");
  const [simulationDate, setSimulationDate] = useState<Date>(new Date());
  const [stackedLayout, setStackedLayout] = useState(
    () => typeof window !== "undefined" && window.innerWidth < STACKED_LAYOUT_BREAKPOINT,
  );

  const availableOverlays =
    selectedScreen === "any"
      ? overlays
      : overlays.filter((overlay) => overlay[overlayScreenFields[selectedScreen]]);

  useEffect(() => {
    fetchOwnDocument(`${PREVIEW_ROUTE}?preview=true`).then(setDoc).catch(console.error);
    getOverlays().then(setOverlays).catch(console.error);
  }, []);

  useLayoutEffect(() => {
    const container = portalContainerRef.current;
    if (!container) return;

    const updateLayout = (width: number) => {
      setStackedLayout(width < STACKED_LAYOUT_BREAKPOINT);
    };
    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateLayout(entry.contentRect.width);
    });

    updateLayout(container.clientWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !doc) return;

    doc.documentElement.setAttribute("data-admin-preview", "true");
    doc.documentElement.setAttribute("data-preview-route", PREVIEW_ROUTE);
    // doc.querySelector(".screen-container")?.classList.add("is-scaled");
    doc.querySelector(".w-webflow-badge")?.remove();

    iframe.srcdoc = doc.documentElement.outerHTML;
  }, [doc, stackedLayout]);

  // Unified sync effect: Pushes current state to the iframe automatically
  const syncIframe = () => {
    if (!iframeRef.current?.contentWindow) return;

    const mode: AdminPreviewMode = previewEnabled ? previewMode : "live";
    const params: AdminPreviewParams = {
      mode,
      preview: mode !== "live",
      overlayId: mode === "overlay" ? selectedOverlayId : null,
      screenId: selectedScreen === "any" ? null : selectedScreen,
      date: mode === "time" ? simulationDate.toISOString() : null,
    };

    const message: AdminPreviewMessage = {
      type: "admin.update_preview_params",
      params,
    };

    iframeRef.current.contentWindow.postMessage(message, window.location.origin);
  };

  useEffect(() => {
    syncIframe();
  }, [selectedOverlayId, selectedScreen, previewEnabled, previewMode, simulationDate]);

  const handlePreviewEnabledChange = (enabled: boolean) => {
    setPreviewEnabled(enabled);
  };

  const handlePreviewModeChange = (mode: Exclude<AdminPreviewMode, "live">) => {
    setPreviewMode(mode);
  };

  const handleSelectOverlay = (overlay: Overlay | null) => {
    setSelectedOverlayId(overlay?.slug ?? null);
    if (overlay) setSimulationDate(new Date(overlay.startDate));
  };

  if (!visibility) return null;

  const controls = (
    <ControlPanel
      selectedScreen={selectedScreen}
      availableOverlays={availableOverlays}
      selectedOverlayId={selectedOverlayId}
      portalContainerRef={portalContainerRef}
      onSelectScreen={setSelectedScreen}
      onSelectOverlay={handleSelectOverlay}
      previewEnabled={previewEnabled}
      onPreviewEnabledChange={handlePreviewEnabledChange}
      previewMode={previewMode}
      onPreviewModeChange={handlePreviewModeChange}
      simulationDate={simulationDate}
      onSimulationDateChange={setSimulationDate}
      sticky={!stackedLayout}
    />
  );
  const preview = (
    <PreviewFrame iframeRef={iframeRef} onIframeLoad={syncIframe} compact={stackedLayout} />
  );

  return (
    <main className="wf @container h-dvh w-full overflow-auto bg-white" ref={portalContainerRef}>
      <div className="flex min-h-full w-full flex-col items-start">
        <AdminHeader
          title="Bildschirm-Vorschau"
          description="Verwalten und simulieren Sie die Display-Inhalte für verschiedene Standorte."
          icon={Presentation}
          compact={stackedLayout}
          reserveNavigationSpace={isMobile}
        />

        {stackedLayout ? (
          <div className="flex w-full flex-1 flex-col">
            <section className="w-full p-4 sm:p-8">{controls}</section>
            <section className="w-full border-t border-neutral-700/10 p-4 sm:p-8">
              {preview}
            </section>
          </div>
        ) : (
          <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-0 min-w-0 flex-1 overflow-clip!"
          >
            <ResizablePanel defaultSize="25%" minSize={425} className="overflow-clip! p-8">
              {controls}
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel minSize={300} className="p-8">
              {preview}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </main>
  );
}
