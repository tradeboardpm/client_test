import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { format } from "date-fns"
import axios from "axios"
import Cookies from "js-cookie"
import { calculateCharges, TRANSACTION_TYPES } from "@/utils/tradeCalculations"
import { cn } from "@/lib/utils"

export function CompleteTradeDialog({
  open,
  onOpenChange,
  onSubmit,
  trade,
  brokerage: initialBrokerage,
  selectedDate,
}) {
  const [completeTrade, setCompleteTrade] = useState({
    instrumentName: "",
    quantity: null,
    action: TRANSACTION_TYPES.SELL,
    buyingPrice: null,
    sellingPrice: null,
    brokerage: initialBrokerage,
    exchangeRate: 0,
    time: format(selectedDate, "HH:mm"),
    equityType: "",
  })

  const [error, setError] = useState("")
  const [calculatedExchangeRate, setCalculatedExchangeRate] = useState(0)
  const [exchangeRateEdited, setExchangeRateEdited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (trade) {
      setCompleteTrade({
        instrumentName: trade.instrumentName,
        quantity: trade.quantity,
        action: trade.action === TRANSACTION_TYPES.BUY ? TRANSACTION_TYPES.SELL : TRANSACTION_TYPES.BUY,
        buyingPrice: null,
        sellingPrice: null,
        brokerage: initialBrokerage,
        exchangeRate: 0,
        time: format(selectedDate, "HH:mm"),
        equityType: trade.equityType,
      })
    }
  }, [trade, selectedDate, initialBrokerage])

  useEffect(() => {
    if (
      completeTrade.quantity &&
      completeTrade.action &&
      completeTrade.equityType &&
      (completeTrade.buyingPrice || completeTrade.sellingPrice)
    ) {
      const price =
        completeTrade.action === TRANSACTION_TYPES.BUY ? completeTrade.buyingPrice : completeTrade.sellingPrice
      const charges = calculateCharges({
        equityType: completeTrade.equityType,
        action: completeTrade.action,
        price,
        quantity: completeTrade.quantity,
        brokerage: completeTrade.brokerage,
      })
      setCalculatedExchangeRate(charges.totalCharges - charges.brokerage)
      setCompleteTrade((prev) => ({
        ...prev,
        exchangeRate: charges.totalCharges - charges.brokerage,
      }))
    }
  }, [
    completeTrade.buyingPrice,
    completeTrade.sellingPrice,
    completeTrade.quantity,
    completeTrade.action,
    completeTrade.equityType,
    completeTrade.brokerage,
  ])

  const validateTrade = () => {
    if (!completeTrade.quantity || completeTrade.quantity <= 0) {
      setError("Quantity must be greater than zero")
      return false
    }

    if (completeTrade.action === TRANSACTION_TYPES.BUY && !completeTrade.buyingPrice) {
      setError("Please enter a buying price")
      return false
    }
    if (completeTrade.action === TRANSACTION_TYPES.SELL && !completeTrade.sellingPrice) {
      setError("Please enter a selling price")
      return false
    }
    setError("")
    return true
  }

  const handleTradeSubmit = async (e) => {
    console.log("handleTradeSubmit called")
    e.preventDefault()

    if (!validateTrade()) {
      return
    }

    setIsLoading(true)
    try {
      const token = Cookies.get("token")
      const utcDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()))

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/trades`,
        {
          instrumentName: completeTrade.instrumentName.toUpperCase(),
          quantity: completeTrade.quantity,
          action: completeTrade.action,
          buyingPrice: completeTrade.buyingPrice,
          sellingPrice: completeTrade.sellingPrice,
          brokerage: completeTrade.brokerage,
          exchangeRate: completeTrade.exchangeRate,
          time: completeTrade.time,
          equityType: completeTrade.equityType,
          date: utcDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      console.log("Trade completed successfully:", response.data)
      onSubmit()
      onOpenChange(false)
    } catch (error) {
      console.error("Error completing trade:", error)
      setError("Failed to complete trade. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotalOrder = (trade) => {
    const price = trade.action === TRANSACTION_TYPES.BUY ? trade.buyingPrice : trade.sellingPrice
    const charges = calculateCharges({
      equityType: trade.equityType,
      action: trade.action,
      price,
      quantity: trade.quantity,
      brokerage: trade.brokerage,
    })
    return charges.turnover + charges.totalCharges
  }

  const resetExchangeRate = () => {
    setCompleteTrade((prev) => ({
      ...prev,
      exchangeRate: calculatedExchangeRate,
    }))
    setExchangeRateEdited(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[50vw]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Complete Trade</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-2">
              <Label>Instrument Name</Label>
              <Input value={completeTrade.instrumentName} disabled />
            </div>
            <div className="col-span-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={completeTrade.quantity ?? ""}
                onChange={(e) => {
                  const value = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)))
                  setError("")
                  setCompleteTrade({
                    ...completeTrade,
                    quantity: value,
                  })
                }}
              />
              {error && error.includes("Quantity") && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-2">
              <Label>Transaction Type</Label>
              <RadioGroup className="flex space-x-4" value={completeTrade.action} disabled>
                <div
                  className={cn(
                    "flex items-center space-x-2 border border-border/25 shadow rounded-lg w-36 p-2",
                    completeTrade.action === TRANSACTION_TYPES.BUY ? "bg-[#A073F01A]" : "bg-card",
                  )}
                >
                  <RadioGroupItem value={TRANSACTION_TYPES.BUY} id="complete-buy" disabled />
                  <Label htmlFor="complete-buy" className="w-full">
                    Buy
                  </Label>
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-2 border border-border/25 shadow rounded-lg w-36 p-2",
                    completeTrade.action === TRANSACTION_TYPES.SELL ? "bg-[#A073F01A]" : "bg-card",
                  )}
                >
                  <RadioGroupItem value={TRANSACTION_TYPES.SELL} id="complete-sell" disabled />
                  <Label htmlFor="complete-sell" className="w-full">
                    Sell
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="col-span-2">
              <Label>{completeTrade.action === TRANSACTION_TYPES.BUY ? "Buying" : "Selling"} Price</Label>
              <Input
                type="number"
                value={
                  completeTrade.action === TRANSACTION_TYPES.BUY
                    ? (completeTrade.buyingPrice ?? "")
                    : (completeTrade.sellingPrice ?? "")
                }
                onChange={(e) => {
                  const price = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)))
                  setError("")
                  setCompleteTrade({
                    ...completeTrade,
                    [completeTrade.action === TRANSACTION_TYPES.BUY ? "buyingPrice" : "sellingPrice"]: price,
                  })
                }}
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-2">
              <Label>Equity Type</Label>
              <Input value={completeTrade.equityType} disabled />
            </div>
            <div className="col-span-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={completeTrade.time}
                onChange={(e) => setCompleteTrade({ ...completeTrade, time: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-2">
              <Label>Exchange Charges (₹)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={completeTrade.exchangeRate.toFixed(2)}
                  onChange={(e) => {
                    const value = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)))
                    setCompleteTrade({
                      ...completeTrade,
                      exchangeRate: value,
                    })
                    setExchangeRateEdited(true)
                  }}
                />
                {exchangeRateEdited && (
                  <Button onClick={resetExchangeRate} variant="outline" size="sm">
                    Reset
                  </Button>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <Label>Brokerage (₹)</Label>
              <Input
                type="number"
                value={completeTrade.brokerage}
                onChange={(e) =>
                  setCompleteTrade({
                    ...completeTrade,
                    brokerage: Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2))),
                  })
                }
              />
            </div>
          </div>
          <div className="bg-[#F4E4FF] dark:bg-[#312d33] p-4 rounded-lg">
            <div className="flex justify-start gap-2 items-center">
              <span className="font-medium">Total Order Amount:</span>
              <span className="text-base font-medium text-primary">
                ₹ {calculateTotalOrder(completeTrade).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleTradeSubmit} className="bg-primary" disabled={isLoading}>
            {isLoading ? "Completing..." : "Complete Trade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

