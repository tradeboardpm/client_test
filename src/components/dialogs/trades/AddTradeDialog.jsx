import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import axios from "axios"
import Cookies from "js-cookie"
import { calculateCharges, EQUITY_TYPES, TRANSACTION_TYPES } from "@/utils/tradeCalculations"
import { cn } from "@/lib/utils"
import TimePicker from "@/components/ui/time-picker"
import ChargesBreakdown from "./charges-breakdown"

export function AddTradeDialog({ open, onOpenChange, onSubmit, brokerage: initialBrokerage, selectedDate }) {
  const [newTrade, setNewTrade] = useState({
    instrumentName: "",
    quantity: null,
    action: TRANSACTION_TYPES.BUY,
    buyingPrice: null,
    sellingPrice: null,
    brokerage: initialBrokerage,
    exchangeRate: 0,
    time: format(selectedDate, "HH:mm"),
    equityType: EQUITY_TYPES.INTRADAY,
  })

  const [error, setError] = useState("")
  const [calculatedExchangeRate, setCalculatedExchangeRate] = useState(0)
  const [exchangeRateEdited, setExchangeRateEdited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [manualExchangeCharge, setManualExchangeCharge] = useState(false)

  useEffect(() => {
    if (
      newTrade.quantity &&
      newTrade.action &&
      newTrade.equityType &&
      (newTrade.buyingPrice || newTrade.sellingPrice)
    ) {
      const price = newTrade.action === TRANSACTION_TYPES.BUY ? newTrade.buyingPrice : newTrade.sellingPrice
      const charges = calculateCharges({
        equityType: newTrade.equityType,
        action: newTrade.action,
        price,
        quantity: newTrade.quantity,
        brokerage: newTrade.brokerage,
      })
      setCalculatedExchangeRate(charges.totalCharges - charges.brokerage)
      // Only update exchangeRate if it hasn't been manually edited and it's not OTHER equity type
      if (!exchangeRateEdited && newTrade.equityType !== EQUITY_TYPES.OTHER) {
        setNewTrade((prev) => ({
          ...prev,
          exchangeRate: charges.totalCharges - charges.brokerage,
        }))
      }
    }
  }, [
    newTrade.buyingPrice,
    newTrade.sellingPrice,
    newTrade.quantity,
    newTrade.action,
    newTrade.equityType,
    newTrade.brokerage,
    exchangeRateEdited,
  ])

  const handleTradeTypeChange = (value) => {
    setNewTrade((prev) => ({
      ...prev,
      action: value,
      buyingPrice: null,
      sellingPrice: null,
    }))
    setError("")
  }

  const validateTrade = () => {
    if (!newTrade.quantity || newTrade.quantity <= 0) {
      setError("Quantity must be greater than zero")
      return false
    }

    if (newTrade.action === TRANSACTION_TYPES.BUY && !newTrade.buyingPrice) {
      setError("Please enter a buying price")
      return false
    }
    if (newTrade.action === TRANSACTION_TYPES.SELL && !newTrade.sellingPrice) {
      setError("Please enter a selling price")
      return false
    }
    setError("")
    return true
  }

  const handleQuantityChange = (e) => {
    const value = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)))
    setError("")
    setNewTrade({
      ...newTrade,
      quantity: value,
    })
  }

  const handleTradeSubmit = async (e) => {
    e.preventDefault()

    if (!validateTrade()) {
      return
    }

    setIsLoading(true)

    try {
      const token = Cookies.get("token")
      const utcDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()))
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/trades`,
        {
          ...newTrade,
          instrumentName: newTrade.instrumentName.toUpperCase(),
          date: utcDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      onSubmit()
      onOpenChange(false)
      resetNewTrade()
    } catch (error) {
      console.error("Error submitting trade:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetNewTrade = () => {
    setNewTrade({
      instrumentName: "",
      quantity: null,
      action: TRANSACTION_TYPES.BUY,
      buyingPrice: null,
      sellingPrice: null,
      brokerage: initialBrokerage,
      exchangeRate: 0,
      time: format(selectedDate, "HH:mm"),
      equityType: EQUITY_TYPES.INTRADAY,
    })
    setError("")
    setExchangeRateEdited(false)
    setManualExchangeCharge(false)
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
    setNewTrade((prev) => ({ ...prev, exchangeRate: calculatedExchangeRate }))
    setExchangeRateEdited(false)
    setManualExchangeCharge(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[50vw] max-h-[90vh] ">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Add Trade</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-2">
              <Label>Instrument Name</Label>
              <Input
                value={newTrade.instrumentName}
                onChange={(e) =>
                  setNewTrade({
                    ...newTrade,
                    instrumentName: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <Label>Quantity</Label>
              <Input type="number" min="1" value={newTrade.quantity ?? ""} onChange={handleQuantityChange} />
              {error && error.includes("Quantity") && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-2">
              <Label>Transaction Type</Label>
              <RadioGroup className="flex space-x-4" value={newTrade.action} onValueChange={handleTradeTypeChange}>
                <div
                  className={cn(
                    "flex items-center space-x-2 border border-border/25 shadow rounded-lg w-36 p-2",
                    newTrade.action === TRANSACTION_TYPES.BUY ? "bg-[#A073F01A]" : "bg-card",
                  )}
                >
                  <RadioGroupItem value={TRANSACTION_TYPES.BUY} id="buy" />
                  <Label htmlFor="buy" className="w-full">
                    Buy
                  </Label>
                </div>
                <div
                  className={cn(
                    "flex items-center space-x-2 border border-border/25 shadow rounded-lg w-36 p-2",
                    newTrade.action === TRANSACTION_TYPES.SELL ? "bg-[#A073F01A]" : "bg-card",
                  )}
                >
                  <RadioGroupItem value={TRANSACTION_TYPES.SELL} id="sell" />
                  <Label htmlFor="sell" className="w-full">
                    Sell
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="col-span-2">
              <Label>{newTrade.action === TRANSACTION_TYPES.BUY ? "Buying" : "Selling"} Price</Label>
              <Input
                type="number"
                value={
                  newTrade.action === TRANSACTION_TYPES.BUY
                    ? (newTrade.buyingPrice ?? "")
                    : (newTrade.sellingPrice ?? "")
                }
                onChange={(e) => {
                  const price = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)))
                  setError("")
                  setNewTrade({
                    ...newTrade,
                    [newTrade.action === TRANSACTION_TYPES.BUY ? "buyingPrice" : "sellingPrice"]: price,
                  })
                }}
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-2">
              <Label>Equity Type</Label>
              <Select
                value={newTrade.equityType}
                onValueChange={(value) => setNewTrade({ ...newTrade, equityType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EQUITY_TYPES.FNO_OPTIONS}>F&O-OPTIONS</SelectItem>
                  <SelectItem value={EQUITY_TYPES.FNO_FUTURES}>F&O-FUTURES</SelectItem>
                  <SelectItem value={EQUITY_TYPES.INTRADAY}>INTRADAY EQUITY</SelectItem>
                  <SelectItem value={EQUITY_TYPES.DELIVERY}>DELIVERY EQUITY</SelectItem>
                  <SelectItem value={EQUITY_TYPES.OTHER}>OTHER</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Time</Label>
              <TimePicker value={newTrade.time} onChange={(time) => setNewTrade({ ...newTrade, time: time })} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-2">
              <Label>Exchange Charges (₹)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={newTrade.exchangeRate.toFixed(2)}
                  onChange={(e) => {
                    const value = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)))
                    setNewTrade({
                      ...newTrade,
                      exchangeRate: value,
                    })
                    setExchangeRateEdited(true)
                    setManualExchangeCharge(true)
                  }}
                />
                {(exchangeRateEdited || newTrade.equityType === EQUITY_TYPES.OTHER) && (
                  <Button
                    onClick={() => {
                      resetExchangeRate()
                      setManualExchangeCharge(false)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <Label>Brokerage (₹)</Label>
              <Input
                type="number"
                value={newTrade.brokerage}
                onChange={(e) =>
                  setNewTrade({
                    ...newTrade,
                    brokerage: Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2))),
                  })
                }
              />
            </div>
          </div>
          <ChargesBreakdown
              trade={{
                ...newTrade,
                manualExchangeCharge: manualExchangeCharge || newTrade.equityType === EQUITY_TYPES.OTHER,
              }}
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleTradeSubmit} className="bg-primary" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Trade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

