import { useEffect, useRef, useState } from "react";
import { fetchOwnDocument } from "peakflow";
import { Presentation } from "lucide-react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
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

const overlayScreenFields = {
  lindenpark: "lindenpark",
  sonnenweg: "sonnenweg",
  residenzZurLinde: "residenzZurLinde",
} as const satisfies Record<string, keyof Overlay>;

export function AdminScreen({ visibility = true }: AdminScreenProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);

  const [doc, setDoc] = useState<Document | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  // Configuration State
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<ScreenSelection>("any");
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [previewMode, setPreviewMode] = useState<Exclude<AdminPreviewMode, "live">>("overlay");
  const [simulationDate, setSimulationDate] = useState<Date>(new Date());

  const availableOverlays =
    selectedScreen === "any"
      ? overlays
      : overlays.filter((overlay) => overlay[overlayScreenFields[selectedScreen]]);

  useEffect(() => {
    fetchOwnDocument(`${PREVIEW_ROUTE}?preview=true`).then(setDoc).catch(console.error);
    getOverlays().then(setOverlays).catch(console.error);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !doc) return;

    doc.documentElement.setAttribute("data-admin-preview", "true");
    doc.documentElement.setAttribute("data-preview-route", PREVIEW_ROUTE);
    doc.querySelector(".screen-container")?.classList.add("is-scaled");
    doc.querySelector(".w-webflow-badge")?.remove();

    iframe.srcdoc = doc.documentElement.outerHTML;
  }, [doc]);

  // Unified sync effect: Pushes current state to the iframe automatically
  const syncIframe = () => {
    if (!iframeRef.current?.contentWindow) return;

    const mode: AdminPreviewMode = previewEnabled ? previewMode : "live";
    const params: AdminPreviewParams = {
      mode,
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

  return (
    <main className="wf @container h-screen w-full overflow-auto" ref={portalContainerRef}>
      <div className="flex min-h-full w-full flex-col items-start">
        <AdminHeader
          title="Bildschirm-Vorschau"
          description="Verwalten und simulieren Sie die Display-Inhalte für verschiedene Standorte."
          icon={Presentation}
        />

        <ResizablePanelGroup orientation="horizontal" className="min-h-0 min-w-0 flex-1">
          <ResizablePanel defaultSize={40} minSize={25} className="p-8">
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
            />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={60} minSize={35} className="p-8">
            <PreviewFrame iframeRef={iframeRef} onIframeLoad={syncIframe} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}
