import React, { useState, useEffect, useMemo } from "react";
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
import TimePicker from "@/components/ui/time-picker";

export function EditCompleteTradeDialog({
  open,
  onOpenChange,
  trade,
  onSubmit,
}) {
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const [editedTrade, setEditedTrade] = useState(trade);
  const [error, setError] = useState("");
  const [exchangeRateEdited, setExchangeRateEdited] = useState(false);
  const [manualExchangeCharge, setManualExchangeCharge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      setEditedTrade({
        ...trade,
        time: trade.time || getCurrentTime(),
        exchangeRate: trade.equityType === EQUITY_TYPES.OTHER ? 0 : trade.exchangeRate,
      });
      setError("");
      setExchangeRateEdited(false);
      setManualExchangeCharge(trade.equityType === EQUITY_TYPES.OTHER);
    }
  }, [trade]);

  // Reset time to current time if unset when dialog opens
  useEffect(() => {
    if (open && editedTrade && !editedTrade.time) {
      setEditedTrade((prev) => ({
        ...prev,
        time: getCurrentTime(),
      }));
    }
  }, [open]);

  // Memoize exchange rate calculation
  const calculatedExchangeRate = useMemo(() => {
    if (
      editedTrade &&
      editedTrade.quantity &&
      editedTrade.equityType &&
      editedTrade.buyingPrice &&
      editedTrade.sellingPrice
    ) {
      if (editedTrade.equityType === EQUITY_TYPES.OTHER) {
        return 0;
      }
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
      return Number((buyCharges.totalCharges + sellCharges.totalCharges - editedTrade.brokerage).toFixed(2));
    }
    return 0;
  }, [
    editedTrade?.buyingPrice,
    editedTrade?.sellingPrice,
    editedTrade?.quantity,
    editedTrade?.equityType,
    editedTrade?.brokerage,
  ]);

  // Update exchange rate only when not manually edited
  useEffect(() => {
    if (!exchangeRateEdited && editedTrade) {
      const newExchangeRate = editedTrade.equityType === EQUITY_TYPES.OTHER ? 0 : calculatedExchangeRate;
      if (editedTrade.exchangeRate !== newExchangeRate) {
        setEditedTrade((prev) => ({
          ...prev,
          exchangeRate: newExchangeRate,
        }));
      }
    }
  }, [calculatedExchangeRate, exchangeRateEdited, editedTrade?.equityType]);

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

  const calculateTotalOrder = (trade) => {
    const buyCharges = calculateCharges({
      equityType: trade.equityType,
      action: TRANSACTION_TYPES.BUY,
      price: trade.buyingPrice,
      quantity: trade.quantity,
      brokerage: trade.brokerage / 2,
    });
    const sellCharges = calculateCharges({
      equityType: trade.equityType,
      action: TRANSACTION_TYPES.SELL,
      price: trade.sellingPrice,
      quantity: trade.quantity,
      brokerage: trade.brokerage / 2,
    });
    return buyCharges.turnover + buyCharges.totalCharges + sellCharges.turnover + sellCharges.totalCharges;
  };

  const handleCompleteTradeEdit = async () => {
    if (!editedTrade) return;
    if (!validateTrade()) return;

    // Check if total order amount exceeds capital
    const totalOrderAmount = calculateTotalOrder(editedTrade);
    if (capital !== null && totalOrderAmount > capital) {
      setShowCapitalAlert(true);
      return;
    }

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
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetExchangeRate = () => {
    const resetValue = editedTrade.equityType === EQUITY_TYPES.OTHER ? 0 : calculatedExchangeRate;
    setEditedTrade((prev) => ({
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
                    onChange={(e) => {
                      const value = Math.max(0, Number(parseFloat(e.target.value).toFixed(2)));
                      setError("");
                      setEditedTrade({
                        ...editedTrade,
                        quantity: value,
                      });
                    }}
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
                    onValueChange={(value) => {
                      setEditedTrade({
                        ...editedTrade,
                        equityType: value,
                        exchangeRate: value === EQUITY_TYPES.OTHER ? 0 : editedTrade.exchangeRate,
                      });
                      if (value === EQUITY_TYPES.OTHER) {
                        setExchangeRateEdited(false);
                        setManualExchangeCharge(true);
                      }
                    }}
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
                  <TimePicker
                    value={editedTrade.time}
                    onChange={(time) =>
                      setEditedTrade({
                        ...editedTrade,
                        time: time,
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
                      step="0.01"
                      value={Number(editedTrade.exchangeRate.toFixed(2))}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value.includes('.')) {
                          value = Number.parseFloat(value).toFixed(2);
                        }
                        value = Math.max(0, Number(value));
                        setEditedTrade({
                          ...editedTrade,
                          exchangeRate: value,
                        });
                        setExchangeRateEdited(true);
                        setManualExchangeCharge(true);
                      }}
                    />
                    {(exchangeRateEdited || editedTrade.equityType === EQUITY_TYPES.OTHER) && (
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
                    value={editedTrade.brokerage}
                    onChange={(e) => {
                      const value = Math.max(0, Number(parseFloat(e.target.value).toFixed(2)));
                      setEditedTrade({
                        ...editedTrade,
                        brokerage: value,
                      });
                    }}
                  />
                </div>
              </div>
              <ChargesBreakdown
                trade={{
                  ...editedTrade,
                  manualExchangeCharge: manualExchangeCharge || editedTrade.equityType === EQUITY_TYPES.OTHER,
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
              disabled={isLoading || capital === null}
            >
              {isLoading ? "Saving..." : "Save Changes"}
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