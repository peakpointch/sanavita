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
}

export function Clock({
  visibility = true,
  timeFormat = "H:mm",
  dateFormat = "EEEE, MM. MMM",
  initialDate = new Date(),
  delay = 1000,
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
      <div className="grid gap-2">
        <div className="text-tv-display font-extrabold">
          {time}
          <span className="ml-4 text-tv-medium opacity-68">Uhr</span>
        </div>
        <div className="text-tv-regular font-bold">{date}</div>
      </div>
    )
  );
}
