import { MenuList } from "./menu/MenuList";

export interface MenuProps {}

export function Screen({}: MenuProps) {
  return (
    <div className="wf is-scaled scaled-container text-base bg-brand-900 flex flex-col items-center justify-start">
      <MenuList />
      {/* <div className="w-[calc(944*var(--wf-px))]"> */}
      {/*   <MenuList scaled/> */}
      {/* </div> */}
    </div>
  );
}
