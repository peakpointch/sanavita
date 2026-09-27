import {
  CalendarDays,
  FileText,
  Monitor,
  Presentation,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { type PointerEvent as ReactPointerEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { Logo, LogoProfile } from "./Logo";
import { cn } from "cn";

type SidebarLink = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  slug: string;
};

type SidebarGroupData = {
  groupName: string;
  links: SidebarLink[];
};

const sidebarLinks: SidebarGroupData[] = [
  {
    groupName: "PDF",
    links: [
      {
        href: "/admin/menuplan",
        icon: FileText,
        label: "Menuplan",
        slug: "menuplan",
      },
      {
        href: "/admin/aktivitaten",
        icon: CalendarDays,
        label: "Aktivitäten",
        slug: "aktivitaten",
      },
    ],
  },
  {
    groupName: "Bildschirm",
    links: [
      {
        href: "/admin/screen",
        icon: Presentation,
        label: "Bildschirm",
        slug: "screen",
      },
    ],
  },
];

const activeItemClass =
  "data-active:bg-brand-800 data-active:text-white data-active:hover:bg-brand-800 data-active:hover:text-white";

function getCurrentSlug(): string | null {
  if (typeof window === "undefined") return null;

  const segments = window.location.pathname.split("/").filter(Boolean);
  const slug = segments[segments.length - 1];
  if (!slug) return null;

  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

type SidebarNavLinkProps = {
  href: string;
  slug: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  currentSlug: string | null;
  collapsed: boolean;
};

function SidebarNavLink({
  href,
  slug,
  label,
  icon: Icon,
  currentSlug,
  collapsed,
}: SidebarNavLinkProps) {
  const isActive = currentSlug === slug;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
      e.preventDefault();
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className={cn(activeItemClass, collapsed && "justify-center px-2")}
      >
        <a
          href={href}
          onClick={handleClick}
          aria-current={isActive ? "page" : undefined}
          title={collapsed ? label : undefined}
          className="cursor-pointer!"
        >
          <Icon />
          <span className={collapsed ? "sr-only" : undefined}>{label}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

type AdminSidebarProps = {
  visibility?: boolean;
};

const MIN_SIDEBAR_WIDTH = 224;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 320;
const COLLAPSED_SIDEBAR_WIDTH = 56;

export function AdminSidebar({ visibility = true }: AdminSidebarProps) {
  const currentSlug = getCurrentSlug();
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const resizeStartRef = useRef<{ pointerX: number; width: number } | null>(null);

  const resize = (nextWidth: number) => {
    setWidth(Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, nextWidth)));
  };

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    resizeStartRef.current = { pointerX: event.clientX, width };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const continueResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = resizeStartRef.current;
    if (!start) return;

    resize(start.width + event.clientX - start.pointerX);
  };

  const stopResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    resizeStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!visibility) return null;

  return (
    <div
      className="wf relative h-screen shrink-0"
      style={{ width: collapsed ? COLLAPSED_SIDEBAR_WIDTH : width }}
    >
      <SidebarProvider className="h-full min-h-0 w-full">
        <Sidebar collapsible="none" className="w-full border-0 bg-brand-50">
          <SidebarHeader
            className={cn(
              "items-center",
              collapsed ? "gap-2 px-1 py-3" : "flex-row justify-between px-8 py-8",
            )}
          >
            <a href="/admin" aria-label="Sanavita Admin" className="cursor-pointer!">
              {collapsed ? (
                true /* NOT HOVER */ ? (
                  <LogoProfile width={"40px"} className="text-brand-800" />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setCollapsed((value) => !value)}
                    aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
                    title={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
                    className="cursor-pointer!"
                  >
                    {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                  </Button>
                )
              ) : (
                <Logo width={"100px"} className="text-brand-800" />
              )}
            </a>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
              title={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
              className="cursor-pointer!"
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </SidebarHeader>

          <SidebarContent className={cn("gap-4 py-6", collapsed ? "px-1" : "px-4")}>
            {sidebarLinks.map((group) => (
              <SidebarGroup key={group.groupName} className={collapsed ? "px-1" : undefined}>
                <SidebarGroupLabel className={cn("text-brand-800/60", collapsed && "sr-only")}>
                  {group.groupName}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.links.map((link) => (
                      <SidebarNavLink
                        key={link.href}
                        href={link.href}
                        slug={link.slug}
                        label={link.label}
                        icon={link.icon}
                        currentSlug={currentSlug}
                        collapsed={collapsed}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>

      {!collapsed && (
        <div
          role="separator"
          aria-label="Sidebar-Breite ändern"
          aria-orientation="vertical"
          tabIndex={0}
          className="absolute inset-y-0 right-0 z-20 w-6 translate-x-1/2 cursor-col-resize! touch-none bg-transparent select-none after:pointer-events-none after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-beige-200 hover:after:w-0.5 hover:after:bg-brand-400 focus-visible:after:w-0.5 focus-visible:after:bg-brand-400"
          onPointerDown={startResize}
          onPointerMove={continueResize}
          onPointerUp={stopResize}
          onPointerCancel={stopResize}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              resize(width - 16);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              resize(width + 16);
            }
          }}
        />
      )}
    </div>
  );
}
