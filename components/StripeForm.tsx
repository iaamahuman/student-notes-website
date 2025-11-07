import { setCartData } from "@/redux/actions";
import { InitialState } from "@/redux/types";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const StripePaymentForm = ({
  orderData,
  customerName,
}: {
  orderData: any;
  customerName: string;
}) => {
  const stripe = useStripe();
  const dispatch = useDispatch();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const router = useRouter();
  const cartData = useSelector((state: InitialState) => state.cart);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await api.post("/payments/create-payment-intent", {
          amount: Math.round(orderData.total * 100),
          currency: "inr",
          metadata: {
            userId: orderData.userId,
            orderTotal: orderData.total.toString(),
          },
        });
        setClientSecret(response.data.clientSecret);
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn("Payment Intent endpoint not found, using legacy method");
          setClientSecret("legacy");
        } else {
          console.error("Error creating payment intent:", error);
          setPaymentError(
            error.response?.data?.message ||
              "Failed to initialize payment. Please try again."
          );
        }
      }
    };

    if (orderData.total > 0) {
      createPaymentIntent();
    }
  }, [orderData]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast.error("Payment system not ready. Please wait...");
      return;
    }

    setIsLoading(true);
    setPaymentError(null);
    toast.loading("Processing Payment...");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.dismiss();
      setPaymentError("Card element not found. Please refresh the page.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        toast.dismiss();
        setPaymentError(submitError.message || "Card validation failed.");
        setIsLoading(false);
        return;
      }

      if (clientSecret === "legacy") {
        const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: customerName,
          },
        });

        if (pmError) {
          toast.dismiss();
          setPaymentError(
            pmError.message || "Payment failed. Please check your card details."
          );
          setIsLoading(false);
          return;
        }

        try {
          await api.post("/payments/create-payment", {
            paymentMethodId: paymentMethod?.id,
            amount: orderData.total * 100,
          });

          const { data } = await api.post("/order/addorder", {
            ...orderData,
          });

          const sendData = {
            id: cartData.id,
            products: [],
          };
          await api.post(`/cart/update/${cartData.id}`, sendData);
          dispatch(setCartData({ products: [], id: "" }));

          toast.dismiss();
          toast.success("Payment successful! Order placed.");
          router.push(`/order/${data.id}`);
        } catch (error: any) {
          console.error("Error processing payment:", error);
          toast.dismiss();
          setPaymentError(
            error.response?.data?.message ||
              "An error occurred while processing the payment."
          );
          setIsLoading(false);
        }
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerName,
            },
          },
        }
      );

      if (error) {
        toast.dismiss();
        setPaymentError(
          error.message || "Payment failed. Please check your card details."
        );
        setIsLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        try {
          const { data } = await api.post("/order/addorder", {
            ...orderData,
            paymentIntentId: paymentIntent.id,
            paymentStatus: "succeeded",
          });

          const sendData = {
            id: cartData.id,
            products: [],
          };
          await api.post(`/cart/update/${cartData.id}`, sendData);
          dispatch(setCartData({ products: [], id: "" }));

          toast.dismiss();
          toast.success("Payment successful! Order placed.");
          router.push(`/order/${data.id}`);
        } catch (error: any) {
          console.error("Error creating order:", error);
          toast.dismiss();
          setPaymentError(
            "Payment succeeded but order creation failed. Please contact support."
          );
          setIsLoading(false);
        }
      } else {
        toast.dismiss();
        setPaymentError("Payment was not completed. Please try again.");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.dismiss();
      setPaymentError(
        error.message || "An unexpected error occurred. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 md:p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">
          Payment Information
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter your card details to complete the purchase
        </p>
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 focus-within:border-blue-500 focus-within:bg-white transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#1f2937",
                  fontFamily: "system-ui, sans-serif",
                  "::placeholder": {
                    color: "#9ca3af",
                  },
                },
                invalid: {
                  color: "#ef4444",
                },
              },
            }}
          />
        </div>
      </div>
      {!clientSecret && clientSecret !== "legacy" && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
          Initializing payment system...
        </div>
      )}
      {paymentError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <p className="font-semibold mb-1">Payment Error</p>
          <p>{paymentError}</p>
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 font-medium mb-1">
          💳 Test Card Details:
        </p>
        <p className="text-xs text-blue-700">
          Card Number: <span className="font-mono">4242 4242 4242 4242</span>
        </p>
        <p className="text-xs text-blue-700">
          Use any future expiry date, any CVC, and any ZIP code
        </p>
      </div>
      <button
        type="submit"
        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
        disabled={!stripe || isLoading || !clientSecret}
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
            Processing Payment...
          </span>
        ) : (
          `Pay ₹${orderData.total} & Place Order`
        )}
      </button>
    </form>
  );
};

export default StripePaymentForm;
