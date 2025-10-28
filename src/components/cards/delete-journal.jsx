import { FC, MouseEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SubscriptionPlan from "./subsciption";


const DeleteJournal = ({ id, onDelete }) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const subscription = Cookies.get("subscription");
    setHasSubscription(subscription === "true");
  }, []);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (!hasSubscription) {
      setShowSubscriptionDialog(true);
    } else {
      setShowDeleteDialog(true);
    }
  };

  const handleDelete = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation();
    }

    if (!hasSubscription) return;

    try {
      setIsDeleting(true);
      const token = Cookies.get("token");

      const { data, status } = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/journals/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Success: API returns { journalDeleted: true }
      if (status === 200 && data.journalDeleted === true) {
        setShowDeleteDialog(false);
        toast({
          title: "Journal Entry Deleted Successfully",
          description: "The journal entry was successfully deleted.",
          variant: "default",
        });

        // Safely call onDelete
        if (typeof onDelete === "function") {
          onDelete(id);
        } else {
          console.warn("onDelete is not a function – was it passed correctly?");
        }
      } else {
        throw new Error(data.message || "Unexpected response from server");
      }
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast({
        title: "Delete Failed",
        description:
          error.response?.data?.error ||
          error.message ||
          "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpgradeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    setShowSubscriptionDialog(false);
    setShowUpgradeDialog(true);
  };

  const handleCloseDialog = () => {
    setShowUpgradeDialog(false);
  };

  const handleCancelDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    setShowDeleteDialog(false);
  };

  const handleCancelSubscription = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    setShowSubscriptionDialog(false);
  };

  const handleBackdropClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Delete Button */}
      <Button
        size="icon"
        variant="destructive"
        onClick={handleDeleteClick}
        className="absolute top-0 left-0 hover:scale-110 rounded-none rounded-tl-lg opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-br-3xl border-t-0 border-l-0 z-10"
        style={{ pointerEvents: "auto" }}
      >
        <Trash2 className="w-4 h-4 text-white" />
      </Button>

      {/* Confirm Delete Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => !open && setShowDeleteDialog(false)}
      >
        <div onClick={handleBackdropClick}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to delete this Journal entry? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelDelete}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>
      </AlertDialog>

      {/* Subscription Required Dialog */}
      <AlertDialog
        open={showSubscriptionDialog}
        onOpenChange={(open) => !open && setShowSubscriptionDialog(false)}
      >
        <div onClick={handleBackdropClick}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Subscription Required</AlertDialogTitle>
              <AlertDialogDescription>
                Deleting journal entries is a premium feature. Please upgrade to a paid subscription to access this functionality.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelSubscription}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUpgradeClick}
                className="bg-primary hover:bg-primary/90"
              >
                Upgrade Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>
      </AlertDialog>

      {/* Upgrade Subscription Modal */}
      <Dialog
        open={showUpgradeDialog}
        onOpenChange={(open) => !open && setShowUpgradeDialog(false)}
      >
        <div onClick={handleBackdropClick}>
          <DialogContent className="sm:max-w-7xl" onClick={(e) => e.stopPropagation()}>
            <SubscriptionPlan onCloseDialog={handleCloseDialog} />
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteJournal;