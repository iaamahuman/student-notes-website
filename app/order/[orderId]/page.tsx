"use client";
import dateFormaterHandler from "@/helper/DateFormatter";
import { InitialState } from "@/redux/types";
import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { useSelector } from "react-redux";

type OrderData = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  total: number;
  products: [];
};

const GetOrder = () => {
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData>({
    id: "",
    status: "",
    createdAt: "",
    updatedAt: "",
    userId: "",
    total: 0,
    products: [],
  });
  const param = useParams();
  const router = useRouter();
  const userData = useSelector((state: InitialState) => state.userData);
  useEffect(() => {
    const getOrderDatahandler = async () => {
      try {
        const { data } = await api.post(
          `/order/getorder/${param.orderId}`
        );
        if (userData.id === data.userId) {
          setOrderData({
            ...data,
            createdAt: dateFormaterHandler(data.createdAt),
          });
        } else {
          toast.error("Unauthorized User");
          router.replace("/");
        }
        setLoading(false);
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    userData.id !== "" && getOrderDatahandler();
  }, [param.orderId, userData, router]);

  return (
    <section className="w-full h-[90vh] flex justify-center items-center">
      {!loading && orderData.id !== "" && (
        <section className="mx-auto py-8 md:container w-[90%] md:w-[75%] md:min-h-[50vh] rounded-md border px-4 flex justify-evenly items-center flex-col-reverse md:flex-row">
          <div>
            {/* Order Status Timeline */}
<div className="mb-6">
  <p className="font-bold text-lg mb-4">Order Status</p>
  <div className="flex items-center gap-2">
    {["Pending", "Shipping", "Delivered", "Cancelled"].map((step, index) => {
  const steps = ["Pending", "Shipping", "Delivered", "Cancelled"];
      const currentIndex = steps.indexOf(orderData.status);
      const isCompleted = index <= currentIndex;
      return (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"}`}>
              {index + 1}
            </div>
            <p className={`text-xs mt-1 ${isCompleted ? "text-gray-900 font-semibold" : "text-gray-400"}`}>{step}</p>
          </div>
          {index < 3 && <div className={`h-1 w-8 mx-1 mb-4 ${index < currentIndex ? "bg-gray-900" : "bg-gray-200"}`} />}
        </div>
      );
    })}
  </div>
</div>
            <div className="w-full flex justify-start items-start mt-6 mb-4 border-b pb-2">
              <p className="w-3/4 font-semibold text-sm md:text-base">
                Product
              </p>
              <p className="w-1/4 font-semibold text-sm md:text-base">Total</p>
            </div>
            {orderData &&
              orderData.products.map((item: any) => {
                return (
                  <div
                    key={item.productId}
                    className="w-full flex justify-start items-start my-2"
                  >
                    <p className="w-3/4 cursor-pointer text-xs md:text-sm">
                      <Link href={`/product/${item.productId}`} target="_blank">
                        {item.name}
                      </Link>
                    </p>
                    <p className="w-1/4 text-xs md:text-sm">
                      {item.quantity} x ₹{item.price}
                    </p>
                  </div>
                );
              })}
            <div className="w-full flex justify-start items-start mt-4 mb-4">
              <p className="w-3/4 font-semibold text-sm md:text-base">
                Subtotal
              </p>
              <p className="w-1/4 font-semibold text-sm md:text-base">
                {orderData.total}
              </p>
            </div>
            <p className="mt-6 mb-2 text-sm md:text-base">
              <span className="font-semibold">Order Placed:</span>{" "}
              {orderData.createdAt}
            </p>
          </div>
          <div className="flex justify-center items-center mb-8 md:mb-0">
            <Image
              src={require("@/public/deliveryTruck.png")}
              alt="Delivery Truck"
              width={400}
              height={300}
            />
          </div>
        </section>
      )}
      {loading && (
        <div className="min-h-[90vh] w-full flex justify-center items-center">
          <Oval
            height={30}
            width={30}
            color="#272d40"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#272d40"
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        </div>
      )}
    </section>
  );
};

export default GetOrder;
