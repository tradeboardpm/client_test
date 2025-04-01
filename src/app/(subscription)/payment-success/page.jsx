"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";

const PaymentSuccessContent = () => {
  const searchQuery = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5); // Countdown state for redirection

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [router]);

  if (!searchQuery) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  const reference = searchQuery.get("reference");
  const plan = searchQuery.get("plan");

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-500 scale-100 hover:scale-105 animate-fade-in">
        {/* Header with Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
        </div>

        {/* Thank You Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-center text-green-600 mb-4">
          Thank You!
        </h1>
        <p className="text-lg md:text-xl text-center text-gray-700 mb-6">
          Your subscription to the{" "}
          <span className="font-semibold text-primary capitalize">{plan || "plan"}</span> is now active. Welcome aboard!
        </p>

        {/* Payment Details */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-inner">
          <p className="text-md md:text-lg text-gray-800">
            <span className="font-medium">Reference ID:</span>{" "}
            <span className="text-primary font-semibold">
              {reference || "N/A"}
            </span>
          </p>
          <p className="text-md md:text-lg text-gray-800">
            <span className="font-medium">Plan:</span>{" "}
            <span className="text-primary font-semibold capitalize">
              {plan || "Not specified"}
            </span>
          </p>
        </div>

        {/* Countdown and Redirect */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Redirecting to your dashboard in{" "}
            <span className="font-semibold text-primary">{countdown}</span> seconds...
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-300"
          >
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentSuccess = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-gray-500 animate-pulse">Loading...</div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
};

// Add custom CSS for animations (if not using Tailwind keyframes already)
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default PaymentSuccess;