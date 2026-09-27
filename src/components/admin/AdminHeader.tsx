import type { LucideIcon } from "lucide-react";

type AdminHeaderProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
};

export function AdminHeader({ title, description, icon: Icon }: AdminHeaderProps) {
  return (
    <header className="flex w-full flex-col gap-1 border-b border-brand-800/10 pb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-800/10 text-brand-800">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-800">{title}</h1>
          {description && <p className="text-sm text-brand-800/60">{description}</p>}
        </div>
      </div>
    </header>
  );
}
