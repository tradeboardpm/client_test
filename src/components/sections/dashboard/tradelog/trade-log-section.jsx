import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TradesTable } from "./trades-table.jsx";
import { TradeSummary } from "./trade-summary.jsx";
import { ImportTradeDialog } from "./import-trade.jsx";
import { Plus, Import, Search } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { AddTradeDialog } from "@/components/dialogs/trades/AddTradeDialog";
import { EditOpenTradeDialog } from "@/components/dialogs/trades/EditOpenTradeDialog";
import { EditCompleteTradeDialog } from "@/components/dialogs/trades/EditCompleteTradeDialog";
import { DeleteTradeDialog } from "@/components/dialogs/trades/DeleteTradeDialog";
import { CompleteTradeDialog } from "@/components/dialogs/trades/CompleteTradeDialog.jsx";

export function TradesSection({
  selectedDate,
  brokerage,
  onTradeChange,
  onUpdate,
}) {
  const [trades, setTrades] = useState([]);
  const [tradeSummary, setTradeSummary] = useState({
    totalPnL: 0,
    totalCharges: 0,
    totalNetPnL: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addTradeOpen, setAddTradeOpen] = useState(false);
  const [editOpenTradeOpen, setEditOpenTradeOpen] = useState(false);
  const [editCompleteTradeOpen, setEditCompleteTradeOpen] = useState(false);
  const [completeTradeOpen, setCompleteTradeOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const subscription = Cookies.get('subscription');
    setHasSubscription(subscription === 'true');
  }, []);

  useEffect(() => {
    fetchTradesData();
  }, [selectedDate]);

  const getUTCDate = (date) => {
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
  };

  const handleTradeUpdate = async () => {
    await fetchTradesData();
    onTradeChange?.();
  };

  const fetchTradesData = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const utcDate = getUTCDate(selectedDate);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/trades/by-date`,
        {
          params: { date: utcDate.toISOString() },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTrades(response.data.trades);
      setTradeSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching trades data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTradeAction = (action, trade = null) => {
    if (!hasSubscription) return;
    setSelectedTrade(trade);
    switch (action) {
      case "add":
        setAddTradeOpen(true);
        break;
      case "editOpen":
        setEditOpenTradeOpen(true);
        break;
      case "editComplete":
        setEditCompleteTradeOpen(true);
        break;
      case "complete":
        setCompleteTradeOpen(true);
        break;
      case "delete":
        setDeleteDialogOpen(true);
        break;
    }
  };

  const filteredTrades = trades.filter((trade) =>
    trade.instrumentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="shadow-[0px_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0px_8px_20px_rgba(0,0,0,0.32)] p-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-3 border-b border-primary/15">
        <div className="space-y-1 text-xl">
          <CardTitle>Trade Log</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleTradeAction("add")}
            className="bg-primary"
            disabled={!hasSubscription}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Trade
          </Button>
          {/* <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
            disabled
          >
            <Import className="mr-2 h-4 w-4" /> Import Trade
          </Button> */}
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-3">
        {trades.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold">
                Total Trades ({filteredTrades.length})
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8"
                />
              </div>
            </div>
            <TradesTable
              trades={filteredTrades}
              onEditOpen={(trade) => handleTradeAction("editOpen", trade)}
              onEditComplete={(trade) =>
                handleTradeAction("editComplete", trade)
              }
              onDelete={(trade) => handleTradeAction("delete", trade)}
              onCompleteTrade={(trade) => handleTradeAction("complete", trade)}
              hasSubscription={hasSubscription}
            />
            <TradeSummary summary={tradeSummary} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src="/images/no_trade.svg"
              alt="No trades"
              className="w-64 h-64 mb-6"
            />
            <h3 className="text-xl font-semibold mb-2">Get Started!</h3>
            <p className="text-muted-foreground mb-6">
              Please click on buttons to add or import your today's trades
            </p>
          </div>
        )}
      </CardContent>

      <AddTradeDialog
        open={addTradeOpen}
        onOpenChange={setAddTradeOpen}
        onSubmit={handleTradeUpdate}
        selectedDate={selectedDate}
        brokerage={brokerage}
      />

      <EditOpenTradeDialog
        open={editOpenTradeOpen}
        onOpenChange={setEditOpenTradeOpen}
        trade={selectedTrade}
        onSubmit={handleTradeUpdate}
      />

      <EditCompleteTradeDialog
        open={editCompleteTradeOpen}
        onOpenChange={setEditCompleteTradeOpen}
        trade={selectedTrade}
        onSubmit={handleTradeUpdate}
      />

      <CompleteTradeDialog
        open={completeTradeOpen}
        onOpenChange={setCompleteTradeOpen}
        trade={selectedTrade}
        onSubmit={handleTradeUpdate}
        selectedDate={selectedDate}
        brokerage={brokerage}
      />

      <DeleteTradeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        trade={selectedTrade}
        onDelete={handleTradeUpdate}
      />

      <ImportTradeDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={handleTradeUpdate}
        defaultBrokerage={brokerage}
      />
    </Card>
  );
}