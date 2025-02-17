"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRazorpay } from "@/hooks/use-razorpay";
import axios from "axios";
import Cookies from "js-cookie";
import { Check, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const pricingPlans = [
  {
    name: "One Week on Us",
    subtitle: "(₹ 0)",
    plan_name: "one-week",
    plan_total_price: "0",
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
  },
  {
    name: "Half-Year Adventure",
    subtitle: "(₹ 1,194 / Half Year)",
    plan_name: "half-year",
    plan_total_price: "1194",
    price: "199",
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
  },
  {
    name: "Year of Possibilities",
    subtitle: "(₹ 1,788 / Year)",
    plan_name: "yearly",
    plan_total_price: "1788",
    price: "149",
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
  },
];

const SubscriptionPlan = ({ selectedPlan }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const router = useRouter();
  const { toast } = useToast();
  const isRazorpayLoaded = useRazorpay();

  useEffect(() => {
    const token = Cookies.get("token");
    const plan = Cookies.get("plan");

    if (!token) {
      router.push("/login");
    } else {
      setIsLoggedIn(true);
      setActivePlan(plan);
      fetchUserProfile(token);
    }
  }, [router]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserProfile(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user profile.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async (response, plan) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

      const token = Cookies.get("token");

      const result = await axios.post(
        `${API_URL}/payment/payment-success`,
        {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          plan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.data.success) {
        console.log("Payment successful!");
        console.log("Reference:", result.data.reference);
        console.log("Plan:", result.data.plan);

        window.location.href = `/payment-success?reference=${result.data.reference}&plan=${result.data.plan}`;
      } else {
        console.error("Payment verification failed.");
      }
    } catch (error) {
      console.error("Error during payment success handling:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (amount, plan) => {
    if (plan === "one-week") {
      router.push("/dashboard");
      return;
    }

    if (!isRazorpayLoaded) {
      throw new Error("Payment system is still loading. Please try again.");
    }

    setLoading(true);

    try {
      const token = Cookies.get("token");
      const {
        data: { key },
      } = await axios.get(`${API_URL}/get-key`);
      const {
        data: { order },
      } = await axios.post(
        `${API_URL}/payment/checkout`,
        {
          amount,
          plan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        image: "/tb_logo.svg",
        name: "Tradeboard",
        description: `${plan} Subscription`,
        order_id: order.id,
        handler: function (response) {
          handlePaymentSuccess(response, plan);
        },
        prefill: {
          name: userProfile.name,
          email: userProfile.email,
          contact: userProfile.phone.replace("+91", ""),
        },
        theme: {
          color: "#a073f0",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast({
        title: "Error",
        description: "Payment initialization failed",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="flex items-center justify-center">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center relative">
        <h2 className="text-[1.65rem] text-center mb-4">
          Simple Pricing, Great Value
        </h2>
        <p className="text-3xl font-semibold text-center mb-14">
          Every plan offers complete{" "}
          <span className="text-foreground">features access</span>
        </p>

        <div className="flex flex-col md:flex-row gap-10 justify-center items-center container lg:px-48 relative">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="relative">
              <Card
                className={`${
                  plan.highlight || selectedPlan === plan.plan_name
                    ? "border-primary"
                    : ""
                } bg-card text-foreground w-[20rem] rounded-3xl p-2 ${
                  plan.discount || selectedPlan === plan.plan_name
                    ? "border-2 shadow-[0_8px_24px_rgba(119,_50,_187,_0.18)]"
                    : "shadow-[0_8px_24px_rgba(0,_0,_0,_0.08)]"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-xl mb-2 font-medium">
                    {plan.name}
                  </CardTitle>
                  <div className="text-2xl font-semibold">
                    ₹ {plan.price}
                    {plan.period && (
                      <span className="text-sm font-normal">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-normal mt-1 text-gray-600">
                    {plan.subtitle}
                  </div>
                  {selectedPlan === plan.plan_name && (
                    <div className="text-sm font-medium text-green-600 mt-2">
                      You selected this plan
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
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
                    className="w-full h-10 transition-all duration-300 hover:scale-105 active:scale-95"
                    variant={plan.buttonVariant}
                    disabled={
                      plan.plan_name === "one-week" && activePlan === "one-week"
                    }
                    onClick={() =>
                      handleCheckout(
                        plan.plan_total_price,
                        plan.plan_name.toLowerCase()
                      )
                    }
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;