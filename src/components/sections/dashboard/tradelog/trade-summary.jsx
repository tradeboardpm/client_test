import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

export function TradeSummary({ summary }) {
  // Safely default undefined/null values to 0
  const totalPnL = summary.totalPnL ?? 0;
  const totalCharges = summary.totalCharges ?? 0;
  const totalNetPnL =  summary.netPnL ?? 0;

  // Color logic (Profit)
  const profitColor = totalPnL >= 0 ? "text-[#0ED991]" : "text-[#F44C60]";
  const profitBg = totalPnL >= 0 ? "bg-[#0ED991]/15" : "bg-[#F44C60]/15";

  // Color logic (Net P&L)
  // RED for 0 and negative, GREEN only for positive
  const netColor = totalNetPnL > 0 ? "text-[#0ED991]" : "text-[#F44C60]";
  const netBg = totalNetPnL > 0 ? "bg-[#0ED991]/15" : "bg-[#F44C60]/15";

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 items-stretch sm:items-center justify-between mt-4 sm:mt-6 w-full">
      {/* Today's Profit */}
      <div
        className={`rounded-lg p-1 flex items-center justify-between sm:justify-start gap-2 w-full sm:w-fit px-3 py-2 sm:px-4 ${profitBg}`}
      >
        <div className={`text-sm font-normal ${profitColor}`}>
          Today's Profit:
        </div>
        <div className={`text-base font-medium ${profitColor}`}>
          ₹ {totalPnL.toFixed(2)}
        </div>
      </div>

      {/* Today's Charges */}
      <div className="rounded-lg bg-[#A073F0]/25 flex items-center justify-between sm:justify-start gap-2 p-1 w-full sm:w-fit px-3 py-2 sm:px-4">
        <div className="text-sm font-medium text-primary">
          <span className="flex gap-1 items-center">
            Today's Charges
            <HoverCard>
              <HoverCardTrigger>
                <Info className="h-4 w-4 text-primary cursor-pointer" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm text-muted-foreground">
                  Total Charges = Exchange charge + Brokerage
                </p>
              </HoverCardContent>
            </HoverCard>
            :
          </span>
        </div>
        <div className="text-base font-medium text-primary">
          ₹ {totalCharges.toFixed(2)}
        </div>
      </div>

      {/* Net Realised P&L */}
      <div
        className={`rounded-lg p-1 flex items-center justify-between sm:justify-start gap-2 w-full sm:w-fit px-3 py-2 sm:px-4 ${netBg}`}
      >
        <div className={`text-sm font-normal ${netColor}`}>
          Net Realised P&L:
        </div>
        <div className={`text-base font-medium ${netColor}`}>
          ₹ {totalNetPnL.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
