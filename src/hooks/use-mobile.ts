import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const getIsMobile = () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(getIsMobile);

  React.useEffect(() => {
    const onChange = () => setIsMobile(getIsMobile());

    window.addEventListener("resize", onChange);
    onChange();

    return () => window.removeEventListener("resize", onChange);
  }, []);

  return isMobile;
}
