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
import { SwitchWithLabels } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
}: ControlPanelProps) {
  const timeValue = `${String(simulationDate.getHours()).padStart(2, "0")}:${String(simulationDate.getMinutes()).padStart(2, "0")}`;
  const [timeInput, setTimeInput] = useState(timeValue);
  const futureOverlays = availableOverlays.filter((overlay) => overlay.endDate >= new Date());

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

  return (
    <div className="sticky top-8 flex h-fit flex-col gap-6 self-start">
      <div className="flex items-center gap-2 border-b border-brand-800/10 pb-4">
        <SlidersHorizontal className="h-4 w-4 text-brand-800/70" />
        <h2 className="text-lg font-semibold text-brand-800">Konfiguration</h2>
      </div>

      <div className="flex flex-col gap-6">
        {/* --- Screen Configuration --- */}
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label className="text-xs font-semibold tracking-wider text-brand-800/60 uppercase">
              Bildschirm
            </label>
            <Select value={selectedScreen} onValueChange={onSelectScreen}>
              <SelectTrigger className="w-full cursor-pointer! bg-white">
                <SelectValue placeholder="Bildschirm wählen..." />
              </SelectTrigger>
              <SelectContent portalContainer={portalContainerRef.current}>
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-brand-800/60 uppercase">
              Vorschau
            </label>
            <SwitchWithLabels
              disabledLabel="Live"
              enabledLabel="Vorschau"
              checked={previewEnabled}
              onCheckedChange={onPreviewEnabledChange}
            />
          </div>

          {previewEnabled && (
            <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-5">
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs font-semibold tracking-wider text-brand-800/60 uppercase">
                  Modus
                </span>
                <SwitchWithLabels
                  disabledLabel="Überblendung"
                  enabledLabel="Zeitreise"
                  checked={previewMode === "time"}
                  onCheckedChange={(checked) => onPreviewModeChange(checked ? "time" : "overlay")}
                />
              </div>

              {previewMode === "overlay" && (
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
                    <ComboboxInput placeholder="Überblendung suchen..." />
                    <ComboboxContent
                      portalContainer={portalContainerRef}
                      className="min-w-[320px] sm:min-w-[400px]"
                    >
                      <ComboboxEmpty>Keine Überblendungen gefunden.</ComboboxEmpty>
                      <ComboboxList>
                        {(overlay: Overlay) => {
                          const formatDate = (date?: Date) =>
                            date ? date.toLocaleDateString("de-CH") : null;

                          const start = formatDate(overlay.startDate);
                          const end = formatDate(overlay.endDate);
                          const dateRange =
                            start && end ? `${start} – ${end}` : start || end || null;

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
              )}

              {previewMode === "time" && (
                <div className="flex flex-col gap-5">
                  {/* Presets */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 bg-white text-xs"
                      onClick={() => applyPreset("minus-1d")}
                    >
                      <FastForward className="mr-1 h-3 w-3 rotate-180" /> −1 Tag
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 bg-white text-xs"
                      onClick={() => applyPreset("minus-1h")}
                    >
                      <SkipBack className="mr-1 h-3 w-3" /> −1 Std
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 bg-white text-xs"
                      onClick={() => applyPreset("now")}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" /> Heute
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 bg-white text-xs"
                      onClick={() => applyPreset("plus-1h")}
                    >
                      <SkipForward className="mr-1 h-3 w-3" /> +1 Std
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 bg-white text-xs"
                      onClick={() => applyPreset("plus-1d")}
                    >
                      <FastForward className="mr-1 h-3 w-3" /> +1 Tag
                    </Button>
                  </div>

                  {/* Interactive Date Picker & Time Scrubber */}
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between gap-2">
                      {/* Shadcn Popover Calendar Date Picker */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 justify-start border-brand-800/10 bg-white text-xs font-medium text-brand-800 shadow-sm"
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-brand-800/70" />
                            {formattedDate}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0"
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
                      <div className="flex h-8 items-center gap-1 rounded-md border border-brand-800/10 bg-white px-2 py-1 text-xs font-semibold text-brand-800 tabular-nums shadow-sm focus-within:border-brand-800/20 focus-within:ring-1 focus-within:ring-brand-800">
                        <input
                          type="text"
                          inputMode="numeric"
                          className="w-[5ch] min-w-0 flex-1 bg-transparent p-0 text-center outline-hidden"
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
                    <div className="flex justify-between px-1 text-[10px] font-medium text-brand-800/40">
                      <span>00:00</span>
                      <span>12:00</span>
                      <span>23:59</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-start gap-3 rounded-lg bg-brand-50 p-3.5 text-xs text-brand-800/80">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-800" />
        <span>
          {!previewEnabled
            ? "Im Live-Modus werden die aktuell geplanten Inhalte angezeigt."
            : previewMode === "overlay"
              ? "Wählen Sie eine Überblendung aus, um sie direkt in der Vorschau anzuzeigen."
              : "Simulieren Sie Datum und Uhrzeit, um geplante Inhalte zu testen."}
        </span>
      </div>
    </div>
  );
}
