import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import Cookies from "js-cookie";
import {
  calculateCharges,
  EQUITY_TYPES,
  TRANSACTION_TYPES,
} from "@/utils/tradeCalculations";
import { cn } from "@/lib/utils";
import TimePicker from "@/components/ui/time-picker";

export function CompleteTradeDialog({
  open,
  onOpenChange,
  onSubmit,
  trade,
  brokerage: initialBrokerage,
  selectedDate,
}) {
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const [completeTrade, setCompleteTrade] = useState({
    instrumentName: "",
    quantity: null,
    action: TRANSACTION_TYPES.SELL,
    buyingPrice: null,
    sellingPrice: null,
    brokerage: initialBrokerage,
    exchangeRate: 0,
    time: getCurrentTime(),
    equityType: "",
  });

  const [error, setError] = useState("");
  const [calculatedExchangeRate, setCalculatedExchangeRate] = useState(0);
  const [exchangeRateEdited, setExchangeRateEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [manualExchangeCharge, setManualExchangeCharge] = useState(false);
  const [capital, setCapital] = useState(null);
  const [showCapitalAlert, setShowCapitalAlert] = useState(false);

  // Fetch capital when component mounts
  useEffect(() => {
    const fetchCapital = async () => {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/settings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCapital(response.data.capital || 0);
      } catch (error) {
        console.error("Error fetching capital:", error);
        setCapital(0);
      }
    };
    fetchCapital();
  }, []);

  // Initialize trade data when trade prop changes
  useEffect(() => {
    if (trade) {
      setCompleteTrade({
        instrumentName: trade.instrumentName,
        quantity: trade.quantity,
        action: trade.action === TRANSACTION_TYPES.BUY ? TRANSACTION_TYPES.SELL : TRANSACTION_TYPES.BUY,
        buyingPrice: null,
        sellingPrice: null,
        brokerage: initialBrokerage,
        exchangeRate: trade.equityType === EQUITY_TYPES.OTHER ? 0 : 0,
        time: getCurrentTime(),
        equityType: trade.equityType,
      });
      if (trade.equityType === EQUITY_TYPES.OTHER) {
        setManualExchangeCharge(true);
        setCalculatedExchangeRate(0);
      }
    }
  }, [trade, initialBrokerage]);

  // Reset time to current time when dialog opens
  useEffect(() => {
    if (open) {
      setCompleteTrade((prev) => ({
        ...prev,
        time: getCurrentTime(),
      }));
    }
  }, [open]);

  // Memoize charges calculation
  const charges = useMemo(() => {
    if (
      completeTrade.quantity &&
      completeTrade.action &&
      completeTrade.equityType &&
      (completeTrade.buyingPrice || completeTrade.sellingPrice)
    ) {
      const price =
        completeTrade.action === TRANSACTION_TYPES.BUY
          ? completeTrade.buyingPrice
          : completeTrade.sellingPrice;
      return calculateCharges({
        equityType: completeTrade.equityType,
        action: completeTrade.action,
        price,
        quantity: completeTrade.quantity,
        brokerage: completeTrade.brokerage,
      });
    }
    return null;
  }, [
    completeTrade.buyingPrice,
    completeTrade.sellingPrice,
    completeTrade.quantity,
    completeTrade.action,
    completeTrade.equityType,
    completeTrade.brokerage,
  ]);

  // Update exchange rate based on calculated charges or set to 0 for OTHER
  useEffect(() => {
    if (completeTrade.equityType === EQUITY_TYPES.OTHER) {
      if (!exchangeRateEdited) {
        setCompleteTrade((prev) => ({
          ...prev,
          exchangeRate: 0,
        }));
        setCalculatedExchangeRate(0);
      }
    } else if (charges) {
      const newExchangeRate = charges.totalCharges - charges.brokerage;
      setCalculatedExchangeRate(newExchangeRate);
      if (!exchangeRateEdited) {
        setCompleteTrade((prev) => ({
          ...prev,
          exchangeRate: Number(newExchangeRate.toFixed(2)),
        }));
      }
    }
  }, [charges, exchangeRateEdited, completeTrade.equityType]);

  const validateTrade = () => {
    if (!completeTrade.quantity || completeTrade.quantity <= 0) {
      setError("Quantity must be greater than zero");
      return false;
    }

    if (completeTrade.action === TRANSACTION_TYPES.BUY && !completeTrade.buyingPrice) {
      setError("Please enter a buying price");
      return false;
    }
    if (completeTrade.action === TRANSACTION_TYPES.SELL && !completeTrade.sellingPrice) {
      setError("Please enter a selling price");
      return false;
    }
    setError("");
    return true;
  };

  const calculateTotalOrder = (trade) => {
    const price =
      trade.action === TRANSACTION_TYPES.BUY
        ? trade.buyingPrice
        : trade.sellingPrice;
    const charges = calculateCharges({
      equityType: trade.equityType,
      action: trade.action,
      price,
      quantity: trade.quantity,
      brokerage: trade.brokerage,
    });
    return charges.turnover + charges.totalCharges;
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();

    if (!validateTrade()) {
      return;
    }

    // Check if total order amount exceeds capital
    const totalOrderAmount = calculateTotalOrder(completeTrade);
    if (capital !== null && totalOrderAmount > capital) {
      setShowCapitalAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const utcDate = new Date(
        Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      );

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
        }
      );

      onSubmit();
      onOpenChange(false);
    } catch (error) {
      console.error("Error completing trade:", error);
      setError("Failed to complete trade. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetExchangeRate = () => {
    const resetValue = completeTrade.equityType === EQUITY_TYPES.OTHER ? 0 : Number(calculatedExchangeRate.toFixed(2));
    setCompleteTrade((prev) => ({
      ...prev,
      exchangeRate: resetValue,
    }));
    setExchangeRateEdited(false);
    setManualExchangeCharge(false);
  };

  return (
    <>
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
                    const value = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)));
                    setError("");
                    setCompleteTrade({
                      ...completeTrade,
                      quantity: value,
                    });
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
                      "flex items-center space-x-2 border border arrivals-border/25 shadow rounded-lg w-36 p-2",
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
                    const price = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)));
                    setError("");
                    setCompleteTrade({
                      ...completeTrade,
                      [completeTrade.action === TRANSACTION_TYPES.BUY ? "buyingPrice" : "sellingPrice"]: price,
                    });
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
                <TimePicker
                  value={completeTrade.time}
                  onChange={(time) => setCompleteTrade({ ...completeTrade, time: time })}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-2">
                <Label>Exchange Charges (₹)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={Number(completeTrade.exchangeRate.toFixed(2))}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (value.includes('.')) {
                        value = Number.parseFloat(value).toFixed(2);
                      }
                      value = Math.max(0, Number(value));
                      setCompleteTrade({
                        ...completeTrade,
                        exchangeRate: value,
                      });
                      setExchangeRateEdited(true);
                      setManualExchangeCharge(true);
                    }}
                  />
                  {(exchangeRateEdited || completeTrade.equityType === EQUITY_TYPES.OTHER) && (
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
            <Button
              onClick={handleTradeSubmit}
              className="bg-primary"
              disabled={isLoading || capital === null}
            >
              {isLoading ? "Completing..." : "Complete Trade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Capital Insufficient Alert Dialog */}
      <Dialog open={showCapitalAlert} onOpenChange={setShowCapitalAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insufficient Capital</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Available capital is less than the total order amount. Please increase
            capital value in My Account {">"} Dashboard Settings.
          </p>
          <DialogFooter>
            <Button
              onClick={() => setShowCapitalAlert(false)}
              className="bg-primary"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}