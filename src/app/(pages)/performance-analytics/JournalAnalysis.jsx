"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import JournalCard from "@/components/cards/JournalCard"
import FilterPopover from "./filter-popover"

const defaultFilters = {
  minWinRate: 0,
  maxWinRate: 100,
  minTrades: 0,
  maxTrades: 50,
  minRulesFollowed: 0,
  maxRulesFollowed: 100,
}

export default function JournalAnalysis() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const popoverRef = useRef(null)

  const formatDateWithoutTimezone = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getInitialState = () => {
    const cookieFilters = Cookies.get("journalAnalysisFilters")
    const savedFilters = cookieFilters ? JSON.parse(cookieFilters) : {}
    const parseDateString = (dateString) => {
      if (!dateString) return null
      const [year, month, day] = dateString.split("-")
      return new Date(year, month - 1, day)
    }
    return {
      journalsDateRange: {
        from: savedFilters.journalsFrom ? parseDateString(savedFilters.journalsFrom) : startOfMonth(new Date()),
        to: savedFilters.journalsTo ? parseDateString(savedFilters.journalsTo) : endOfMonth(new Date()),
      },
      filters: {
        minWinRate: Number(savedFilters.minWinRate) || Number(searchParams.get("minWinRate")) || defaultFilters.minWinRate,
        maxWinRate: Number(savedFilters.maxWinRate) || Number(searchParams.get("maxWinRate")) || defaultFilters.maxWinRate,
        minTrades: Number(savedFilters.minTrades) || Number(searchParams.get("minTrades")) || defaultFilters.minTrades,
        maxTrades: Number(savedFilters.maxTrades) || Number(searchParams.get("maxTrades")) || defaultFilters.maxTrades,
        minRulesFollowed:
          Number(savedFilters.minRulesFollowed) || Number(searchParams.get("minRulesFollowed")) || defaultFilters.minRulesFollowed,
        maxRulesFollowed:
          Number(savedFilters.maxRulesFollowed) || Number(searchParams.get("maxRulesFollowed")) || defaultFilters.maxRulesFollowed,
      },
      pagination: {
        currentPage: Number(savedFilters.page) || Number(searchParams.get("page")) || 1,
        totalPages: 1,
        totalItems: 0,
        limit: 12,
      },
    }
  }

  const initialState = getInitialState()
  const [journalsDateRange, setJournalsDateRange] = useState(initialState.journalsDateRange)
  const [filters, setFilters] = useState(initialState.filters)
  const [pagination, setPagination] = useState(initialState.pagination)
  const [monthlyJournals, setMonthlyJournals] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openPopover, setOpenPopover] = useState(null)

  const updateURLAndCookies = () => {
    const params = new URLSearchParams(searchParams)
    if (journalsDateRange.from) params.set("journalsFrom", formatDateWithoutTimezone(journalsDateRange.from))
    else params.delete("journalsFrom")
    if (journalsDateRange.to) params.set("journalsTo", formatDateWithoutTimezone(journalsDateRange.to))
    else params.delete("journalsTo")
    
    if (filters.minWinRate !== defaultFilters.minWinRate) params.set("minWinRate", filters.minWinRate.toString())
    else params.delete("minWinRate")
    if (filters.maxWinRate !== defaultFilters.maxWinRate) params.set("maxWinRate", filters.maxWinRate.toString())
    else params.delete("maxWinRate")
    if (filters.minTrades !== defaultFilters.minTrades) params.set("minTrades", filters.minTrades.toString())
    else params.delete("minTrades")
    if (filters.maxTrades !== defaultFilters.maxTrades) params.set("maxTrades", filters.maxTrades.toString())
    else params.delete("maxTrades")
    if (filters.minRulesFollowed !== defaultFilters.minRulesFollowed) params.set("minRulesFollowed", filters.minRulesFollowed.toString())
    else params.delete("minRulesFollowed")
    if (filters.maxRulesFollowed !== defaultFilters.maxRulesFollowed) params.set("maxRulesFollowed", filters.maxRulesFollowed.toString())
    else params.delete("maxRulesFollowed")
    if (pagination.currentPage > 1) params.set("page", pagination.currentPage.toString())
    else params.delete("page")

    router.push(`/performance-analytics?${params.toString()}`, { scroll: false })
    Cookies.set("journalAnalysisFilters", JSON.stringify({
      journalsFrom: journalsDateRange.from ? formatDateWithoutTimezone(journalsDateRange.from) : null,
      journalsTo: journalsDateRange.to ? formatDateWithoutTimezone(journalsDateRange.to) : null,
      ...filters,
      page: pagination.currentPage,
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
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/journals/filters`, {
          params: {
            startDate: formatDateWithoutTimezone(journalsDateRange.from || startOfMonth(new Date())),
            endDate: formatDateWithoutTimezone(journalsDateRange.to || endOfMonth(new Date())),
            page: pagination.currentPage,
            limit: pagination.limit,
            ...filters,
          },
          headers: { Authorization: `Bearer ${token}` },
        })
        setMonthlyJournals(Object.keys(response.data.data).length === 0 ? null : response.data.data)
        setPagination((prev) => ({ ...prev, ...response.data.pagination }))
      } catch (err) {
        setError(err.response?.data?.error || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    updateURLAndCookies()
  }, [journalsDateRange, filters, pagination.currentPage])

  const handlePageChange = (page) => setPagination((prev) => ({ ...prev, currentPage: page }))

  const clearAllFilters = () => {
    setFilters(defaultFilters)
    setJournalsDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) })
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    setOpenPopover(null)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) setOpenPopover(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null
    return (
      <div className="mt-4 flex justify-center border-t p-2">
        <Pagination>
          <PaginationContent>
            {pagination.currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious onClick={() => handlePageChange(pagination.currentPage - 1)} className="cursor-pointer text-xs sm:text-sm" />
              </PaginationItem>
            )}
            {pagination.currentPage > 2 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)} className="cursor-pointer text-xs sm:text-sm">1</PaginationLink>
              </PaginationItem>
            )}
            {pagination.currentPage > 3 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
            {Array.from({ length: 3 }, (_, i) => {
              const pageNumber = pagination.currentPage + i - 1
              if (pageNumber > 0 && pageNumber <= pagination.totalPages) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={pageNumber === pagination.currentPage}
                      className="cursor-pointer text-xs sm:text-sm"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              }
              return null
            })}
            {pagination.currentPage < pagination.totalPages - 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
            {pagination.currentPage < pagination.totalPages - 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(pagination.totalPages)} className="cursor-pointer text-xs sm:text-sm">
                  {pagination.totalPages}
                </PaginationLink>
              </PaginationItem>
            )}
            {pagination.currentPage < pagination.totalPages && (
              <PaginationItem>
                <PaginationNext onClick={() => handlePageChange(pagination.currentPage + 1)} className="cursor-pointer text-xs sm:text-sm" />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  const renderDateRangeButton = (dateRange, placeholder) => {
    const isDefaultRange =
      dateRange.from &&
      dateRange.to &&
      format(dateRange.from, "LLL y") === format(startOfMonth(new Date()), "LLL y") &&
      format(dateRange.to, "LLL y") === format(endOfMonth(new Date()), "LLL y")
    return (
      <Button
        variant="outline"
        className={cn(
          "w-full sm:w-fit h-8 flex items-center justify-between gap-2 text-xs sm:text-sm",
          isDefaultRange ? "text-foreground" : "text-purple-600"
        )}
      >
        {dateRange.from && !isDefaultRange ? (
          dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")
        ) : (
          <span>{placeholder}</span>
        )}
        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-foreground/65" />
      </Button>
    )
  }

  const hasActiveFilters = () =>
    filters.minWinRate !== defaultFilters.minWinRate ||
    filters.maxWinRate !== defaultFilters.maxWinRate ||
    filters.minTrades !== defaultFilters.minTrades ||
    filters.maxTrades !== defaultFilters.maxTrades ||
    filters.minRulesFollowed !== defaultFilters.minRulesFollowed ||
    filters.maxRulesFollowed !== defaultFilters.maxRulesFollowed ||
    (journalsDateRange.from && format(journalsDateRange.from, "LLL y") !== format(startOfMonth(new Date()), "LLL y"))

  const handleCardClick = (date) => router.push(`/performance-analytics/${date}`)

  const isWinRateModified = filters.minWinRate !== defaultFilters.minWinRate || filters.maxWinRate !== defaultFilters.maxWinRate
  const isTradesModified = filters.minTrades !== defaultFilters.minTrades || filters.maxTrades !== defaultFilters.maxTrades
  const isRulesFollowedModified =
    filters.minRulesFollowed !== defaultFilters.minRulesFollowed || filters.maxRulesFollowed !== defaultFilters.maxRulesFollowed

  return (
    <div className="p-4 sm:p-6 bg-background rounded-b-xl">
      <div className="bg-card shadow-md border border-border p-4 rounded-xl min-h-[50vh]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            Journal Analysis
            {journalsDateRange.from && journalsDateRange.to && (
              <span className="ml-2 text-muted-foreground font-normal text-xs sm:text-sm">
                ({format(journalsDateRange.from, "MMM dd, yyyy")} - {format(journalsDateRange.to, "MMM dd, yyyy")})
              </span>
            )}
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-wrap gap-2 items-center">
              <p className="font-semibold text-xs sm:text-sm">Filter By:</p>
              <Popover>
                <PopoverTrigger asChild>
                  {renderDateRangeButton(journalsDateRange, "Date Range")}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={journalsDateRange.from}
                    selected={journalsDateRange}
                    onSelect={(range) => setJournalsDateRange(range || { from: null, to: null })}
                    numberOfMonths={1}
                    className="sm:numberOfMonths-2"
                  />
                </PopoverContent>
              </Popover>
              <div ref={popoverRef} className="flex flex-wrap gap-2 sm:gap-4 items-center">
                {[
                  {
                    title: "Win Rate",
                    min: 0,
                    max: 100,
                    valueKey: ["minWinRate", "maxWinRate"],
                    showPercentage: true,
                    isModified: isWinRateModified,
                  },
                  {
                    title: "Trades",
                    min: 0,
                    max: 50,
                    valueKey: ["minTrades", "maxTrades"],
                    showPercentage: false,
                    isModified: isTradesModified,
                  },
                  {
                    title: "Rules Followed",
                    min: 0,
                    max: 100,
                    valueKey: ["minRulesFollowed", "maxRulesFollowed"],
                    showPercentage: true,
                    isModified: isRulesFollowedModified,
                  },
                ].map(({ title, min, max, valueKey, showPercentage, isModified }) => (
                  <FilterPopover
                    key={title}
                    title={title}
                    min={min}
                    max={max}
                    value={[filters[valueKey[0]], filters[valueKey[1]]]}
                    onChange={([min, max]) => setFilters((prev) => ({ ...prev, [valueKey[0]]: min, [valueKey[1]]: max }))}
                    open={openPopover === title.replace(/\s/g, "").toLowerCase()}
                    onOpenChange={(open) => setOpenPopover(open ? title.replace(/\s/g, "").toLowerCase() : null)}
                    showPercentage={showPercentage}
                    isModified={isModified}
                  />
                ))}
                {hasActiveFilters() && (
                  <Button variant="destructive" size="icon" onClick={clearAllFilters} className="h-8 w-8" title="Clear all filters">
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-xs sm:text-sm" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : monthlyJournals ? (
          <div className="mt-4">
            {Object.keys(monthlyJournals).length > 0 ? (
              <div className="flex flex-col min-h-[50vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(monthlyJournals).map(([date, journal]) => (
                    <div key={date} onClick={() => handleCardClick(date)}>
                      <JournalCard
                        date={date}
                        id={date}
                        note={journal.note}
                        mistake={journal.mistake}
                        lesson={journal.lesson}
                        rulesFollowedPercentage={journal.rulesFollowedPercentage}
                        winRate={journal.winRate}
                        profit={journal.profit}
                        tradesTaken={journal.tradesTaken}
                        mainPage="performance-analytics"
                      />
                    </div>
                  ))}
                </div>
                {renderPagination()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 h-64 sm:h-96">
                <Image src="/images/no_box.png" alt="No data" width={150} height={150} className="sm:w-[200px] sm:h-[200px]" />
                <p className="mt-4 text-sm sm:text-lg text-gray-500">No journal entries for this period</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 h-64 sm:h-96">
            <Image src="/images/no_box.png" alt="No data" width={150} height={150} className="sm:w-[200px] sm:h-[200px]" />
            <p className="mt-4 text-sm sm:text-lg text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  )
}