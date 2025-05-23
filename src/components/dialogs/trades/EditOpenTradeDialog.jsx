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
import { cn } from "@/lib/utils";
import ChargesBreakdown from "./charges-breakdown";
import TimePicker from "@/components/ui/time-picker";

export function EditOpenTradeDialog({ open, onOpenChange, trade, onSubmit }) {
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const [editedTrade, setEditedTrade] = useState(trade);
  const [error, setError] = useState("");
  const [calculatedExchangeRate, setCalculatedExchangeRate] = useState(0);
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

  // Memoize charges calculation
  const charges = useMemo(() => {
    if (
      editedTrade &&
      editedTrade.quantity &&
      editedTrade.action &&
      editedTrade.equityType &&
      (editedTrade.buyingPrice || editedTrade.sellingPrice)
    ) {
      const price =
        editedTrade.action === TRANSACTION_TYPES.BUY
          ? editedTrade.buyingPrice
          : editedTrade.sellingPrice;
      return calculateCharges({
        equityType: editedTrade.equityType,
        action: editedTrade.action,
        price,
        quantity: editedTrade.quantity,
        brokerage: editedTrade.brokerage,
      });
    }
    return null;
  }, [
    editedTrade?.buyingPrice,
    editedTrade?.sellingPrice,
    editedTrade?.quantity,
    editedTrade?.action,
    editedTrade?.equityType,
    editedTrade?.brokerage,
  ]);

  // Update exchange rate based on calculated charges or set to 0 for OTHER
  useEffect(() => {
    if (charges && editedTrade) {
      const newExchangeRate = editedTrade.equityType === EQUITY_TYPES.OTHER ? 0 : Number((charges.totalCharges - charges.brokerage).toFixed(2));
      setCalculatedExchangeRate(newExchangeRate);
      if (!exchangeRateEdited && editedTrade.exchangeRate !== newExchangeRate) {
        setEditedTrade((prev) => ({
          ...prev,
          exchangeRate: newExchangeRate,
        }));
      }
    }
  }, [charges, exchangeRateEdited, editedTrade?.equityType]);

  const validateTrade = () => {
    if (!editedTrade.quantity || editedTrade.quantity <= 0) {
      setError("Quantity must be greater than zero");
      return false;
    }

    if (editedTrade.action === TRANSACTION_TYPES.BUY && !editedTrade.buyingPrice) {
      setError("Please enter a buying price");
      return false;
    }
    if (editedTrade.action === TRANSACTION_TYPES.SELL && !editedTrade.sellingPrice) {
      setError("Please enter a selling price");
      return false;
    }
    setError("");
    return true;
  };

  const calculateTotalOrder = (trade) => {
    const price = trade.action === TRANSACTION_TYPES.BUY ? trade.buyingPrice : trade.sellingPrice;
    const charges = calculateCharges({
      equityType: trade.equityType,
      action: trade.action,
      price,
      quantity: trade.quantity,
      brokerage: trade.brokerage,
    });
    return charges.turnover + charges.totalCharges;
  };

  const handleTradeTypeChange = (value) => {
    setEditedTrade((prev) => ({
      ...prev,
      action: value,
      buyingPrice: null,
      sellingPrice: null,
    }));
    setError("");
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)));
    setError("");
    setEditedTrade({
      ...editedTrade,
      quantity: value,
    });
  };

  const handleOpenTradeEdit = async () => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/trades/open/${editedTrade._id}`,
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
      console.error("Error editing open trade:", error);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetExchangeRate = () => {
    const resetValue = editedTrade.equityType === EQUITY_TYPES.OTHER ? 0 : Number(calculatedExchangeRate.toFixed(2));
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
            <DialogTitle>Edit Open Trade</DialogTitle>
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
                  {error && error.includes("Quantity") && <p className="text-sm text-red-500 mt-1">{error}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-2">
                  <Label>Transaction Type</Label>
                  <RadioGroup
                    className="flex space-x-4"
                    value={editedTrade.action}
                    onValueChange={handleTradeTypeChange}
                  >
                    <div
                      className={cn(
                        "flex items-center space-x-2 border border-border/25 shadow rounded-lg w-36 p-2",
                        editedTrade.action === TRANSACTION_TYPES.BUY ? "bg-[#A073F01A]" : "bg-card",
                      )}
                    >
                      <RadioGroupItem value={TRANSACTION_TYPES.BUY} id="edit-open-buy" />
                      <Label htmlFor="edit-open-buy" className="w-full">
                        Buy
                      </Label>
                    </div>
                    <div
                      className={cn(
                        "flex items-center space-x-2 border border-border/25 shadow rounded-lg w-36 p-2",
                        editedTrade.action === TRANSACTION_TYPES.SELL ? "bg-[#A073F01A]" : "bg-card",
                      )}
                    >
                      <RadioGroupItem value={TRANSACTION_TYPES.SELL} id="edit-open-sell" />
                      <Label htmlFor="edit-open-sell" className="w-full">
                        Sell
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="col-span-2">
                  <Label>{editedTrade.action === TRANSACTION_TYPES.BUY ? "Buying" : "Selling"} Price</Label>
                  <Input
                    type="number"
                    value={
                      editedTrade.action === TRANSACTION_TYPES.BUY
                        ? (editedTrade.buyingPrice ?? "")
                        : (editedTrade.sellingPrice ?? "")
                    }
                    onChange={(e) => {
                      const price = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)));
                      setError("");
                      setEditedTrade({
                        ...editedTrade,
                        [editedTrade.action === TRANSACTION_TYPES.BUY ? "buyingPrice" : "sellingPrice"]: price,
                      });
                    }}
                  />
                  {error && !error.includes("Quantity") && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
                        setCalculatedExchangeRate(0);
                      }
                    }}
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
                    value={editedTrade.brokerage}
                    onChange={(e) => {
                      const value = Math.max(0, Number(Number.parseFloat(e.target.value).toFixed(2)));
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
              onClick={handleOpenTradeEdit}
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