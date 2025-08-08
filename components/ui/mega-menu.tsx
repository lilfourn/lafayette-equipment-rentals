"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MegaMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MegaMenu({
  trigger,
  children,
  className,
  align = "start",
  open: controlledOpen,
  onOpenChange,
}: MegaMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? onOpenChange! : setUncontrolledOpen;

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {trigger}
      </div>
      
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            
            {/* Dropdown content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute z-50 mt-2",
                align === "start" && "left-0",
                align === "center" && "left-1/2 -translate-x-1/2",
                align === "end" && "right-0",
                className
              )}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                <div className="relative bg-gradient-to-b from-gray-50/50 to-white">
                  {children}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MegaMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function MegaMenuTrigger({ children, className }: MegaMenuTriggerProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-turquoise-600",
        className
      )}
    >
      {children}
    </button>
  );
}

interface MegaMenuContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MegaMenuContent({ children, className }: MegaMenuContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}