import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SquarePen, Trash2, CheckSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function TradesTable({
  trades,
  onEditOpen,
  onEditComplete,
  onDelete,
  onCompleteTrade,
  isDeleting,
  hasSubscription,
}) {
  return (
    <div className="rounded-lg overflow-hidden border">
      <Table className="rounded-b-lg overflow-hidden bg-background">
        <TableHeader className="bg-[#F4E4FF] dark:bg-[#49444c]">
          <TableRow className="border-none text-xs">
            <TableHead className="text-nowrap text-center font-semibold text-foreground">
              Date
            </TableHead>
            <TableHead className="text-nowrap text-center font-semibold text-foreground">
              Instrument
            </TableHead>
            <TableHead className="text-nowrap text-center font-semibold text-foreground">
              Equity Type
            </TableHead>
            <TableHead className="text-nowrap text-center font-semibold text-foreground">
              Quantity
            </TableHead>
            <TableHead className="text-nowrap text-center font-semibold text-foreground">
              Buying Price
            </TableHead>
            <TableHead className="text-nowrap text-center font-semibold text-foreground">
              Selling Price
            </TableHead>
            <TableHead className="text-nowrap text-center font-semibold text-foreground">
              Exchange charges
            </TableHead>
            <TableHead className="text-nowrap text-center font-semibold text-foreground">
              Brokerage
            </TableHead>
            <TableHead className="text-nowrap text-center font-semibold text-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs">
          {trades.map((trade) => (
            <TableRow key={trade._id}>
              <TableCell className="text-nowrap text-center">
                {format(new Date(trade.date), "dd-MM-yyyy")}, {trade.time}
              </TableCell>
              <TableCell
                className={cn(
                  trade.action === "both"
                    ? "text-foreground font-semibold text-center"
                    : trade.action === "buy"
                    ? "text-[#0ED991] font-semibold text-center"
                    : "text-[#F44C60] font-semibold text-center"
                )}
              >
                {trade.instrumentName}
              </TableCell>
              <TableCell className="text-nowrap text-center">
                {trade.equityType}
              </TableCell>
              <TableCell className="text-nowrap text-center">
                {trade.quantity}
              </TableCell>
              <TableCell className="text-nowrap text-center">
                {trade.buyingPrice ? `₹ ${trade.buyingPrice}` : "-"}
              </TableCell>
              <TableCell className="text-nowrap text-center">
                {trade.sellingPrice ? `₹ ${trade.sellingPrice}` : "-"}
              </TableCell>
              <TableCell className="text-nowrap text-center">
                ₹ {trade.exchangeRate.toFixed(2)}
              </TableCell>
              <TableCell className="text-nowrap text-center">
                ₹ {trade.brokerage}
              </TableCell>
              <TableCell className="text-nowrap">
                <div className="flex items-center justify-center gap-2">
                  {trade.isOpen && (
                    <div className="group relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onCompleteTrade(trade)}
                        disabled={!hasSubscription}
                        className="p-0 w-fit text-gray-500/35 dark:text-gray-400 hover:text-green-500 size-5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                      <span className="absolute -top-4 left-[50%] -translate-x-[50%] z-20 origin-left scale-0 px-2 rounded border bg-popover text-xs font-medium shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                        {hasSubscription ? 'Square Off Trade' : 'Subscription Required'}
                      </span>
                    </div>
                  )}

                  <div className="group relative">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        trade.isOpen ? onEditOpen(trade) : onEditComplete(trade)
                      }
                      disabled={!hasSubscription}
                      className="p-0 w-fit text-gray-500/35 dark:text-gray-400 hover:text-purple-500 size-5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>
                    <span className="absolute -top-4 left-[50%] -translate-x-[50%] z-20 origin-left scale-0 px-2 rounded border bg-popover text-xs font-medium shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                      {hasSubscription ? 'Edit Trade' : 'Subscription Required'}
                    </span>
                  </div>

                  <div className="group relative">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(trade)}
                      disabled={!hasSubscription || isDeleting}
                      className="p-0 w-fit text-gray-500/35 dark:text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed size-5"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    <span className="absolute -top-4 left-[50%] -translate-x-[50%] z-20 origin-left scale-0 px-2 rounded border bg-popover text-xs font-medium shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                      {!hasSubscription 
                        ? 'Subscription Required'
                        : isDeleting 
                          ? 'Deleting...' 
                          : 'Delete Trade'}
                    </span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TradesTable;