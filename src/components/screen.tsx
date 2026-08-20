import { MenuList } from "./menu/MenuList";
import { MenuCardSkeleton } from "./menu/MenuCardSkeleton";

export interface MenuProps {}

export function Screen({}: MenuProps) {
  return (
    <div className="wf is-scaled scaled-container flex flex-col items-center justify-start bg-brand-900 text-base">
      {/* <MenuList /> */}
      <div className="w-[calc(944*var(--wf-px))]">
        {/* <MenuCardSkeleton scaled /> */}
        <MenuList scaled seasonal={"Seasonal"} limit={1} />
      </div>
    </div>
  );
}
