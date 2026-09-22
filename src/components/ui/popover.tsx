"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

function PopoverContent({ className, align = "center", sideOffset = 8, ...props }: PopoverPrimitive.Popup.Props & Pick<PopoverPrimitive.Positioner.Props, "align" | "sideOffset">) {
  return <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner align={align} sideOffset={sideOffset} className="z-50 outline-none">
      <PopoverPrimitive.Popup data-slot="popover-content" className={cn("w-72 max-w-[calc(100vw-2rem)] rounded-2xl border bg-popover p-4 text-popover-foreground shadow-md outline-none", className)} {...props} />
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>;
}
const PopoverTitle = PopoverPrimitive.Title;
export { Popover, PopoverTrigger, PopoverContent, PopoverTitle };
