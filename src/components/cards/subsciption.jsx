"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
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

const SubscriptionPlan = ({ selectedPlan: initialSelectedPlan, onCloseDialog }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [gstin, setGstin] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [discountDetails, setDiscountDetails] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const isRazorpayLoaded = useRazorpay();

  // Memoize derived values
  const finalAmount = useMemo(() => 
    discountDetails ? discountDetails.finalAmount : selectedPlan?.plan_total_price, 
    [discountDetails, selectedPlan]
  );

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsLoggedIn(true);
    setActivePlan(Cookies.get("plan"));
    fetchUserProfile(token);
    fetchPlans();
  }, [router]);

  const fetchUserProfile = async (token) => {
    try {
      const { data } = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfile(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch user profile.", variant: "destructive" });
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/plans`);
      setPlans(data.plans);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch plans.", variant: "destructive" });
    }
  };

  const handlePaymentSuccess = async (response, planName) => {
    setLoading(true);
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${API_URL}/payment/payment-success`,
        { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan: planName, couponCode, gstin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        router.push(`/payment-success?reference=${data.reference}&plan=${data.plan}`);
      } else {
        throw new Error(data.error || "Payment verification failed.");
      }
    } catch (error) {
      toast({ title: "Error", description: error.message || "Payment verification failed.", variant: "destructive" });
    } finally {
      setLoading(false);
      setShowCheckout(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (couponCode.length > 15) {
      setCouponError("Coupon code must be 15 characters or less");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${API_URL}/payment/checkout`,
        { amount: selectedPlan.plan_total_price, plan: selectedPlan.plan_name, couponCode, gstin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setDiscountDetails({
          originalPrice: selectedPlan.plan_total_price,
          discountApplied: data.discountApplied,
          finalAmount: data.finalAmount,
          percentOff: Math.round((data.discountApplied / selectedPlan.plan_total_price) * 100),
        });
        toast({ title: "Success", description: "Coupon applied successfully!", variant: "default" });
      } else {
        throw new Error(data.error || "Failed to apply coupon.");
      }
    } catch (error) {
      setDiscountDetails(null);
      setCouponError(error.response?.data?.error || error.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const clearCoupon = () => {
    setCouponCode("");
    setDiscountDetails(null);
    setCouponError("");
  };

  const handleCheckout = (plan) => {
    if (plan.plan_name === "one-week") {
      router.push("/dashboard");
      return;
    }
    setSelectedPlan(plan);
    clearCoupon(); // Clear coupon when switching plans
    setGstin("");
    setShowCheckout(true);
  };

  const proceedToPayment = async () => {
    if (!isRazorpayLoaded || !window.Razorpay) {
      toast({ title: "Error", description: "Payment system is not ready. Please try again later.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const { data: { key } } = await axios.get(`${API_URL}/get-key`);
      const { data: { order } } = await axios.post(
        `${API_URL}/payment/checkout`,
        { amount: selectedPlan.plan_total_price, plan: selectedPlan.plan_name, couponCode: discountDetails ? couponCode : "", gstin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        image: "/tb_logo.svg",
        name: "Tradeboard",
        description: `${selectedPlan.plan_name} Subscription`,
        order_id: order.id,
        handler: (response) => handlePaymentSuccess(response, selectedPlan.plan_name),
        prefill: { name: userProfile?.name || "", email: userProfile?.email || "", contact: userProfile?.phone?.replace("+91", "") || "" },
        notes: { gstin: gstin || "Not Provided" },
        theme: { color: "#a073f0" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", (response) =>
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" })
      );
      if (onCloseDialog) onCloseDialog();
      paymentObject.open();
    } catch (error) {
      toast({
        title: "Payment Error",
        description: error.response?.data?.error || error.message || "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const goBackToPlans = () => {
    setShowCheckout(false);
    clearCoupon();
    setGstin("");
  };

  if (!isLoggedIn) return null;

  if (showCheckout) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={goBackToPlans}
            className="mb-6 text-muted-foreground flex items-center hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Checkout: {selectedPlan?.name}</h2>
            <p className="text-muted-foreground text-sm">Complete your purchase or apply a coupon for discounts.</p>
          </div>

          <Card className="border shadow-md rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Order Summary</CardTitle>
                <Tag className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Plan Price</span>
                  <span className="font-semibold">₹ {selectedPlan?.plan_total_price}</span>
                </div>

                {discountDetails && (
                  <div className="flex justify-between items-center text-green-600 text-sm">
                    <span className="font-medium flex items-center">
                      <Sparkles className="mr-1 h-4 w-4" />
                      Coupon Discount ({discountDetails.percentOff}% off)
                    </span>
                    <span className="font-semibold">-₹ {discountDetails.discountApplied.toFixed(2)}</span>
                  </div>
                )}

                {discountDetails && <div className="h-px bg-gray-200 my-1" />}

                <div className="flex justify-between items-center font-bold text-base">
                  <span>Total</span>
                  <span>₹ {finalAmount.toFixed(2)}</span>
                </div>

                {finalAmount < 1 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Note: Minimum payable amount is ₹1 as per payment gateway rules.
                  </p>
                )}
              </div>

              <div className="h-px bg-gray-200" />

              <div className="space-y-6">
                <div>
                  <label htmlFor="coupon" className="text-sm font-medium block mb-1">Coupon Code</label>
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
                        maxLength={15}
                        className={`pr-8 text-sm ${couponError ? "border-red-500 focus-visible:ring-red-500" : ""} ${discountDetails ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                        disabled={discountDetails !== null || couponLoading}
                      />
                      {couponCode && !discountDetails && (
                        <button
                          onClick={clearCoupon}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
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
                      className={`text-sm ${discountDetails ? "border-green-500 text-green-500" : ""}`}
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : discountDetails ? "Applied" : "Apply"}
                    </Button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  {discountDetails && (
                    <p className="text-xs text-green-600 mt-1">You saved ₹{discountDetails.discountApplied.toFixed(2)}!</p>
                  )}
                </div>

                <div>
                  <label htmlFor="gstin" className="text-sm font-medium block mb-1">
                    GSTIN (Optional)
                    <span className="text-xs text-muted-foreground ml-1">(e.g., 22AAAAA0000A1Z5)</span>
                  </label>
                  <Input
                    id="gstin"
                    placeholder="GSTIN"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    maxLength={15}
                    className="w-full text-sm uppercase"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                onClick={proceedToPayment}
                disabled={loading}
                className="w-full gap-1 text-sm transition-all hover:scale-105 active:scale-95"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Pay Now <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-5xl">
        <h2 className="text-xl sm:text-2xl md:text-[1.65rem] text-center mb-4 font-semibold">Simple Pricing, Great Value</h2>
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-10 md:mb-14">
          Every plan offers complete <span className="text-foreground">feature access</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 justify-items-center">
          {plans.map((plan, index) => (
            <Card
              key={plan._id}
              className={`w-full max-w-[20rem] rounded-3xl p-2 transition-all duration-300 hover:shadow-lg ${
                plan.highlight || initialSelectedPlan === plan.plan_name
                  ? "border-primary border-2 shadow-[0_8px_24px_rgba(119,_50,_187,_0.18)]"
                  : "shadow-[0_8px_24px_rgba(0,_0,_0,_0.08)]"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl mb-2 font-medium">
                  {plan.name} {index === 0 && <span className="text-green-600 text-xs font-normal">(Free)</span>}
                </CardTitle>
                <div className="text-xl sm:text-2xl font-semibold">
                  {index === 0 ? "₹ 0" : `₹ ${plan.price}`}
                  {plan.period && <span className="text-xs sm:text-sm font-normal">/{plan.period}</span>}
                </div>
                <div className="text-xs sm:text-sm font-normal mt-1 text-muted-foreground">{plan.subtitle}</div>
                {initialSelectedPlan === plan.plan_name && (
                  <div className="text-xs sm:text-sm font-medium text-green-600 mt-2">You selected this plan</div>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm">
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
                  className="w-full h-10 text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                  variant={index === 0 ? "outline" : plan.buttonVariant}
                  disabled={index === 0 || loading || (plan.plan_name === "one-week" && activePlan === "one-week")}
                  onClick={() => handleCheckout(plan)}
                >
                  {index === 0 ? "Free Plan" : loading && plan.plan_name === activePlan ? <Loader2 className="h-4 w-4 animate-spin" /> : plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// Optional: Add PropTypes for better type checking
SubscriptionPlan.propTypes = {
  selectedPlan: PropTypes.string,
  onCloseDialog: PropTypes.func,
};

export default SubscriptionPlan;