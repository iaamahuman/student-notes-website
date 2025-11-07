"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Faqs from "@/components/faqs";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import ProductCategoryWise from "@/components/ProductCategoryWise";
import Featured from "@/components/Featured";

interface Product {
  id: string;
  image: string;
  product_name: string;
  price: number;
  visible: Boolean;
  featured: Boolean;
  category: String;
}

const Home = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const getCategoryData = async () => {
      try {
        const resp = await api.post("/category/getcategory");
        setData(resp.data);
      } catch (error: any) {
        toast.error("Something Went Wrong!");
      }
    };
    getCategoryData();
  }, []);
  return (
    <main className="min-h-screen w-full flex bg-gradient-to-b from-gray-50 to-white flex-col items-center">
      <section className="w-[95%] md:w-[90%] mb-6">
        <div className="w-full my-8 md:my-12 flex justify-center">
          <div className="relative w-full max-w-6xl rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={require("../public/homeImage.png")}
              alt="main image"
              className="w-full md:h-[400px] object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                Welcome to Ecommercely
              </h1>
              <p className="text-sm md:text-lg opacity-90">
                Discover amazing products at unbeatable prices
              </p>
            </div>
          </div>
        </div>
        <Featured />
        {data &&
          data.map(
            (category: { id: string; name: string; products: Product[] }) => {
              if (category.products.length > 0)
                return (
                  <ProductCategoryWise
                    key={category.id}
                    title={category.name}
                    products={category.products}
                  />
                );
            }
          )}
        <Faqs />
      </section>
    </main>
  );
};

export default Home;
