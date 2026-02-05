"use client";

import * as React from "react";
import { useMediaQuery } from "../../lib/hooks/use-media-query";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "./dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "./drawer";
import { cn } from "../../lib/utils";

interface ResponsiveDialogProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ResponsiveDialog({
  children,
  trigger,
  title,
  description,
  footer,
  className,
  contentClassName,
  open,
  onOpenChange,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger as any}</DialogTrigger>}
        <DialogContent className={cn("sm:max-w-[425px]", contentClassName)}>
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title as any}</DialogTitle>}
              {description && (
                <DialogDescription>{description as any}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {children as any}
          {footer && <DialogFooter>{footer as any}</DialogFooter>}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger as any}</DrawerTrigger>}
      <DrawerContent className={className}>
        {(title || description) && (
          <DrawerHeader className="text-left">
            {title && <DrawerTitle>{title as any}</DrawerTitle>}
            {description && (
              <DrawerDescription>{description as any}</DrawerDescription>
            )}
          </DrawerHeader>
        )}
        <div className={cn("px-4 pb-20", contentClassName)}>{children}</div>
        {footer && (
          <DrawerFooter className="flex flex-row justify-end gap-2 pt-2 pb-safe sticky bottom-0 bg-white border-t">
            {footer as any}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export { DialogClose, DrawerClose };