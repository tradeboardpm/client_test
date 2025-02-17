"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { format, parseISO } from "date-fns"
import { ArrowLeft, ChevronLeft, ChevronRight, BarChart, X } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { WeeklyCharts } from "../../../../components/charts/weekly-charts"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const JournalDetailsPage = () => {
  const router = useRouter()
  const params = useParams()
  const [journalDetails, setJournalDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(parseISO(params.date))
  const [journalDates, setJournalDates] = useState([]) // Array of all journal dates
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarExpanded")
      return saved !== null ? JSON.parse(saved) : true
    }
    return true
  })
  const [isMobile, setIsMobile] = useState(false)
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState("calendar")
  const [tradesPerDay, setTradesPerDay] = useState(4)
  const [selectedImage, setSelectedImage] = useState(null)

  // Fetch all journal dates
  useEffect(() => {
    const fetchJournalDates = async () => {
      try {
        const token = Cookies.get("token")
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/metrics/dates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setJournalDates(response.data.dates)
      } catch (error) {
        console.error("Error fetching journal dates:", error)
      }
    }

    fetchJournalDates()
  }, [])

  // Fetch journal details for the current date
  useEffect(() => {
    const fetchJournalDetails = async () => {
      try {
        setIsLoading(true)
        const token = Cookies.get("token")
        const formattedDate = format(currentDate, "yyyy-MM-dd")
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/journals/details?date=${formattedDate}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setJournalDetails(response.data)
      } catch (error) {
        console.error("Error fetching journal details:", error)
        setJournalDetails(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJournalDetails()
  }, [currentDate, params.date])

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded)
  }

  // Navigate to the next or previous journal
  const navigateJournal = (direction) => {
    const currentIndex = journalDates.findIndex((date) => date === format(currentDate, "yyyy-MM-dd"))
    if (currentIndex === -1) return

    const newIndex = currentIndex + direction
    if (newIndex >= 0 && newIndex < journalDates.length) {
      const newDate = parseISO(journalDates[newIndex])
      setCurrentDate(newDate)
      router.push(`/my-journal/${journalDates[newIndex]}`)
    }
  }

  // Check if there is a next or previous journal
  const hasNextJournal = () => {
    const currentIndex = journalDates.findIndex((date) => date === format(currentDate, "yyyy-MM-dd"))
    return currentIndex < journalDates.length - 1
  }

  const hasPreviousJournal = () => {
    const currentIndex = journalDates.findIndex((date) => date === format(currentDate, "yyyy-MM-dd"))
    return currentIndex > 0
  }

  // Render date navigation with next/previous journal buttons
  const renderDateNavigation = () => (
    <nav aria-label="Journal Navigation">
      <button
        onClick={() => router.back()} // Navigate back to the previous page
        className="flex items-center text-foreground/70 hover:text-foreground transition-colors mb-4 rounded-full border size-10 justify-center"
        aria-label="Back to Previous Page"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="flex items-center mb-6 space-x-4 primary_gradient rounded-xl">
        <div className="flex flex-1 bg-accent/20 p-2 rounded-lg items-center justify-center gap-4">
          <button
            onClick={() => navigateJournal(-1)}
            className="p-1 hover:bg-[#ffffff]/50 text-background rounded-full transition-colors"
            aria-label="Previous Journal"
            disabled={!hasPreviousJournal()}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="px-4 py-2 rounded-lg text-xl font-medium text-white bg-[#ffffff]/30">
            {format(currentDate, "EEE, d MMM yyyy")}
          </h2>
          <button
            onClick={() => navigateJournal(1)}
            className="p-1 hover:bg-[#ffffff]/50 text-background rounded-full transition-colors"
            aria-label="Next Journal"
            disabled={!hasNextJournal()}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  )

  const renderLoadingState = () => (
    <div className="flex justify-center items-center h-screen">
      <p>Loading...</p>
    </div>
  )

  const renderNoJournalState = () => (
    <div className="flex flex-col md:flex-row min-h-screen bg-card">
      <main className="flex-1 p-6 bg-background rounded-t-xl">
        {renderDateNavigation()}
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <p>No journal details found.</p>
        </div>
      </main>
      {renderSidebar()}
    </div>
  )

  const renderSidebar = () => {
    if (isMobile) {
      return (
        <Sheet open={isSideSheetOpen} onOpenChange={setIsSideSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              {/* <Menu /> */}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[360px] overflow-auto">
            <div className="mt-4">
              <WeeklyCharts selectedDate={format(currentDate, "yyyy-MM-dd")} tradesPerDay={tradesPerDay} />
            </div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div className="relative flex">
        <div
          className={`relative h-full transition-all duration-300 ease-in-out bg-card ${
            sidebarExpanded ? "w-[20.5rem]" : "w-16"
          }`}
        >
          {sidebarExpanded ? (
            <div className="p-4 space-y-6">
              <WeeklyCharts selectedDate={format(currentDate, "yyyy-MM-dd")} tradesPerDay={tradesPerDay} />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 pt-6 bg-card">
              <Button
                variant="ghost"
                size="icon"
                className="bg-transparent"
                onClick={() => handleSectionClick("charts")}
              >
                <BarChart className="size-5" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className="absolute top-1/2 p-0 -left-5 z-10 h-8 w-8 rounded-full bg-card shadow-md border-none flex items-center justify-center transform -translate-y-1/2 border border-border"
          >
            {!sidebarExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    )
  }

  const renderJournalContent = () => {
    const journalData = journalDetails?.journalDetails || {}

    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-card">
        <main className="flex-1 p-6 bg-background rounded-t-xl">
          {renderDateNavigation()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Journal Card */}
            <Card className="flex-1 w-full h-full flex justify-between flex-col pb-6 shadow-[0px_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_20px_rgba(0,0,0,0.32)]">
              <CardHeader>
                <CardTitle className="text-xl">Journal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 h-full flex flex-col">
                <div className="space-y-2 flex flex-col flex-1">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    readOnly
                    className="resize-none h-full flex-1 bg-[#FAF7FF] dark:bg-[#363637] shadow-[0px_2px_8px_rgba(0,0,0,0.02)]  border-t-0"
                    value={journalData.note || "No notes"}
                  />
                </div>

                <div className="space-y-2 flex flex-col flex-1">
                  <label className="text-sm font-medium">Mistakes</label>
                  <Textarea
                    readOnly
                    className="resize-none h-full flex-1 bg-[#FAF7FF] dark:bg-[#363637] shadow-[0px_2px_8px_rgba(0,0,0,0.02)]  border-t-0"
                    value={journalData.mistake || "No mistakes recorded"}
                  />
                </div>

                <div className="space-y-2 flex flex-col flex-1">
                  <label className="text-sm font-medium">Lessons</label>
                  <Textarea
                    readOnly
                    className="resize-none h-full flex-1 bg-[#FAF7FF] dark:bg-[#363637] shadow-[0px_2px_8px_rgba(0,0,0,0.02)]  border-t-0"
                    value={journalData.lesson || "No lessons learned"}
                  />
                </div>
              </CardContent>
              <CardFooter className="h-fit p-0 px-6">
                {journalData.attachedFiles?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {journalData.attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden w-20 h-9 shadow border cursor-pointer"
                        onClick={() => handleImageClick(file)}
                      >
                        <img
                          src={file || "/placeholder.svg"}
                          alt={`Uploaded file ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Rules Card */}
            <Card className="w-full max-w-4xl h-full mx-auto p-4 flex-1 shadow-[0px_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_20px_rgba(0,0,0,0.32)]">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">Rules</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 mt-3">
                <div className="rounded-lg overflow-hidden border">
                  <div className="sticky top-0 z-10 grid grid-cols-[auto,1fr,auto] gap-4 p-2 px-4 bg-[#F4E4FF] dark:bg-[#49444c] border-b">
                    <div className="flex items-center">
                      <Checkbox
                        checked={false}
                        // Add onCheckedChange handler for follow/unfollow all
                      />
                    </div>
                    <span className="font-medium">My Rules</span>
                    {/* <span className="font-medium text-right">Action</span> */}
                  </div>
                  <div className="max-h-[50vh] min-h-96 overflow-y-auto">
                    <div className="divide-y">
                      {journalData.rules?.map((rule) => (
                        <div
                          key={rule._id}
                          className="grid grid-cols-[auto,1fr,auto] gap-4 px-4 py-2 items-center hover:bg-secondary/50"
                        >
                          <div>
                            <Checkbox
                              checked={rule.isFollowed}
                              // Add onCheckedChange handler
                            />
                          </div>
                          <span className="text-gray-700 text-[0.8rem]">{rule.description}</span>
                        </div>
                      ))}

                      {(!journalData.rules || journalData.rules.length === 0) && (
                        <div className="text-center text-muted-foreground p-4">No rules tracked</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trades Card */}
          {journalData.trades?.length > 0 && (
            <Card className="mt-4 shadow-[0px_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_20px_rgba(0,0,0,0.32)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1 text-xl">
                  <CardTitle>Trades</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden border">
                  <Table className="rounded-b-lg overflow-hidden bg-background">
                    <TableHeader className="bg-[#F4E4FF] dark:bg-[#49444c]">
                      <TableRow className="border-none">
                        <TableHead className="text-nowrap text-[0.8rem] text-center">Time</TableHead>
                        <TableHead className="text-nowrap text-[0.8rem] text-center">Instrument</TableHead>
                        <TableHead className="text-nowrap text-[0.8rem] text-center">Type</TableHead>
                        <TableHead className="text-nowrap text-[0.8rem] text-center">Action</TableHead>
                        <TableHead className="text-nowrap text-[0.8rem] text-center">Quantity</TableHead>
                        <TableHead className="text-nowrap text-[0.8rem] text-center">Buying Price</TableHead>
                        <TableHead className="text-nowrap text-[0.8rem] text-center">Selling Price</TableHead>
                        <TableHead className="text-nowrap text-[0.8rem] text-center">Brokerage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {journalData.trades.map((trade) => (
                        <TableRow key={trade._id}>
                          <TableCell className="text-nowrap text-[0.8rem] text-center">{trade.time}</TableCell>
                          <TableCell
                            className={cn(
                              !trade.buyingPrice || !trade.sellingPrice
                                ? "text-foreground font-semibold  text-center"
                                : trade.buyingPrice < trade.sellingPrice
                                  ? "text-green-500 font-semibold  text-center"
                                  : "text-red-500 font-semibold  text-center",
                            )}
                          >
                            {trade.instrumentName}
                          </TableCell>
                          <TableCell className="text-nowrap text-[0.8rem] text-center">{trade.equityType}</TableCell>
                          <TableCell className="text-nowrap text-[0.8rem] text-center">{trade.action}</TableCell>
                          <TableCell className="text-nowrap text-[0.8rem] text-center">{trade.quantity}</TableCell>
                          <TableCell className="text-nowrap text-[0.8rem] text-center">
                            {trade.buyingPrice ? `₹${trade.buyingPrice.toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell className="text-nowrap text-[0.8rem] text-center">
                            {trade.sellingPrice ? `₹${trade.sellingPrice.toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell className="text-nowrap text-[0.8rem] text-center">
                            {trade.brokerage ? `₹${trade.brokerage.toFixed(2)}` : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex gap-6 items-center justify-between mt-6">
                  <div
                    className={`rounded-lg p-2 flex items-center gap-2 w-fit ${
                      journalDetails.summary?.totalPnL >= 0 ? "bg-green-600/20" : "bg-red-600/20"
                    }`}
                  >
                    <div
                     
                      className={`text-sm font-medium ${
                        journalDetails.summary?.totalPnL >= 0 ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      Today's Profit:
                    </div>
                    <div
                      className={`text-lg font-medium ${
                        journalDetails.summary?.totalPnL >= 0 ? "text-green-900" : "text-red-900"
                      }`}
                    >
                      ₹ {(journalDetails.summary?.totalPnL ?? 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#A073F0]/25 flex items-center gap-2 p-2 w-fit">
                    <div className="text-sm font-medium text-primary">Today's Charges:</div>
                    <div className="text-lg font-medium text-primary">
                      ₹ {(journalDetails.summary?.totalCharges ?? 0).toFixed(2)}
                    </div>
                  </div>

                  <div
                    className={`rounded-lg p-2 flex items-center gap-2 w-fit ${
                      journalDetails.summary?.netPnL >= 0 ? "bg-green-600/20" : "bg-red-600/20"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        journalDetails.summary?.netPnL >= 0 ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      Net Realised P&L:
                    </div>
                    <div
                      className={`text-lg font-medium ${
                        journalDetails.summary?.netPnL >= 0 ? "text-green-900" : "text-red-900"
                      }`}
                    >
                      ₹ {(journalDetails.summary?.netPnL ?? 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
        {renderSidebar()}
      </div>
    )
  }

  if (isLoading) return renderLoadingState()
  if (!journalDetails) return renderNoJournalState()

  return (
    <>
      {renderJournalContent()}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card p-4 rounded-lg max-w-3xl max-h-[90vh] relative">
            <img src={selectedImage || "/placeholder.svg"} alt="Selected file" className="max-w-full h-auto rounded-lg" />
            <button
              onClick={() => setSelectedImage(null)}
              className="bg-popover rounded-full absolute -top-3 -right-3 p-1"
            >
              <X/>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default JournalDetailsPage

