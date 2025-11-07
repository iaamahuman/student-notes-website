"use client";
import StripePaymentForm from "@/components/StripeForm";
import { Button } from "@/components/ui/button";
import { setCartData } from "@/redux/actions";
import { InitialState, OrderProduct } from "@/redux/types";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

const Order = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const orderData = useSelector((state: InitialState) => state.order);
  const userData = useSelector((state: InitialState) => state.userData);
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phoneno: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
  });
  useEffect(() => {
    if (orderData.products.length == 0) {
      router.replace("/");
    }
  }, [orderData.products.length, router]);

  useEffect(() => {
    const getUserProfile = async () => {
      const resp = await api.post("/profile/get", {
        id: userData.id,
      });
      setUserProfile(resp.data.user);
      if (!resp.data.user.address) {
        toast("Complete Profile Details");
        router.push("/settings/profile");
      }
    };

    userData.id && getUserProfile();
  }, [router, userData]);

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <section className="md:container md:w-[90%] w-[95%] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-center text-gray-500">
            Review your order and complete payment
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Order Summary
                </h2>
                <span className="text-sm text-gray-500">
                  {orderData.products.length} item
                  {orderData.products.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-4">
                {orderData &&
                  orderData.products.map((item) => {
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Quantity</p>
                            <p className="font-semibold text-gray-800">
                              {item.quantity}
                            </p>
                          </div>
                          <div className="text-center min-w-[80px]">
                            <p className="text-xs text-gray-500">Price</p>
                            <p className="font-semibold text-gray-800">
                              ₹{item.price}
                            </p>
                          </div>
                          <div className="text-center min-w-[100px]">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="font-bold text-blue-600">
                              ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold text-gray-700">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{orderData.total}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>Total Items:</span>
                  <span>
                    {orderData.products.reduce(
                      (sum: number, item: OrderProduct) => sum + item.quantity,
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Delivery Information
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/settings/profile")}
                >
                  Edit
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-gray-800">{userProfile.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.phoneno}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pincode</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.pincode}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.address}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">City</p>
                  <p className="font-medium text-gray-800">{userProfile.city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">State</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.state}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Country</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Payment
              </h2>
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  orderData={orderData}
                  customerName={userData.name}
                />
              </Elements>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Order;
