import "@/styles/components/dev.css";
import { MenuList } from "./menu/MenuList";

export interface MenuProps {}

export function Screen({}: MenuProps) {
  return (
    <div className="dev-scaled screen-bistro scaled-container screen-container-bistro text-base bg-brand-900 flex flex-col items-center justify-start">
      <div className="w-[calc(944*var(--scaled-px))]">
        <MenuList />
      </div>
    </div>
  );
}
