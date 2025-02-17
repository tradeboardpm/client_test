import { Card } from "@/components/ui/card";
import React from "react";

const TradingDisciplineSection = () => {
  return (
    <section className="py-8 md:py-16 bg-background">
      <div className="container mx-auto px-">
        <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl text-center mb-8">
          Analyse Your <span className="text-primary">Trading Discipline</span>
        </h2>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:px-24">
          <div className="w-fit p-4 rounded-xl bg-[#8885FF]/15">
            <img
              src="/images/analytics.png"
              alt="Trading Analysis Dashboard"
              layout="responsive"
              className="rounded-lg w-full sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[38rem]"
            />
          </div>
          <div className="w-full lg:w-1/3 space-y-6">
            <Card className=" border shadow-[0px_8px_24px_rgba(0,0,0,0.04)] p-4">
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Tradeboard Intelligence
              </h3>
              <p className="text-sm md:text-base">
                For each trading outcome, get the analysis of your trading
                pattern for specific period.
              </p>
            </Card>
            <Card className=" border shadow-[0px_8px_24px_rgba(0,0,0,0.04)] p-4">
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Journal Analysis
              </h3>
              <p className="text-sm md:text-base">
                Filter out your daily logged journals based on various
                performance parameters. Focus on what is working for you.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradingDisciplineSection;
