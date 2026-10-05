import type { RefObject } from "react";
import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  Sparkles,
  FastForward,
  SkipForward,
  SkipBack,
  RotateCcw,
  Calendar as CalendarIcon,
} from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { de } from "react-day-picker/locale";
import type { Overlay } from "@/modules/cms";
import type { AdminPreviewMode } from "@/modules/screen/home";
import { cn } from "cn";

export type ScreenSelection = "any" | "lindenpark" | "sonnenweg" | "residenzZurLinde";

type ControlPanelProps = {
  selectedScreen: ScreenSelection;
  availableOverlays: Overlay[];
  selectedOverlayId: string | null;
  portalContainerRef: RefObject<HTMLDivElement | null>;
  onSelectScreen: (screen: ScreenSelection) => void;
  onSelectOverlay: (overlay: Overlay | null) => void;

  previewEnabled: boolean;
  onPreviewEnabledChange: (enabled: boolean) => void;
  previewMode: Exclude<AdminPreviewMode, "live">;
  onPreviewModeChange: (mode: Exclude<AdminPreviewMode, "live">) => void;
  simulationDate: Date;
  onSimulationDateChange: (date: Date) => void;
  sticky?: boolean;
};

export function ControlPanel({
  selectedScreen,
  availableOverlays,
  selectedOverlayId,
  portalContainerRef,
  onSelectScreen,
  onSelectOverlay,
  previewEnabled,
  onPreviewEnabledChange,
  previewMode,
  onPreviewModeChange,
  simulationDate,
  onSimulationDateChange,
  sticky = true,
}: ControlPanelProps) {
  const timeValue = `${String(simulationDate.getHours()).padStart(2, "0")}:${String(simulationDate.getMinutes()).padStart(2, "0")}`;
  const [timeInput, setTimeInput] = useState(timeValue);
  const today = new Date();
  today.setDate(today.getDate() - 7);
  today.setHours(0, 0, 0, 0);
  const futureOverlays = availableOverlays.filter((overlay) => {
    const endDate = new Date(overlay.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today;
  });
  const activePreviewMode: AdminPreviewMode = previewEnabled ? previewMode : "live";

  useEffect(() => {
    setTimeInput(timeValue);
  }, [timeValue]);

  // --- Date & Time Handlers ---
  const handleCalendarSelect = (newDate?: Date) => {
    if (!newDate) return;
    const updated = new Date(simulationDate);
    updated.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    onSimulationDateChange(updated);
  };

  const handleSliderChange = (value: number[]) => {
    const minutes = value[0];
    const newDate = new Date(simulationDate);
    newDate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    onSimulationDateChange(newDate);
  };

  const handlePreviewModeChange = (mode: string) => {
    if (mode === "live") {
      onPreviewEnabledChange(false);
      return;
    }

    if (mode === "overlay" || mode === "time") {
      onPreviewModeChange(mode);
      onPreviewEnabledChange(true);
    }
  };

  const applyPreset = (preset: "plus-1h" | "minus-1h" | "plus-1d" | "minus-1d" | "now") => {
    if (preset === "now") {
      onSimulationDateChange(new Date());
      return;
    }

    const d = new Date(simulationDate);
    if (preset === "plus-1h") d.setTime(d.getTime() + 60 * 60 * 1000);
    if (preset === "minus-1h") d.setTime(d.getTime() - 60 * 60 * 1000);
    if (preset === "plus-1d") d.setDate(d.getDate() + 1);
    if (preset === "minus-1d") d.setDate(d.getDate() - 1);
    onSimulationDateChange(d);
  };

  // Values & Formatting
  const currentMinutes = simulationDate.getHours() * 60 + simulationDate.getMinutes();
  const formattedDate = simulationDate.toLocaleDateString("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const previewHint = (
    <div className="mb-4 flex items-start gap-3 rounded-lg bg-beige-100 p-3.5 text-xs text-neutral-700">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700" />
      <span>
        {!previewEnabled
          ? "Im Live-Modus werden die aktuell geplanten Inhalte angezeigt."
          : previewMode === "overlay"
            ? "Wählen Sie eine Überblendung aus, um sie direkt in der Vorschau anzuzeigen."
            : "Simulieren Sie Datum und Uhrzeit, um geplante Inhalte zu testen."}
      </span>
    </div>
  );

  return (
    <div className={cn("flex h-fit flex-col gap-6 self-start", sticky && "sticky top-8")}>
      <div className="flex items-center gap-2 border-b border-neutral-700/10 pb-4">
        <SlidersHorizontal className="h-4 w-4 text-neutral-700/70" />
        <h2 className="text-lg font-semibold text-neutral-700">Konfiguration</h2>
      </div>

      <div className="flex flex-col gap-6">
        {/* --- Screen Configuration --- */}
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label className="text-xs font-semibold tracking-wider text-neutral-700/60 uppercase">
              Bildschirm
            </label>
            <Select value={selectedScreen} onValueChange={onSelectScreen}>
              <SelectTrigger className="w-full cursor-pointer! border-b-neutral-700/10 bg-white">
                <SelectValue placeholder="Bildschirm wählen..." />
              </SelectTrigger>
              <SelectContent
                portalContainer={portalContainerRef.current}
                className="border-neutral-700/10"
              >
                <SelectItem value="any">Beliebiger Bildschirm</SelectItem>
                <SelectItem value="lindenpark">Lindenpark</SelectItem>
                <SelectItem value="sonnenweg">Sonnenweg</SelectItem>
                <SelectItem value="residenzZurLinde">Residenz zur Linde</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* --- Preview Mode Configuration --- */}
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold tracking-wider text-neutral-700/60 uppercase">
            Anzeigemodus
          </span>

          <Tabs dir="ltr" value={activePreviewMode} onValueChange={handlePreviewModeChange}>
            <TabsList aria-label="Vorschaumodus">
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="overlay">Überblendung</TabsTrigger>
              <TabsTrigger value="time">Zeitreise</TabsTrigger>
            </TabsList>

            <TabsContent value="live">{previewHint}</TabsContent>

            <TabsContent value="overlay" className="animate-in fade-in slide-in-from-top-2">
              {previewHint}
              <div className="grid gap-2">
                <Combobox
                  key={selectedScreen}
                  items={futureOverlays}
                  value={
                    futureOverlays.find((overlay) => overlay.slug === selectedOverlayId) ?? null
                  }
                  autoHighlight
                  itemToStringLabel={(item: Overlay) => item.internalName}
                  itemToStringValue={(item: Overlay) => item.slug}
                  filter={(item: Overlay, query: string) => {
                    const search = query.trim().toLocaleLowerCase("de-CH");
                    if (!search) return true;

                    return [
                      item.internalName,
                      item.slug,
                      item.title,
                      item.startDate?.toLocaleDateString("de-CH"),
                      item.endDate?.toLocaleDateString("de-CH"),
                    ]
                      .filter((value): value is string => Boolean(value))
                      .some((value) => value.toLocaleLowerCase("de-CH").includes(search));
                  }}
                  onValueChange={onSelectOverlay}
                >
                  <ComboboxInput
                    placeholder="Überblendung suchen..."
                    className="border-b-neutral-700/10"
                  />
                  <ComboboxContent
                    portalContainer={portalContainerRef}
                    className="min-w-[320px] border-neutral-700/10 sm:min-w-[400px]"
                  >
                    <ComboboxEmpty>Keine Überblendungen gefunden.</ComboboxEmpty>
                    <ComboboxList>
                      {(overlay: Overlay) => {
                        const formatDate = (date?: Date) =>
                          date ? date.toLocaleDateString("de-CH") : null;

                        const start = formatDate(overlay.startDate);
                        const end = formatDate(overlay.endDate);
                        const dateRange = start && end ? `${start} – ${end}` : start || end || null;

                        return (
                          <ComboboxItem
                            key={overlay.slug}
                            value={overlay}
                            className="flex cursor-pointer! flex-col items-start gap-1 py-2.5"
                          >
                            <div className="flex w-full items-start justify-between gap-3">
                              <span className="leading-snug font-medium text-foreground">
                                {overlay.title}
                              </span>
                              {overlay.type && (
                                <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                  {overlay.type}
                                </span>
                              )}
                            </div>

                            {dateRange && (
                              <span className="text-xs text-muted-foreground">{dateRange}</span>
                            )}
                          </ComboboxItem>
                        );
                      }}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </TabsContent>

            <TabsContent value="time" className="animate-in fade-in slide-in-from-top-2">
              {previewHint}
              <div className="flex flex-col gap-5">
                {/* Interactive Date Picker & Time Scrubber */}
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-2">
                    {/* Shadcn Popover Calendar Date Picker */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 justify-start border-neutral-700/10 bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm"
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-neutral-700/70" />
                          {formattedDate}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto border-neutral-700/10 p-0"
                        align="start"
                        portalContainer={portalContainerRef.current}
                      >
                        <Calendar
                          mode="single"
                          selected={simulationDate}
                          onSelect={handleCalendarSelect}
                          locale={de}
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Inline Editable Time Field */}
                    <div className="flex h-10 items-center gap-1 rounded-md border border-neutral-700/10 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 tabular-nums shadow-sm focus-within:border-neutral-700/20 focus-within:ring-1 focus-within:ring-neutral-700">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-[6ch] min-w-0 flex-1 bg-transparent p-0 text-center outline-hidden"
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                        onBlur={() => {
                          const [hours, minutes] = timeInput.split(":").map(Number);
                          if (
                            Number.isInteger(hours) &&
                            Number.isInteger(minutes) &&
                            hours >= 0 &&
                            hours < 24 &&
                            minutes >= 0 &&
                            minutes < 60
                          ) {
                            const updated = new Date(simulationDate);
                            updated.setHours(hours, minutes, 0, 0);
                            onSimulationDateChange(updated);
                          } else {
                            setTimeInput(timeValue);
                          }
                        }}
                        aria-label="Uhrzeit"
                      />
                      <span className="shrink-0">Uhr</span>
                    </div>
                  </div>

                  {/* Slider */}
                  <Slider
                    min={0}
                    max={1439}
                    step={15}
                    value={[currentMinutes]}
                    onValueChange={handleSliderChange}
                    className="mt-1"
                  />
                  <div className="flex justify-between text-xs font-medium text-neutral-500">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                  </div>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-5 gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-9 w-full min-w-0 gap-1 border-neutral-700/10 bg-white px-1.5 py-2 text-[11px]"
                    onClick={() => applyPreset("minus-1d")}
                  >
                    <FastForward className="h-3 w-3 rotate-180" /> −1 Tag
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-9 w-full min-w-0 gap-1 border-neutral-700/10 bg-white px-1.5 py-2 text-[11px]"
                    onClick={() => applyPreset("minus-1h")}
                  >
                    <SkipBack className="h-3 w-3" /> −1 Std
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-9 w-full min-w-0 gap-1 border-neutral-700/10 bg-white px-1.5 py-2 text-[11px]"
                    onClick={() => applyPreset("now")}
                  >
                    <RotateCcw className="h-3 w-3" /> Heute
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-9 w-full min-w-0 gap-1 border-neutral-700/10 bg-white px-1.5 py-2 text-[11px]"
                    onClick={() => applyPreset("plus-1h")}
                  >
                    <SkipForward className="h-3 w-3" /> +1 Std
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-9 w-full min-w-0 gap-1 border-neutral-700/10 bg-white px-1.5 py-2 text-[11px]"
                    onClick={() => applyPreset("plus-1d")}
                  >
                    <FastForward className="h-3 w-3" /> +1 Tag
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
