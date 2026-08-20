"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import React from "react";

export interface ClockProps {
  visibility?: boolean;
  timeFormat?: string;
  dateFormat?: string;
  initialDate?: Date;
  /** The number of milliseconds to wait before re-rendering the component */
  delay?: number;
  scaled?: boolean;
}

export function Clock({
  visibility = true,
  timeFormat = "H:mm",
  dateFormat = "EEEE, d. MMM",
  initialDate = new Date(),
  delay = 1000,
  scaled = true,
}: ClockProps) {
  const [now, setNow] = React.useState<Date>(initialDate);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, delay);

    return () => clearInterval(interval);
  }, [delay]);

  const time = format(now, timeFormat, { locale: de });
  const date = format(now, dateFormat, { locale: de });

  return (
    visibility && (
      <div className={`wf tv grid gap-2 ${scaled ? "is-scaled" : ""}`}>
        <div className="text-7xl font-extrabold">
          {time}
          <span className="ml-4 text-lg opacity-68">Uhr</span>
        </div>
        <div className="text-base font-bold">{date}</div>
      </div>
    )
  );
}
