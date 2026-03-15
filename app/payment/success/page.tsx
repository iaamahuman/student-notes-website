"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { setCartData } from "@/redux/actions";
import { InitialState } from "@/redux/types";
import { toast } from "react-hot-toast";
import Link from "next/link";

const PaymentSuccess = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const cartData = useSelector((state: InitialState) => state.cart);
  const orderData = useSelector((state: InitialState) => state.order);
  const [isProcessing, setIsProcessing] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processOrder = async () => {
      try {
        const txnid = searchParams.get("txnid") || `TXN${Date.now()}`;
        const status = searchParams.get("status") || "success";

        if (status !== "success" && status !== "Success") {
          setError("Payment was not successful");
          setIsProcessing(false);
          return;
        }

        const savedOrder = localStorage.getItem("pendingOrder");
        const currentOrder = savedOrder ? JSON.parse(savedOrder) : orderData;

        if (!currentOrder || !currentOrder.products || currentOrder.products.length === 0) {
          setError("Order data not found. Please contact support.");
          setIsProcessing(false);
          return;
        }

        const orderPayload = {
          ...currentOrder,
          paymentIntentId: txnid,
          paymentStatus: "succeeded",
        };

        const { data } = await api.post("/order/addorder", orderPayload);
        setOrderId(data.id);

        localStorage.removeItem("pendingOrder");

        if (cartData.id) {
          await api.post(`/cart/update/${cartData.id}`, {
            id: cartData.id,
            products: [],
          });
          dispatch(setCartData({ products: [], id: "" }));
        }

        toast.success("Payment successful! Order placed.");
        setIsProcessing(false);
      } catch (error: any) {
        console.error("Error processing order:", error);
        setError("An error occurred while placing your order.");
        setIsProcessing(false);
      }
    };

    processOrder();
  }, []);

  if (isProcessing) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Processing your payment...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/order" className="px-6 py-3 bg-blue-600 text-white rounded-lg">Try Again</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <svg className="mx-auto h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
        {orderId && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <p className="text-lg font-semibold text-gray-800">{orderId}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Link href={orderId ? `/order/${orderId}` : "/settings/myorders"} className="px-6 py-3 bg-blue-600 text-white rounded-lg">View Order</Link>
          <Link href="/" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg">Continue Shopping</Link>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess;
