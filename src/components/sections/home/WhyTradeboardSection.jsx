import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const whyTradeboardItems = [
  {
    title: "Encourages Discipline in Trading",
    description:
      "Trading respects disciplined ones. TradeBoard provides tools to achieve it.",
  },
  {
    title: "Build Strong Trading Psychology",
    description:
      "When you start journaling daily, note down your mistakes and lessons from your trading rules, you end up building strong trading psychology.",
  },
  {
    title: "Performance Visualizations",
    description:
      "Once you end your trading day, you need a board which highlights your performance visually to keep you in the right direction.",
  },
  {
    title: "Promotes Being Accountable",
    description:
      "Even if trading journey and it's outcome is personal, it always helps to have someone, friend or family who watches over your journey.",
  },
  {
    title: "In this together",
    description:
      "We are in this together. We have built it with sole purpose of supporting each and every trader in their journey.",
  },
  {
    title: "For Your Success",
    description:
      "Our mission is to upgrade your trading game with our platform. Come, join the tribe!",
  },
];


const WhyTradeboardSection = () => {
  return (
    <section className="py-16 bg-card scroll-mt-20" id="why_tradeboard">
      <div className="container mx-auto px-">
        <h2 className="font-bold text-3xl md:text-4xl text-center mb-8">
          Why <span className="text-primary">TradeBoard</span>?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-14 container lg:px-24">
          {whyTradeboardItems.map((item, index) => (
            <Card
              key={index}
              className="border shadow-[0px_8px_24px_rgba(0,0,0,0.04)] p-0"
            >
              <CardHeader className="px-4">
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 text-base text-accent-foreground/80">
                <p>{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default  WhyTradeboardSection