import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import axios from "axios"
import Cookies from "js-cookie"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import SubscriptionPlan from "./subsciption"

const DeleteJournal = ({ id, onDelete }) => {
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    const subscription = Cookies.get('subscription')
    setHasSubscription(subscription === 'true')
  }, [])

  const handleDeleteClick = (e) => {
    // Completely stop event propagation
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()

    if (!hasSubscription) {
      setShowSubscriptionDialog(true)
    } else {
      setShowDeleteDialog(true)
    }
  }

  const handleDelete = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent?.stopImmediatePropagation()
    }

    if (!hasSubscription) return

    try {
      setIsDeleting(true)
      const token = Cookies.get("token")
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/journals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 200 && response.data.journalDeleted === true) {
        setShowDeleteDialog(false)
        toast({
          title: "Journal Entry Deleted Successfully",
          description: "The journal entry was successfully deleted.",
          variant: "default",
        })
        onDelete(id)
      } else {
        throw new Error(response.data.message || "Unexpected response from server")
      }
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpgradeClick = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent?.stopImmediatePropagation()
    }
    setShowSubscriptionDialog(false)
    setShowUpgradeDialog(true)
  }

  const handleCloseDialog = () => {
    setShowUpgradeDialog(false)
  }

  const handleCancelDelete = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent?.stopImmediatePropagation()
    }
    setShowDeleteDialog(false)
  }

  const handleCancelSubscription = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
      e.nativeEvent?.stopImmediatePropagation()
    }
    setShowSubscriptionDialog(false)
  }

  return (
    <>
      <Button
        size="icon"
        variant="destructive"
        onClick={handleDeleteClick}
        className="absolute top-0 left-0 hover:scale-110 rounded-none rounded-tl-lg opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-br-3xl border-t-0 border-l-0 z-10"
        style={{ pointerEvents: 'auto' }}
      >
        <Trash2 className="w-4 h-4 text-white" />
      </Button>

      <AlertDialog 
        open={showDeleteDialog} 
        onOpenChange={(open) => {
          if (!open) setShowDeleteDialog(false)
        }}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to delete this Journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-500 hover:bg-red-600" 
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={showSubscriptionDialog} 
        onOpenChange={(open) => {
          if (!open) setShowSubscriptionDialog(false)
        }}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscription Required</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting journal entries is a premium feature. Please upgrade to a paid subscription to access this functionality.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSubscription}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUpgradeClick} 
              className="bg-primary hover:bg-primary/90"
            >
              Upgrade Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog 
        open={showUpgradeDialog} 
        onOpenChange={(open) => {
          if (!open) setShowUpgradeDialog(false)
        }}
      >
        <DialogContent className="sm:max-w-7xl" onClick={(e) => e.stopPropagation()}>
          <SubscriptionPlan onCloseDialog={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DeleteJournal