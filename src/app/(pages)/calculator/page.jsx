"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EQUITY_TYPES, calculateResults } from "@/utils/trading-calculator";

const TradingCalculator = () => {
  const [formData, setFormData] = useState({
    equityType: "F&O-OPTIONS",
    buyPrice: "",
    buyQuantity: "",
    sellPrice: "",
    sellQuantity: "",
    brokerage: "20",
  });

  const [results, setResults] = useState({
    buy: null,
    sell: null,
    combined: null,
  });

  const handleCalculate = () => {
    const calculatedResults = calculateResults(formData);
    setResults(calculatedResults);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Trading Calculator</CardTitle>
          <CardDescription>
            Calculate charges and P&L for both buy and sell sides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Equity Type</Label>
                <Select
                  value={formData.equityType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, equityType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EQUITY_TYPES).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Total Brokerage</Label>
                <Input
                  type="number"
                  value={formData.brokerage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      brokerage: e.target.value,
                    }))
                  }
                  placeholder="Enter total brokerage"
                />
              </div>

              <div className="space-y-2">
                <Label>Buy Price</Label>
                <Input
                  type="number"
                  value={formData.buyPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      buyPrice: e.target.value,
                    }))
                  }
                  placeholder="Enter buy price"
                />
              </div>

              <div className="space-y-2">
                <Label>Buy Quantity</Label>
                <Input
                  type="number"
                  value={formData.buyQuantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      buyQuantity: e.target.value,
                    }))
                  }
                  placeholder="Enter buy quantity"
                />
              </div>

              <div className="space-y-2">
                <Label>Sell Price</Label>
                <Input
                  type="number"
                  value={formData.sellPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sellPrice: e.target.value,
                    }))
                  }
                  placeholder="Enter sell price"
                />
              </div>

              <div className="space-y-2">
                <Label>Sell Quantity</Label>
                <Input
                  type="number"
                  value={formData.sellQuantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sellQuantity: e.target.value,
                    }))
                  }
                  placeholder="Enter sell quantity"
                />
              </div>
            </div>

            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              onClick={handleCalculate}
            >
              Calculate
            </button>

            {(results.buy || results.sell) && (
              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="buy">Buy Side</TabsTrigger>
                  <TabsTrigger value="sell">Sell Side</TabsTrigger>
                  <TabsTrigger value="combined">Combined</TabsTrigger>
                </TabsList>

                <TabsContent value="buy">
                  {results.buy && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-secondary rounded-md">
                          <p className="text-sm font-medium">Turnover</p>
                          <p className="text-2xl">
                            ₹{results.buy.turnover.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-4 bg-secondary rounded-md">
                          <p className="text-sm font-medium">Total Charges</p>
                          <p className="text-2xl">
                            ₹{results.buy.totalCharges.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Charges Breakdown</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            Brokerage: ₹{results.buy.brokerage.toFixed(2)}
                          </div>
                          <div>STT: ₹{results.buy.sttCharges.toFixed(2)}</div>
                          <div>
                            Exchange: ₹{results.buy.exchangeCharges.toFixed(2)}
                          </div>
                          <div>SEBI: ₹{results.buy.sebiCharges.toFixed(2)}</div>
                          <div>
                            Stamp Duty: ₹{results.buy.stampDuty.toFixed(2)}
                          </div>
                          <div>GST: ₹{results.buy.gstCharges.toFixed(2)}</div>
                          <div>
                            DP Charges: ₹{results.buy.dpCharges.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sell">
                  {results.sell && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-secondary rounded-md">
                          <p className="text-sm font-medium">Turnover</p>
                          <p className="text-2xl">
                            ₹{results.sell.turnover.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-4 bg-secondary rounded-md">
                          <p className="text-sm font-medium">Total Charges</p>
                          <p className="text-2xl">
                            ₹{results.sell.totalCharges.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Charges Breakdown</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            Brokerage: ₹{results.sell.brokerage.toFixed(2)}
                          </div>
                          <div>STT: ₹{results.sell.sttCharges.toFixed(2)}</div>
                          <div>
                            Exchange: ₹{results.sell.exchangeCharges.toFixed(2)}
                          </div>
                          <div>
                            SEBI: ₹{results.sell.sebiCharges.toFixed(2)}
                          </div>
                          <div>
                            Stamp Duty: ₹{results.sell.stampDuty.toFixed(2)}
                          </div>
                          <div>GST: ₹{results.sell.gstCharges.toFixed(2)}</div>
                          <div>
                            DP Charges: ₹{results.sell.dpCharges.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="combined">
                  {results.combined && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-secondary rounded-md">
                          <p className="text-sm font-medium">Gross P&L</p>
                          <p
                            className={`text-2xl ${
                              results.combined.profitLoss >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            ₹{results.combined.profitLoss.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-4 bg-secondary rounded-md">
                          <p className="text-sm font-medium">Total Charges</p>
                          <p className="text-2xl">
                            ₹{results.combined.totalCharges.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-4 bg-secondary rounded-md">
                          <p className="text-sm font-medium">Net P&L</p>
                          <p
                            className={`text-2xl ${
                              results.combined.netProfitLoss >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            ₹{results.combined.netProfitLoss.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Charges Breakdown</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            Brokerage: ₹{results.combined.brokerage.toFixed(2)}
                          </div>
                          <div>
                            STT: ₹{results.combined.sttCharges.toFixed(2)}
                          </div>
                          <div>
                            Exchange: ₹
                            {results.combined.exchangeCharges.toFixed(2)}
                          </div>
                          <div>
                            SEBI: ₹{results.combined.sebiCharges.toFixed(2)}
                          </div>
                          <div>
                            Stamp Duty: ₹{results.combined.stampDuty.toFixed(2)}
                          </div>
                          <div>
                            GST: ₹{results.combined.gstCharges.toFixed(2)}
                          </div>
                          <div>
                            DP Charges: ₹{results.combined.dpCharges.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingCalculator;
