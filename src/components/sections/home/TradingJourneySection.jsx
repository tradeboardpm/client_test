import { Card } from "@/components/ui/card";
import React from "react";

const TradingJourneySection = () => {
  return (
    <section className="py-8 md:py-16 bg-card">
      <div className="container mx-auto px-">
        <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl text-center mb-8">
          Be Accountable For Your{" "}
          <span className="text-primary">Trading Journey</span>
        </h2>
        <div className="flex flex-col gap-8 lg:px-24">
          <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
            <Card className=" border shadow-[0px_8px_24px_rgba(0,0,0,0.04)] p-4 w-full lg:w-1/2">
              <h3 className="text-lg md:text-[1.4rem] font-semibold  mb-2 md:mb-4">
                Add An Accountability Partner
              </h3>
              <p className="text-sm md:text-base mb-2 md:mb-4">
                This feature allows you to add someone who can guide and keep
                track of your trading progress. This is optional but having an
                accountability partner always pushes you to do your best.
              </p>
            </Card>
            <div className="p-4 rounded-xl bg-[#8885FF]/15 w-fit ">
              <img
                src="/images/ap.png"
                alt="Add Accountability Partner UI"
                layout="responsive"
                className="rounded-lg w-full sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[38rem]"
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row-reverse items-center gap-6 justify-between">
            <Card className=" border shadow-[0px_8px_24px_rgba(0,0,0,0.04)] p-4 w-full lg:w-1/2">
              <h3 className="text-lg md:text-[1.4rem] font-semibold  mb-2 md:mb-4">
                Your Progress is Shared
              </h3>
              <p className="text-sm md:text-base mb-2 md:mb-4">
                This progress page is shared to your partner when you decide to
                add someone as your accountability partner and choose to share
                your progress with them.
              </p>
            </Card>
            <div className="p-4 rounded-xl bg-[#8885FF]/15 w-fit ">
              <img
                src="/images/apd.png"
                alt="Trading Progress Charts"
                layout="responsive"
                className="rounded-lg w-full sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[38rem]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradingJourneySection;
