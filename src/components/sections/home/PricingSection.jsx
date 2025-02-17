import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const pricingPlans = [
  {
    name: "One Week on Us",
    subtitle: "(₹ 0)",
    price: "Free",
    period: "",
    features: [
      "Dashboard",
      "My Journal",
      "Trade Logs",
      "Weekly/Monthly Analysis",
      "Performance Analytics",
      "Accountability Partner",
    ],
    buttonText: "Get Started Now",
    buttonVariant: "",
    planId: "free"
  },
  {
    name: "Half-Year Adventure",
    subtitle: "(₹ 1,194 / Half Year)",
    price: "₹ 199",
    period: "per month",
    features: [
      "Dashboard",
      "My Journal",
      "Trade Logs",
      "Weekly/Monthly Analysis",
      "Performance Analytics",
      "Accountability Partner",
    ],
    buttonText: "Get Started Now",
    buttonVariant: "",
    planId: "half-year"
  },
  {
    name: "Year of Possibilities",
    subtitle: "(₹ 1,788 / Year)",
    price: "₹ 149",
    period: "per month",
    features: [
      "Dashboard",
      "My Journal",
      "Trade Logs",
      "Weekly/Monthly Analysis",
      "Performance Analytics",
      "Accountability Partner",
    ],
    buttonText: "Get Started Now",
    buttonVariant: "default",
    highlight: true,
    discount: true,
    planId: "yearly"
  },
];

const PricingSection = () => {
  const router = useRouter();

  const handlePlanSelection = (planId) => {
    // Store the selected plan and current route in localStorage
    localStorage.setItem('selectedPlan', planId);
    localStorage.setItem('sourceRoute', window.location.pathname);
    
    // Navigate to signup page
    router.push('/sign-up');
  };

  return (
    <section
      className="py-20 primary_gradient scroll-mt-20 text-background"
      id="pricing"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl text-center mb-4">
          Simple Pricing, Great Value
        </h2>
        <p className="text-4xl font-semibold text-center mb-14">
          Every Plan Offers Complete{" "}
          <span className="text-foreground">Features Access</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-8 lg:gap-14 justify-items-center">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="relative">
              <Card
                className={`${
                  plan.highlight ? "border-primary" : ""
                } bg-background text-foreground w-full sm:w-[16rem] lg:w-[20rem] rounded-3xl p-4 border-2 shadow-lg`}
              >
                <CardHeader>
                  <CardTitle className="text-xl mb-2 font-medium">
                    {plan.name}
                  </CardTitle>
                  <div className="text-2xl font-semibold">
                    {plan.price}
                    {plan.period && (
                      <span className="text-sm font-normal">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-normal mt-1 text-gray-600">
                    {plan.subtitle}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="mr-2 h-3 w-3 outline-double outline-[#0ED991] text-background rounded bg-[#0ED991]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.buttonVariant}
                    onClick={() => handlePlanSelection(plan.planId)}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;