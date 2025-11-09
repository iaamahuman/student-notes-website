"use client";

import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "react-hot-toast";

const StripePaymentForm = ({
  orderData,
  customerName,
  customerEmail,
}: {
  orderData: any;
  customerName: string;
  customerEmail?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!orderData || orderData.total <= 0) {
      toast.error("Invalid order data");
      return;
    }

    setIsLoading(true);
    setPaymentError(null);
    toast.loading("Redirecting to Stripe...");

    try {
      const response = await api.post("/payments/create-checkout-session", {
        amount: orderData.total,
        orderData,
        customerEmail,
      });

      if (response.data?.url) {
        toast.dismiss();
        window.location.href = response.data.url;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast.dismiss();
      setPaymentError(
        error.response?.data?.error ||
          error.message ||
          "Payment initialization failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Payment Information</h3>
        <p className="text-sm text-gray-500 mb-4">
          Click below to complete your INR payment securely through Stripe.
        </p>
      </div>

      {paymentError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <p className="font-semibold mb-1">Payment Error</p>
          <p>{paymentError}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 font-medium mb-1">💳 Secure Payment</p>
        <p className="text-xs text-blue-700">
          You will be redirected to Stripe's secure payment page to complete your INR purchase.
        </p>
      </div>

      <button
        type="button"
        onClick={handleCheckout}
        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
        disabled={isLoading || !orderData || orderData.total <= 0}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Redirecting...
          </span>
        ) : (
          `Pay ₹${orderData.total} & Place Order`
        )}
      </button>
    </div>
  );
};

export default StripePaymentForm;
