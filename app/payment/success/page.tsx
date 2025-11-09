"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { setCartData } from "@/redux/actions";
import { InitialState } from "@/redux/types";
import { toast } from "react-hot-toast";
import Link from "next/link";

const PaymentSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const orderData = useSelector((state: InitialState) => state.order);
  const cartData = useSelector((state: InitialState) => state.cart);
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (processingRef.current) return;
    if (!sessionId) {
      setError("Invalid payment session");
      setIsProcessing(false);
      return;
    }

    const processedKey = `payment_processed_${sessionId}`;
    if (localStorage.getItem(processedKey)) {
      const storedOrderId = localStorage.getItem(`order_id_${sessionId}`);
      if (storedOrderId) {
        setOrderId(storedOrderId);
        setIsProcessing(false);
        return;
      }
    }

    processingRef.current = true;

    const currentOrderData = orderData;
    const currentCartData = cartData;

    const processPayment = async () => {

      try {
        const sessionResponse = await api.post(
          "/payments/verify-session",
          {
            sessionId: sessionId,
          }
        );

        if (sessionResponse.data.paymentStatus === "paid") {
          let orderPayload;
          
          let paymentIntentId = sessionId;
          if (sessionResponse.data.paymentIntent) {
            if (typeof sessionResponse.data.paymentIntent === "string") {
              paymentIntentId = sessionResponse.data.paymentIntent;
            } else if (typeof sessionResponse.data.paymentIntent === "object" && sessionResponse.data.paymentIntent.id) {
              paymentIntentId = sessionResponse.data.paymentIntent.id;
            }
          }
          
          if (sessionResponse.data.metadata?.orderData) {
            orderPayload = {
              ...JSON.parse(sessionResponse.data.metadata.orderData),
              paymentIntentId: paymentIntentId,
              paymentStatus: "succeeded",
            };
          } else if (currentOrderData && currentOrderData.products && currentOrderData.products.length > 0) {
            orderPayload = {
              ...currentOrderData,
              paymentIntentId: paymentIntentId,
              paymentStatus: "succeeded",
            };
          } else {
            setError("Order data not found. Please contact support.");
            setIsProcessing(false);
            processingRef.current = false;
            return;
          }

          const { data } = await api.post("/order/addorder", orderPayload);
          setOrderId(data.id);
          
          localStorage.setItem(`payment_processed_${sessionId}`, "true");
          localStorage.setItem(`order_id_${sessionId}`, data.id);

          if (currentCartData.id) {
            const sendData = {
              id: currentCartData.id,
              products: [],
            };
            await api.post(`/cart/update/${currentCartData.id}`, sendData);
            dispatch(setCartData({ products: [], id: "" }));
          }

          toast.success("Payment successful! Order placed.");
          setIsProcessing(false);
        } else {
          setError("Payment was not successful");
          setIsProcessing(false);
          processingRef.current = false;
        }
      } catch (error: any) {
        console.error("Error processing payment:", error);
        setError(
          error.response?.data?.message ||
            "An error occurred while processing your payment."
        );
        setIsProcessing(false);
        processingRef.current = false;
      }
    };

    processPayment();
  }, [sessionId, dispatch]);

  if (isProcessing) {
    return (
      <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Processing your payment...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/order"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully.
        </p>
        {orderId && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <p className="text-lg font-semibold text-gray-800">{orderId}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Link
            href={orderId ? `/order/${orderId}` : "/settings/myorders"}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Order
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess;

