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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRazorpay } from "@/hooks/use-razorpay";
import axios from "axios";
import Cookies from "js-cookie";
import { Check, Loader2, Tag, X, ArrowRight, Sparkles, ArrowLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SubscriptionPlan = ({ selectedPlan }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [gstin, setGstin] = useState("");
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [discountDetails, setDiscountDetails] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isRazorpayLoaded = useRazorpay();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsLoggedIn(true);
      setActivePlan(Cookies.get("plan"));
      fetchUserProfile(token);
      fetchPlans();
    }
  }, [router]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfile(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch user profile.", variant: "destructive" });
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/plans`);
      setPlans(response.data.plans);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch plans.", variant: "destructive" });
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
          couponCode,
          gstin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (result.data.success) {
        router.push(`/payment-success?reference=${result.data.reference}&plan=${result.data.plan}`);
      } else {
        throw new Error("Payment verification failed on server.");
      }
    } catch (error) {
      toast({ title: "Error", description: "Payment verification failed.", variant: "destructive" });
    } finally {
      setLoading(false);
      setShowCheckout(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${API_URL}/payment/checkout`,
        {
          amount: selectedPlanForCheckout.plan_total_price,
          plan: selectedPlanForCheckout.plan_name,
          couponCode,
          gstin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setDiscountDetails({
          originalPrice: selectedPlanForCheckout.plan_total_price,
          discountApplied: data.discountApplied,
          finalAmount: data.finalAmount,
          percentOff: Math.round((data.discountApplied / selectedPlanForCheckout.plan_total_price) * 100)
        });
        toast({ title: "Success", description: "Coupon applied successfully!" });
      } else {
        throw new Error(data.error || "Failed to apply coupon.");
      }
    } catch (error) {
      setDiscountDetails(null);
      setCouponError(error.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const clearCoupon = () => {
    setCouponCode("");
    setGstin("");
    setDiscountDetails(null);
    setCouponError("");
  };

  const handleCheckout = (plan) => {
    if (plan.plan_name === "one-week") {
      router.push("/dashboard");
      return;
    }

    setSelectedPlanForCheckout(plan);
    clearCoupon();
    setShowCheckout(true);
  };

  const proceedToPayment = async () => {
    if (!isRazorpayLoaded || !window.Razorpay) {
      toast({ title: "Error", description: "Payment system not ready.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const token = Cookies.get("token");
      const { data: { key } } = await axios.get(`${API_URL}/get-key`);
      const { data: { order, finalAmount } } = await axios.post(
        `${API_URL}/payment/checkout`,
        {
          amount: selectedPlanForCheckout.plan_total_price,
          plan: selectedPlanForCheckout.plan_name,
          couponCode: discountDetails ? couponCode : "",
          gstin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        image: "/tb_logo.svg",
        name: "Tradeboard",
        description: `${selectedPlanForCheckout.plan_name} Subscription`,
        order_id: order.id,
        handler: (response) => handlePaymentSuccess(response, selectedPlanForCheckout.plan_name),
        prefill: {
          name: userProfile?.name || "",
          email: userProfile?.email || "",
          contact: userProfile?.phone?.replace("+91", "") || "",
        },
        theme: { color: "#a073f0" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", (response) => {
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
        setLoading(false);
      });
      paymentObject.open();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const goBackToPlans = () => {
    setShowCheckout(false);
    clearCoupon();
  };

  if (!isLoggedIn) return null;

  if (showCheckout) {
    return (
      <div className="px-4">
        <Button 
          variant="ghost" 
          onClick={goBackToPlans} 
          className="mb-6 -ml-2 text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plans
        </Button>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Checkout: {selectedPlanForCheckout?.name}</h2>
          <p className="text-gray-600">Complete your purchase or apply a coupon code for additional savings.</p>
        </div>
        
        <Card className="border shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Order Summary</CardTitle>
              <Tag className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Plan Price</span>
                <span className="font-semibold">₹ {selectedPlanForCheckout?.plan_total_price}</span>
              </div>
              
              {discountDetails && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm font-medium flex items-center">
                    <Sparkles className="mr-1 h-4 w-4" />
                    Coupon Discount ({discountDetails.percentOff}% off)
                  </span>
                  <span className="font-semibold">-₹ {discountDetails.discountApplied}</span>
                </div>
              )}
              
              {discountDetails && (
                <div className="h-px bg-gray-200 my-1"></div>
              )}
              
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span className="text-lg">
                  ₹ {discountDetails ? discountDetails.finalAmount : selectedPlanForCheckout?.plan_total_price}
                </span>
              </div>
            </div>
            
            <div className="h-px bg-gray-200"></div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="coupon" className="text-sm font-medium block mb-1">Have a coupon code?</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="coupon"
                      placeholder="Enter promo code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError("");
                      }}
                      className={`pr-8 ${couponError ? "border-red-500 focus-visible:ring-red-500" : ""} ${discountDetails ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                      disabled={discountDetails !== null || couponLoading}
                    />
                    {couponCode && !discountDetails && (
                      <button 
                        onClick={clearCoupon}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {discountDetails && (
                      <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
                    )}
                  </div>
                  <Button 
                    onClick={applyCoupon} 
                    disabled={!couponCode || couponLoading || discountDetails !== null}
                    variant={discountDetails ? "outline" : "default"}
                    className={discountDetails ? "border-green-500 text-green-500" : ""}
                  >
                    {couponLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : discountDetails ? (
                      "Applied"
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-sm text-red-500 mt-1">{couponError}</p>
                )}
                {discountDetails && (
                  <p className="text-sm text-green-600 mt-1">
                    You're saving ₹{discountDetails.discountApplied} with this coupon!
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="gstin" className="text-sm font-medium block mb-1">GSTIN (Optional)</label>
                <Input
                  id="gstin"
                  placeholder="Enter GSTIN number"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={proceedToPayment} 
              disabled={loading}
              className="w-full gap-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Pay Now <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center relative">
        <h2 className="text-[1.65rem] text-center mb-4">Simple Pricing, Great Value</h2>
        <p className="text-3xl font-semibold text-center mb-14">
          Every plan offers complete <span className="text-foreground">features access</span>
        </p>

        <div className="flex flex-col md:flex-row gap-10 justify-center items-center container relative">
          {plans.map((plan) => (
            <Card
              key={plan._id}
              className={`${plan.highlight || selectedPlan === plan.plan_name ? "border-primary" : ""} bg-card text-foreground w-[20rem] rounded-3xl p-2 ${plan.discount || selectedPlan === plan.plan_name ? "border-2 shadow-[0_8px_24px_rgba(119,_50,_187,_0.18)]" : "shadow-[0_8px_24px_rgba(0,_0,_0,_0.08)]"}`}
            >
              <CardHeader>
                <CardTitle className="text-xl mb-2 font-medium">{plan.name}</CardTitle>
                <div className="text-2xl font-semibold">
                  ₹ {plan.price}
                  {plan.period && <span className="text-sm font-normal">/{plan.period}</span>}
                </div>
                <div className="text-sm font-normal mt-1 text-gray-600">{plan.subtitle}</div>
                {selectedPlan === plan.plan_name && (
                  <div className="text-sm font-medium text-green-600 mt-2">You selected this plan</div>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
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
                  disabled={loading || (plan.plan_name === "one-week" && activePlan === "one-week")}
                  onClick={() => handleCheckout(plan)}
                >
                  {loading && plan.plan_name === activePlan ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;