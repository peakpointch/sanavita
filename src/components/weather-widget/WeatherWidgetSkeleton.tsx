import { cn } from "@/lib/utils";

export interface WeatherWidgetSkeletonProps {
  days?: number;
  scaled?: boolean;
  showMinMaxTemp?: boolean;
  variant?: "horizontal" | "vertical";
}

function SkeletonBlock({ className }: { className: string }) {
  return <span aria-hidden="true" className={cn("weather-skeleton-scan block", className)} />;
}

export function WeatherWidgetSkeleton({
  days = 4,
  scaled = true,
  showMinMaxTemp = false,
  variant = "horizontal",
}: WeatherWidgetSkeletonProps) {
  const forecastDays = Array.from({ length: days }, (_, index) => index);

  return (
    <div
      role="status"
      aria-label="Wetter wird geladen"
      className={cn("wf tv grid gap-16", scaled && "is-scaled")}
    >
      <div className="flex items-center gap-16">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="size-[calc(6*var(--wf-rem))] shrink-0 rounded-full" />
          <div className="grid gap-2">
            <SkeletonBlock className="h-[calc(3.5*var(--wf-rem))] w-[calc(6*var(--wf-rem))]" />
            <SkeletonBlock className="h-[calc(1.25*var(--wf-rem))] w-[calc(4*var(--wf-rem))]" />
          </div>
        </div>

        <div className="grid gap-4">
          {["temperature", "wind", "humidity"].map((detail) => (
            <div key={detail} className="flex items-center gap-4">
              <SkeletonBlock className="size-[calc(3.25*var(--wf-rem))] shrink-0 rounded-full" />
              <SkeletonBlock className="h-[calc(1*var(--wf-rem))] w-[calc(11*var(--wf-rem))]" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-0 w-full border-t border-white" />

      <div className="grid gap-8">
        <SkeletonBlock className="h-[calc(1.25*var(--wf-rem))] w-[calc(9*var(--wf-rem))]" />
        <div className={cn(variant === "horizontal" ? "flex gap-24" : "flex flex-col gap-16")}>
          {forecastDays.map((day) => (
            <div key={day} className="flex flex-col items-center gap-8">
              <SkeletonBlock className="h-[calc(1*var(--wf-rem))] w-[calc(4.5*var(--wf-rem))]" />
              <SkeletonBlock className="size-[calc(3.25*var(--wf-rem))] rounded-full" />
              <SkeletonBlock className="h-[calc(1*var(--wf-rem))] w-[calc(2.75*var(--wf-rem))]" />
              {showMinMaxTemp && (
                <SkeletonBlock className="h-[calc(1*var(--wf-rem))] w-[calc(2.75*var(--wf-rem))]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
