import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import Cookies from "js-cookie";
import {
  calculateCharges,
  EQUITY_TYPES,
  TRANSACTION_TYPES,
} from "@/utils/tradeCalculations";
import ChargesBreakdown from "./charges-breakdown";

export function EditCompleteTradeDialog({
  open,
  onOpenChange,
  trade,
  onSubmit,
}) {
  const [editedTrade, setEditedTrade] = useState(trade);
  const [error, setError] = useState("");
  const [calculatedExchangeRate, setCalculatedExchangeRate] = useState(0);
  const [exchangeRateEdited, setExchangeRateEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditedTrade(trade);
    setError("");
    setExchangeRateEdited(false);
  }, [trade]);

  useEffect(() => {
    if (editedTrade) {
      const buyCharges = calculateCharges({
        equityType: editedTrade.equityType,
        action: TRANSACTION_TYPES.BUY,
        price: editedTrade.buyingPrice,
        quantity: editedTrade.quantity,
        brokerage: editedTrade.brokerage / 2,
      });
      const sellCharges = calculateCharges({
        equityType: editedTrade.equityType,
        action: TRANSACTION_TYPES.SELL,
        price: editedTrade.sellingPrice,
        quantity: editedTrade.quantity,
        brokerage: editedTrade.brokerage / 2,
      });
      const totalExchangeCharges =
        buyCharges.totalCharges +
        sellCharges.totalCharges -
        editedTrade.brokerage;
      setCalculatedExchangeRate(totalExchangeCharges);
    }
  }, [editedTrade]);

  const validateTrade = () => {
    if (!editedTrade.quantity || editedTrade.quantity <= 0) {
      setError("Quantity must be greater than zero");
      return false;
    }

    if (!editedTrade.buyingPrice || editedTrade.buyingPrice <= 0) {
      setError("Please enter a valid buying price");
      return false;
    }

    if (!editedTrade.sellingPrice || editedTrade.sellingPrice <= 0) {
      setError("Please enter a valid selling price");
      return false;
    }

    setError("");
    return true;
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(0, Number(parseFloat(e.target.value).toFixed(2)));
    setError("");
    setEditedTrade({
      ...editedTrade,
      quantity: value,
    });
  };

  const handleCompleteTradeEdit = async () => {
    if (!editedTrade) return;
    if (!validateTrade()) return;
    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/trades/complete/${editedTrade._id}`,
        {
          ...editedTrade,
          instrumentName: editedTrade.instrumentName.toUpperCase(),
          exchangeRate: editedTrade.exchangeRate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSubmit();
      onOpenChange(false);
      setError("");
    } catch (error) {
      console.error("Error editing complete trade:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetExchangeRate = () => {
    setEditedTrade((prev) => ({
      ...prev,
      exchangeRate: calculatedExchangeRate,
    }));
    setExchangeRateEdited(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[50vw]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Edit Complete Trade</DialogTitle>
        </DialogHeader>
        {editedTrade && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-2">
                <Label>Instrument Name</Label>
                <Input
                  value={editedTrade.instrumentName}
                  onChange={(e) =>
                    setEditedTrade({
                      ...editedTrade,
                      instrumentName: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={editedTrade.quantity}
                  onChange={handleQuantityChange}
                />
                {error && error.includes("Quantity") && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-2">
                <Label>Buying Price</Label>
                <Input
                  type="number"
                  value={editedTrade.buyingPrice ?? ""}
                  onChange={(e) => {
                    const price = Math.max(
                      0,
                      Number(parseFloat(e.target.value).toFixed(2))
                    );
                    setError("");
                    setEditedTrade({
                      ...editedTrade,
                      buyingPrice: price,
                    });
                  }}
                />
                {error && error.includes("buying price") && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>
              <div className="col-span-2">
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  value={editedTrade.sellingPrice ?? ""}
                  onChange={(e) => {
                    const price = Math.max(
                      0,
                      Number(parseFloat(e.target.value).toFixed(2))
                    );
                    setError("");
                    setEditedTrade({
                      ...editedTrade,
                      sellingPrice: price,
                    });
                  }}
                />
                {error && error.includes("selling price") && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-2">
                <Label>Equity Type</Label>
                <Select
                  value={editedTrade.equityType}
                  onValueChange={(value) =>
                    setEditedTrade({ ...editedTrade, equityType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EQUITY_TYPES.FNO_OPTIONS}>
                      F&O-OPTIONS
                    </SelectItem>
                    <SelectItem value={EQUITY_TYPES.FNO_FUTURES}>
                      F&O-FUTURES
                    </SelectItem>
                    <SelectItem value={EQUITY_TYPES.INTRADAY}>
                      INTRADAY EQUITY
                    </SelectItem>
                    <SelectItem value={EQUITY_TYPES.DELIVERY}>
                      DELIVERY EQUITY
                    </SelectItem>
                    <SelectItem value={EQUITY_TYPES.OTHER}>
                      OTHER
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={editedTrade.time}
                  onChange={(e) =>
                    setEditedTrade({
                      ...editedTrade,
                      time: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-2">
                <Label>Exchange Charges (₹)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={editedTrade.exchangeRate}
                    onChange={(e) => {
                      const value = Math.max(
                        0,
                        Number(parseFloat(e.target.value).toFixed(2))
                      );
                      setEditedTrade({
                        ...editedTrade,
                        exchangeRate: value,
                      });
                      setExchangeRateEdited(true);
                    }}
                  />
                  {exchangeRateEdited && (
                    <Button
                      onClick={resetExchangeRate}
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
                  value={editedTrade.brokerage.toFixed(2)}
                  onChange={(e) =>
                    setEditedTrade({
                      ...editedTrade,
                      brokerage: Math.max(
                        0,
                        Number(parseFloat(e.target.value).toFixed(2))
                      ),
                    })
                  }
                />
              </div>
            </div>
            <ChargesBreakdown 
                trade={{
                  ...editedTrade,
                  manualExchangeCharge: exchangeRateEdited || editedTrade.equityType === EQUITY_TYPES.OTHER
                }}
              />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCompleteTradeEdit}
            className="bg-primary"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
