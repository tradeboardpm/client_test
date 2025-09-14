import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { calculateCharges, TRANSACTION_TYPES, EQUITY_TYPES } from "@/utils/tradeCalculations";

const ChargesBreakdown = ({ trade }) => {
  const price = trade.action === TRANSACTION_TYPES.BUY ? trade.buyingPrice : trade.sellingPrice;

  if (!trade.quantity || !price) {
    return (
      <div className="flex justify-start gap-2 items-center">
        {/* <span className="font-medium">Total Order Amount:</span>
        <span className="text-base font-medium text-primary">₹ 0.00</span> */}
      </div>
    );
  }

  const charges = calculateCharges({
    equityType: trade.equityType,
    action: trade.action,
    price,
    quantity: trade.quantity,
    brokerage: trade.brokerage || 0, // Default to 0 if NaN
  });

  // For OTHER equity type, use manual exchange rate if available
  const exchangeCharges = trade.equityType === EQUITY_TYPES.OTHER 
    ? (trade.exchangeRate || 0) 
    : charges.exchangeCharges;

  // Calculate total charges with proper exchange rate handling
  const totalCharges = trade.equityType === EQUITY_TYPES.OTHER
    ? (trade.brokerage || 0) + (trade.exchangeRate || 0) + charges.sttCharges + charges.sebiCharges + charges.stampDuty + charges.gstCharges
    : (charges.totalCharges - (charges.brokerage || 0)) + (trade.brokerage || 0);

  const totalOrderAmount = charges.turnover + (
    trade.equityType === EQUITY_TYPES.OTHER
      ? (trade.brokerage || 0) + (trade.exchangeRate || 0)
      : totalCharges
  );

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="charges" className="border-none h-full">
        <AccordionTrigger className="p-0 hover:no-underline w-full h-16 rounded-lg px-4 bg-[#F4E4FF] dark:bg-[#312d33] rounded-lg max-h-52 overflow-y-auto">
          <div className="flex justify-start gap-2 items-center w-full">
            <span className="font-medium">Total Order Amount:</span>
            <span className="text-base font-medium text-primary">
              ₹ {totalOrderAmount.toFixed(2)}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <div className="space-y-1 text-xs bg-card p-2 rounded-lg">
            {[
              { label: "Order Value:", value: charges.turnover },
              { label: "Brokerage:", value: trade.brokerage || 0 },
              { 
                label: "STT:", 
                value: trade.equityType === EQUITY_TYPES.OTHER ? 0 : charges.sttCharges 
              },
              { 
                label: "Exchange Charges:", 
                value: exchangeCharges 
              },
              { 
                label: "SEBI Charges:", 
                value: trade.equityType === EQUITY_TYPES.OTHER ? 0 : charges.sebiCharges 
              },
              { 
                label: "Stamp Duty:", 
                value: trade.equityType === EQUITY_TYPES.OTHER ? 0 : charges.stampDuty 
              },
              { 
                label: "GST:", 
                value: trade.equityType === EQUITY_TYPES.OTHER ? 0 : charges.gstCharges 
              },
            ].map(({ label, value }, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span>₹ {value.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-1 mt-1 space-y-1 font-medium">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Charges:</span>
                <span>₹ {(trade.equityType === EQUITY_TYPES.OTHER ? (trade.brokerage || 0) + (trade.exchangeRate || 0) : totalCharges).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Break Even Per Unit:</span>
                <span>₹ {((trade.equityType === EQUITY_TYPES.OTHER ? (trade.brokerage || 0) + (trade.exchangeRate || 0) : totalCharges) / trade.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ChargesBreakdown;