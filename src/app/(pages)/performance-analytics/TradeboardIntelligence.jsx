"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { format, subMonths, parseISO } from "date-fns"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const StatCard = ({ title, stats, colorClass }) => (
  <Card className="w-full border border-foreground/15">
    <CardHeader className="p-3">
      <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-3">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { label: "Rules Followed", value: stats.avgRulesFollowed, suffix: "%" },
          { label: "Words Journaled", value: stats.avgWordsJournaled, suffix: "" },
          { label: "Trades Taken", value: stats.avgTradesTaken, suffix: "" },
          { label: "Win Rate", value: stats.winRate, suffix: "%" },
        ].map(({ label, value, suffix }) => (
          <div key={label}>
            <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
            <p className={`text-lg sm:text-xl font-semibold ${colorClass}`}>
              {value.toFixed(label === "Words Journaled" ? 0 : 2)}{suffix}
            </p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

const RuleCard = ({ title, rules, period, isTopFollowedRules = false }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Card
        className={`cursor-pointer rounded-xl p-0 border border-foreground/15 hover:border-primary transition-colors duration-200 ${isDialogOpen ? "border-primary shadow-lg" : ""}`}
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader className="p-2 sm:p-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
            <span
              className={`flex items-center justify-center rounded-full border border-foreground/15 p-1 hover:bg-primary hover:text-background ${isDialogOpen ? "bg-primary text-background" : ""}`}
            >
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{rules[0]?.rule}</p>
          <p className="mt-1 sm:mt-2">
            <span className={`text-lg sm:text-2xl font-semibold ${isTopFollowedRules ? "text-green-400" : rules[0]?.count ? "text-red-400" : "text-green-400"}`}>
              {rules[0]?.count || 0}
            </span>{" "}
            <span className="text-xs text-foreground/35">times this {period}</span>
          </p>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">List of {title}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Detailed breakdown of rules</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {rules.map((ruleItem, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-secondary/30 transition-colors">
                <p className="font-medium text-xs sm:text-sm truncate">{ruleItem.rule}</p>
                <p className={`font-semibold text-xs sm:text-sm ${isTopFollowedRules ? "text-green-500" : ruleItem.count ? "text-red-500" : "text-green-500"}`}>
                  {ruleItem.count} times
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

const formatPeriodDateRange = (period) => {
  const today = new Date()
  switch (period) {
    case "thisWeek":
      const thisWeekStart = new Date(today.setDate(today.getDate() - today.getDay()))
      const thisWeekEnd = new Date(thisWeekStart)
      thisWeekEnd.setDate(thisWeekStart.getDate() + 6)
      return `(${format(thisWeekStart, "MMM dd")} - ${format(thisWeekEnd, "MMM dd")})`
    case "lastWeek":
      const lastWeekStart = new Date(today.setDate(today.getDate() - today.getDay() - 7))
      const lastWeekEnd = new Date(lastWeekStart)
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
      return `(${format(lastWeekStart, "MMM dd")} - ${format(lastWeekEnd, "MMM dd")})`
    case "thisMonth":
      return `(${format(today, "MMMM")})`
    case "lastMonth":
      const lastMonth = subMonths(today, 1)
      return `(${format(lastMonth, "MMMM")})`
    default:
      return ""
  }
}

export default function TradeboardIntelligence() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const getInitialState = () => {
    const cookieFilters = Cookies.get("tradeboardIntelligenceFilters")
    const savedFilters = cookieFilters ? JSON.parse(cookieFilters) : {}
    return {
      period: savedFilters.period || searchParams.get("period") || "thisWeek",
      metricsDateRange: {
        from: savedFilters.metricsFrom ? parseISO(savedFilters.metricsFrom) : null,
        to: savedFilters.metricsTo ? parseISO(savedFilters.metricsTo) : null,
      },
    }
  }

  const initialState = getInitialState()
  const [period, setPeriod] = useState(initialState.period)
  const [metricsDateRange, setMetricsDateRange] = useState(initialState.metricsDateRange)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateURLAndCookies = () => {
    const params = new URLSearchParams(searchParams)
    params.set("period", period)
    if (metricsDateRange.from) params.set("metricsFrom", metricsDateRange.from.toISOString())
    else params.delete("metricsFrom")
    if (metricsDateRange.to) params.set("metricsTo", metricsDateRange.to.toISOString())
    else params.delete("metricsTo")
    
    router.push(`/performance-analytics?${params.toString()}`, { scroll: false })
    Cookies.set("tradeboardIntelligenceFilters", JSON.stringify({
      period,
      metricsFrom: metricsDateRange.from?.toISOString(),
      metricsTo: metricsDateRange.to?.toISOString(),
    }), { expires: 1 / 48 })
  }

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("token")
      if (!token) {
        setError("No authentication token found")
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { from: startDate, to: endDate } = computeDateRange()
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/metrics/date-range`, {
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
          headers: { Authorization: `Bearer ${token}` },
        })
        setMetrics(Object.keys(response.data).length === 0 ? null : response.data)
      } catch (err) {
        setError(err.response?.data?.error || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    updateURLAndCookies()
  }, [period, metricsDateRange])

  const computeDateRange = () => {
    const periodMap = {
      thisWeek: () => {
        const today = new Date()
        const sunday = new Date(today)
        sunday.setDate(today.getDate() - today.getDay())
        const saturday = new Date(sunday)
        saturday.setDate(sunday.getDate() + 6)
        return { from: sunday, to: saturday }
      },
      lastWeek: () => {
        const today = new Date()
        const lastSunday = new Date(today)
        lastSunday.setDate(today.getDate() - today.getDay() - 7)
        const lastSaturday = new Date(lastSunday)
        lastSaturday.setDate(lastSunday.getDate() + 6)
        return { from: lastSunday, to: lastSaturday }
      },
      thisMonth: () => ({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      }),
      lastMonth: () => ({
        from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      }),
      customRange: () => ({
        from: metricsDateRange.from || new Date(),
        to: metricsDateRange.to || new Date(),
      }),
    }
    return periodMap[period]()
  }

  const formatDateRange = (range) => {
    if (!range.from || !range.to) return ""
    return `(${format(range.from, "MMM dd, yyyy")} - ${format(range.to, "MMM dd, yyyy")})`
  }

  return (
    <div className="p-4 sm:p-6 bg-background rounded-t-xl">
      <div className="bg-card shadow-md border border-border p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-lg sm:text-xl font-semibold">
            Tradeboard Intelligence
            {period !== "customRange" && (
              <span className="ml-2 text-muted-foreground font-normal text-xs sm:text-sm">{formatPeriodDateRange(period)}</span>
            )}
            {period === "customRange" && metricsDateRange.from && metricsDateRange.to && (
              <span className="ml-2 text-muted-foreground font-normal text-xs sm:text-sm">{formatDateRange(metricsDateRange)}</span>
            )}
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {["thisWeek", "lastWeek", "thisMonth", "lastMonth", "customRange"].map((option) => (
                  <SelectItem key={option} value={option} className="text-xs sm:text-sm">
                    {option.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {period === "customRange" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-fit h-8 flex items-center justify-between gap-2 text-xs sm:text-sm">
                    {metricsDateRange.from ? (
                      metricsDateRange.to ? `${format(metricsDateRange.from, "LLL dd, y")} - ${format(metricsDateRange.to, "LLL dd, y")}` : format(metricsDateRange.from, "LLL dd, y")
                    ) : (
                      <span>Pick a date range</span>
                    )}
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-foreground/65" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={metricsDateRange.from}
                    selected={metricsDateRange}
                    onSelect={(range) => setMetricsDateRange(range || { from: null, to: null })}
                    numberOfMonths={1}
                    className="sm:numberOfMonths-2"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-xs sm:text-sm" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : metrics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              { title: "Profit Days", key: "profit_days", color: "text-green-500" },
              { title: "Loss Days", key: "loss_days", color: "text-red-500" },
              { title: "Break Even Days", key: "breakEven_days", color: "text-blue-500" },
            ].map(({ title, key, color }) => (
              <StatCard key={key} title={title} stats={metrics[key]} colorClass={color} />
            ))}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <RuleCard title="Most Followed Rules" rules={metrics.topFollowedRules} isTopFollowedRules={true} period={period} />
              <RuleCard title="Most Broken Rules" rules={metrics.topUnfollowedRules} period={period} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 sm:p-8">
            <Image src="/images/no_box.png" alt="No data" width={150} height={150} className="sm:w-[200px] sm:h-[200px]" />
            <p className="mt-4 text-sm sm:text-lg text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  )
}