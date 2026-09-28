"use client";

import * as React from "react";
import { cn } from "cn";
import { Switch as SwitchPrimitive } from "radix-ui";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative w-[40px] shrink-0 cursor-pointer rounded-none border-[4px] transition-colors outline-none group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[size=sm]:w-[32px] data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=unchecked]:border-input data-[state=unchecked]:bg-input dark:focus-visible:ring-blue-400 dark:aria-invalid:ring-destructive/50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[16px] bg-background ring-0 transition-transform group-data-[size=sm]/switch:size-[12px] data-[state=checked]:translate-x-[16px] group-data-[size=sm]/switch:data-[state=checked]:translate-x-[12px] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
      />
    </SwitchPrimitive.Root>
  );
}

function SwitchWithLabels({
  className,
  checked,
  disabledLabel,
  enabledLabel,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
  enabledLabel: string;
  disabledLabel: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("text-xs font-medium", checked ? "text-neutral-700/60" : "text-neutral-700")}>
        {disabledLabel}
      </span>
      <Switch checked={checked} {...props} />
      <span className={cn("text-xs font-medium", checked ? "text-neutral-700" : "text-neutral-700/60")}>
        {enabledLabel}
      </span>
    </div>
  );
}

export { Switch, SwitchWithLabels };
