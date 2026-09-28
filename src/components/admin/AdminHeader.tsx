import type { LucideIcon } from "lucide-react";

type AdminHeaderProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
};

export function AdminHeader({ title, description, icon: Icon }: AdminHeaderProps) {
  return (
    <header className="flex w-full flex-col gap-1 border-b border-neutral-700/10 p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-700/10 text-neutral-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-700">{title}</h1>
          {description && <p className="text-sm text-neutral-700/60">{description}</p>}
        </div>
      </div>
    </header>
  );
}
