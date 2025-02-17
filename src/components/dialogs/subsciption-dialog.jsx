// components/SubscriptionPlanDialog.jsx

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SubscriptionPlan } from "@/components/cards/subsciption"; // Adjust the import path as needed
import { useState } from "react";

export function SubscriptionPlanDialog({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>Upgrade to PRO</DialogTitle>
        </DialogHeader>
        <SubscriptionPlan />
      </DialogContent>
    </Dialog>
  );
}