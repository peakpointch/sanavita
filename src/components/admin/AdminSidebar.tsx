import {
  CalendarDays,
  ExternalLink,
  FileText,
  Presentation,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
  SidebarFooter,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

import { LogoProfile } from "./Logo";
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
  "data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground";

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
        className={cn(
          activeItemClass,
          "transition-[background-color,color]",
          collapsed && "justify-center px-2",
        )}
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
const DEFAULT_SIDEBAR_WIDTH = 260;
const COLLAPSED_SIDEBAR_WIDTH = 56;
const MAX_SIDEBAR_VIEWPORT_RATIO = 0.4;
const SIDEBAR_STORAGE_KEY = "sanavita-admin-sidebar";

type StoredSidebarPreferences = {
  collapsed?: boolean;
  width?: number;
};

function getStoredSidebarPreferences(): StoredSidebarPreferences | null {
  try {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!stored) return null;

    const preferences: unknown = JSON.parse(stored);
    if (!preferences || typeof preferences !== "object") return null;

    const { collapsed, width } = preferences as StoredSidebarPreferences;
    return {
      collapsed: typeof collapsed === "boolean" ? collapsed : undefined,
      width: typeof width === "number" && Number.isFinite(width) ? width : undefined,
    };
  } catch {
    return null;
  }
}

type SidebarNavigationProps = {
  currentSlug: string | null;
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
};

function SidebarNavigation({
  currentSlug,
  collapsed,
  onToggle,
  mobile = false,
}: SidebarNavigationProps) {
  const toggleLabel = mobile
    ? "Navigation schließen"
    : collapsed
      ? "Sidebar ausklappen"
      : "Sidebar einklappen";

  return (
    <SidebarProvider className="h-full min-h-0 w-full">
      <Sidebar collapsible="none" className="h-full w-full border-0 bg-sidebar">
        <SidebarHeader
          className={cn(
            "relative items-center px-3 py-2.5",
            collapsed ? "justify-center" : "flex-row justify-between",
          )}
        >
          {collapsed ? (
            <div className="group/sidebar-logo relative flex size-8 items-center justify-center">
              <a
                href="/admin"
                aria-label="Sanavita Admin"
                className="flex size-8 items-center justify-center rounded-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogoProfile className="size-8" />
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onToggle}
                aria-label={toggleLabel}
                title={toggleLabel}
                className="pointer-events-none absolute inset-0 z-10 size-8! opacity-0 transition-opacity group-focus-within/sidebar-logo:pointer-events-auto group-focus-within/sidebar-logo:opacity-100 group-hover/sidebar-logo:pointer-events-auto group-hover/sidebar-logo:opacity-100 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <PanelLeftOpen />
              </Button>
            </div>
          ) : (
            <>
              <a
                href="/admin"
                aria-label="Sanavita Admin"
                className="flex items-center gap-2 text-neutral-700"
              >
                <LogoProfile className="size-8" />
                <span className="font-sans text-lg font-semibold tracking-tight">Sanavita</span>
              </a>
              <Button
                type="button"
                variant="ghost"
                size={mobile ? "icon" : "icon-sm"}
                onClick={onToggle}
                aria-label={toggleLabel}
                title={toggleLabel}
                className={cn(
                  "cursor-pointer! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  !mobile && "size-8!",
                )}
              >
                <PanelLeftClose />
              </Button>
            </>
          )}
        </SidebarHeader>

        <SidebarContent className={cn("gap-2 py-3", collapsed ? "px-1" : "px-2")}>
          {sidebarLinks.map((group) => (
            <SidebarGroup key={group.groupName} className={cn("p-1", collapsed && "px-1")}>
              <SidebarGroupLabel
                className={cn("h-7 px-2 text-neutral-700/60", collapsed && "sr-only")}
              >
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

        <SidebarFooter className={cn("gap-1 pb-3", collapsed ? "px-1" : "px-2")}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-neutral-700/70">
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  title={collapsed ? "Website öffnen" : undefined}
                  className="cursor-pointer!"
                >
                  <ExternalLink />
                  <span className={collapsed ? "sr-only" : undefined}>Website öffnen</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}

export function AdminSidebar({ visibility = true }: AdminSidebarProps) {
  const currentSlug = getCurrentSlug();
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [mobilePortalContainer, setMobilePortalContainer] = useState<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? Number.POSITIVE_INFINITY : window.innerWidth,
  );
  const isMobile = useIsMobile();
  const resizeStartRef = useRef<{ pointerX: number; width: number } | null>(null);
  const maximumAvailableWidth = Math.max(
    MIN_SIDEBAR_WIDTH,
    Math.min(MAX_SIDEBAR_WIDTH, Math.floor(viewportWidth * MAX_SIDEBAR_VIEWPORT_RATIO)),
  );
  const effectiveWidth = Math.min(width, maximumAvailableWidth);

  useEffect(() => {
    const preferences = getStoredSidebarPreferences();
    if (preferences?.collapsed !== undefined) setCollapsed(preferences.collapsed);
    if (preferences?.width !== undefined) {
      setWidth(Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, preferences.width)));
    }
    setPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;

    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify({ collapsed, width }));
    } catch {
      // Keep the sidebar usable when browser storage is unavailable.
    }
  }, [collapsed, preferencesLoaded, width]);

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);

    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  const resize = (nextWidth: number) => {
    setWidth(Math.min(maximumAvailableWidth, Math.max(MIN_SIDEBAR_WIDTH, nextWidth)));
  };

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    resizeStartRef.current = { pointerX: event.clientX, width: effectiveWidth };
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

  if (isMobile) {
    return (
      <div ref={setMobilePortalContainer} className="wf">
        {!mobileOpen && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Navigation öffnen"
            title="Navigation öffnen"
            className="wf fixed top-3 left-3 z-40 border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <PanelLeftOpen />
          </Button>
        )}
        {mobilePortalContainer && (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              container={mobilePortalContainer}
              side="left"
              showCloseButton={false}
              className="w-[min(19rem,calc(100vw-1rem))]! border-0! bg-sidebar p-0"
            >
              <SidebarNavigation
                currentSlug={currentSlug}
                collapsed={false}
                mobile
                onToggle={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>
    );
  }

  return (
    <div
      className="wf relative h-dvh shrink-0"
      style={{ width: collapsed ? COLLAPSED_SIDEBAR_WIDTH : effectiveWidth }}
    >
      <SidebarNavigation
        currentSlug={currentSlug}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      {!collapsed && (
        <div
          role="separator"
          aria-label="Sidebar-Breite ändern"
          aria-orientation="vertical"
          aria-valuemin={MIN_SIDEBAR_WIDTH}
          aria-valuemax={maximumAvailableWidth}
          aria-valuenow={effectiveWidth}
          tabIndex={0}
          className="absolute inset-y-0 right-0 z-20 w-6 translate-x-1/2 cursor-ew-resize! touch-none bg-transparent select-none after:pointer-events-none after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-beige-200 hover:after:w-0.5 hover:after:bg-brand-400 focus-visible:after:w-0.5 focus-visible:after:bg-brand-400"
          onPointerDown={startResize}
          onPointerMove={continueResize}
          onPointerUp={stopResize}
          onPointerCancel={stopResize}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              resize(effectiveWidth - 16);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              resize(effectiveWidth + 16);
            }
          }}
        />
      )}
    </div>
  );
}
