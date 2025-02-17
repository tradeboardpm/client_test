// components/sections/TradingPsychologySection.jsx
import { Card } from "@/components/ui/card";

const TradingPsychologySection = () => {
  return (
    <section className="py-8 md:py-16 bg-card">
      <div className="container mx-auto px-">
        <h2 className=" text-2xl md:text-3xl lg:text-4xl  font-bold text-center mb-12">
          Manage Your <span className="text-primary">Trading Psychology</span>
        </h2>
        <div className="flex flex-col gap-20 lg:px-24">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16 justify-between">
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              <Card className=" border shadow-[0px_8px_24px_rgba(0,0,0,0.04)] p-4">
                <h3 className="text-lg md:text-[1.4rem] font-semibold  mb-2 md:mb-4">
                  Journal
                </h3>
                <p className="text-sm md:text-base mb-2 md:mb-4">
                  Journal allows you to add different aspects of your thought
                  process during trading.
                </p>
              </Card>
              <Card className=" border shadow-[0px_8px_24px_rgba(0,0,0,0.04)] p-4">
                <h3 className="text-lg md:text-[1.4rem] font-semibold  mb-2 md:mb-4">
                  Rules
                </h3>
                <p className="text-sm md:text-base mb-2 md:mb-4">
                  Rules keep you disciplined. Checkmark the followed rules and
                  keep the unfollowed ones unchecked.
                </p>
              </Card>
            </div>
            <div className="p-4 rounded-xl bg-[#8885FF]/15 w-fit ">
              <img
                src="/images/rules.png"
                alt="Journal and Rules Interface"
                layout="responsive"
                className="rounded-lg w-full sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[38rem]"
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
            <Card className=" border shadow-[0px_8px_24px_rgba(0,0,0,0.04)] p-4 w-full lg:w-1/2">
              <h3 className="text-lg md:text-[1.4rem] font-semibold  mb-2 md:mb-4">
                Trade Log
              </h3>
              <p className="text-sm md:text-base mb-2 md:mb-4">
                Add the same trades here which you executed on your broker’s
                platform. When you journal your every trade, we build analytics
                on your trading pattern. This ultimately helps you to become
                more disciplined while taking trades.
              </p>
            </Card>
            <div className="p-4 rounded-xl bg-[#8885FF]/15 w-fit ">
              <img
                src="/images/trades.png"
                alt="Trade Log Interface"
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

export default TradingPsychologySection;
