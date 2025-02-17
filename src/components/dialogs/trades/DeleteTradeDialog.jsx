import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Cookies from "js-cookie";

export function DeleteTradeDialog({ open, onOpenChange, trade, onDelete }) {
  const handleTradeDelete = async () => {
    if (!trade) return;
    try {
      const token = Cookies.get("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/trades/${trade._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onDelete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting trade:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Trade</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this trade? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleTradeDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
