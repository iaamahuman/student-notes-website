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
    <main className="min-h-screen w-full flex flex-col items-center bg-white">
      {/* Hero Banner */}
      <section className="w-full relative overflow-hidden bg-[#f8f4ef]">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <p className="text-xs font-bold tracking-widest uppercase text-[#c8a96e] mb-4">Premium Stationery Store</p>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-5" style={{ fontFamily: "Georgia, serif" }}>
              Tools That Bring<br />
              <span className="text-[#c8a96e]">Ideas to Life</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md leading-relaxed">
              Quality notebooks, pens & stationery for every student and professional.
            </p>
            <div className="flex gap-4">
              <a href="/product" className="px-8 py-3.5 rounded-md font-bold text-sm bg-gray-900 text-white hover:bg-gray-700 transition-all">
                Shop Now
              </a>
              <a href="/product" className="px-8 py-3.5 rounded-md font-bold text-sm border border-gray-300 text-gray-700 hover:border-gray-900 transition-all">
                View All
              </a>
            </div>
          </div>
          <div className="flex-1">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={require("../public/homeImage.png")}
                alt="Student Note Books"
                className="w-full object-cover"
                style={{ maxHeight: "420px", objectFit: "cover" }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {[
            { value: "500+", label: "Products" },
            { value: "1000+", label: "Happy Students" },
            { value: "24hr", label: "Fast Delivery" },
            { value: "100%", label: "Quality Assured" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4 py-2">
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="w-[95%] md:w-[90%] max-w-7xl py-12">
        <Featured />
        {data && data.map((category: { id: string; name: string; products: Product[] }) => {
          if (category.products.length > 0)
            return <ProductCategoryWise key={category.id} title={category.name} products={category.products} />;
        })}
        <Faqs />
      </section>
    </main>
  );
};

export default Home;
