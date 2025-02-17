"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} asChild>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=closed]:pointer-events-none",
        className
      )}
      {...props}
    />
  </DialogPrimitive.Overlay>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DialogPortal forceMount>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} asChild className="bg-[#ffffff]">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
            x: "-50%",
            y: "-50%",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            x: "-50%",
            y: "-50%",
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 20,
            },
          }}
          exit={{
            opacity: 0,
            scale: 0.85,
            transition: {
              duration: 0.2,
            },
          }}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-2xl",
            " bg-card rounded-3xl",
            className
          )}
          {...props}
        >
          {/* Close button positioned outside the dialog */}
          <DialogPrimitive.Close asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -top-3 -right-3 z-50 rounded-full bg-card p-1 shadow-md  transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
            >
              <Cross2Icon className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </motion.button>
          </DialogPrimitive.Close>
          {children}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Enhanced Dialog Wrapper with Framer Motion AnimatePresence
const AnimatedDialog = ({ children, open, onOpenChange, ...props }) => (
  <Dialog open={open} onOpenChange={onOpenChange} {...props}>
    <AnimatePresence>{open && children}</AnimatePresence>
  </Dialog>
);

export {
  AnimatedDialog as Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
