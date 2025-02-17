import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ArrowUpRight, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Cookies from "js-cookie"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
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
import { Button } from "@/components/ui/button"

const JournalCard = ({
  id,
  date,
  note,
  mistake,
  lesson,
  rulesFollowedPercentage,
  winRate,
  profit,
  tradesTaken,
  onDelete,
  refreshJournalData,
  showDeleteButton = true,
  mainPage = "my-journal",
}) => {
  const router = useRouter()
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    const subscription = Cookies.get('subscription');
    setHasSubscription(subscription === 'true');
  }, []);

  const getProfitColor = () => {
    if (profit > 100) return "bg-[#5BFBC2]/35 border border-[#5BFBC2]"
    if (profit < -100) return "bg-[#FFE0DE]/50 dark:bg-[#552c29] border border-[#F44C60]"
    return "bg-[#FAC300]/35 border border-[#FAC300]"
  }

  const getProfitBorderColor = () => {
    if (profit > 100) return "border-[#0ED991] transition-all duration-300"
    if (profit < -100) return "border-[#F44C60] transition-all duration-300"
    return "border-[#FAC300] transition-all duration-300"
  }

  const getInnerProfitBorderColor = () => {
    if (profit > 100) return "border-[#0ED991]/50 transition-all duration-300"
    if (profit < -100) return "border-[#F44C60]/50 transition-all duration-300"
    return "border-[#FAC300]/50 transition-all duration-300"
  }

  const getArrowColor = () => {
    if (profit > 100) return "text-[#0ED991] group-hover:text-[#0ED99180]"
    if (profit < -100) return "text-[#F44C60] group-hover:text-[#F44C60]"
    return "text-[#FAC300] group-hover:text-[#FAC300]"
  }

  const formattedDate = format(new Date(date), "EEE, dd MMM")

  const truncateText = (text, maxLength = 50) => {
    if (!text) return " "
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  const handleCardClick = (e) => {
    if (e.target.closest(".delete-button")) return
    router.push(`/${mainPage}/${date}`)
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (!hasSubscription) {
      setShowSubscriptionDialog(true)
    } else {
      setShowDeleteDialog(true)
    }
  }

  const handleDelete = async () => {
    if (!hasSubscription) return;
    
    try {
      setIsDeleting(true)
      const token = Cookies.get("token")
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/journals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setShowDeleteDialog(false)
      toast({
        title: "Journal Entry Deleted",
        description: "The journal entry was successfully deleted.",
        variant: "default",
      })
      onDelete(id)
      await refreshJournalData()
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpgradeClick = () => {
    setShowSubscriptionDialog(false)
    router.push('/plans') // Adjust this route to your pricing page route
  }

  return (
    <>
      <Card
        onClick={handleCardClick}
        className={`overflow-hidden relative rounded-2xl transition-all duration-300 group shadow-[0px_5px_10px_2px_rgba(0,0,0,0.04)] hover:shadow-xl hover:scale-[1.02] max-w-[22.5rem] cursor-pointer border-[1rem] ${getProfitColor()}`}
      >
        {showDeleteButton && (
          <Button
            size="icon"
            variant="destructive"
            onClick={handleDeleteClick}
            className="absolute top-0 left-0 z-10 hover:scale-110 rounded-none rounded-tl-lg opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-br-3xl border-t-0 border-l-0 delete-button"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </Button>
        )}
        <CardHeader className={`pb-2 ${getProfitBorderColor()}`}>
          <CardTitle className="text-base flex justify-between font-semibold">
            <div className="flex items-center gap-2">{formattedDate}</div>
            <span
              className={`border rounded-full p-1 transition-all duration-300 size-8 flex items-center justify-center 
                group-hover:translate-x-5 group-hover:-translate-y-5 group-hover:scale-125 group-hover:rounded-lg
                ${getProfitBorderColor()} 
                ${getArrowColor()}`}
            >
              <ArrowUpRight size={16} />
            </span>
          </CardTitle>
          <hr className={`${getInnerProfitBorderColor()}`} />
        </CardHeader>
        <CardContent className="space-y-6 py-4">
          <div className="flex items-center">
            <span className="font-medium text-sm mr-1">Note:</span>
            <span className="whitespace-nowrap overflow-hidden text-ellipsis text-sm text-foreground/50">
              {truncateText(note)}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-sm mr-1">Mistake:</span>
            <span className="whitespace-nowrap overflow-hidden text-ellipsis text-sm text-foreground/50">
              {truncateText(mistake)}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-sm mr-1">Lesson:</span>
            <span className="whitespace-nowrap overflow-hidden text-ellipsis text-sm text-foreground/50">
              {truncateText(lesson)}
            </span>
          </div>
          <hr className={`${getInnerProfitBorderColor()}`} />
        </CardContent>
        <CardFooter className="flex justify-between items-center p-0">
          <div className="flex justify-between space-x-4 w-full p-2">
            <div className="flex flex-col items-center space-x-1 w-full">
              <p className="text-xs">Rules</p>
              <span className="font-semibold">{Number(rulesFollowedPercentage).toFixed(2)}%</span>
            </div>
            <div className={`flex flex-col items-center space-x-1 w-full border-x ${getInnerProfitBorderColor()}`}>
              <p className="text-xs">Win Rate</p>
              <span className="font-semibold">{Number(winRate).toFixed(2)}%</span>
            </div>
            <div className="flex flex-col items-center space-x-1 w-full">
              <p className="text-xs">Profit</p>
              <span className="font-semibold text-foreground">{Number(profit).toFixed(2)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to delete this Journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subscription Required Dialog */}
      <AlertDialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscription Required</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting journal entries is a premium feature. Please upgrade to a paid subscription to access this functionality.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpgradeClick} className="bg-primary hover:bg-primary/90">
              Upgrade Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default JournalCard