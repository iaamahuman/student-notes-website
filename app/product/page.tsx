"use client";
import ProductLoadingSkeleton from "@/components/ProductLoadingSkeleton";
import ProductCard from "@/components/product-card";
import { api } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type Category = { id: string; name: string; createdAt: string; updatedAt: string; };
type Product = { id: string; product_name: string; product_description: string; price: number; quantity: number; image: string; createdAt: string; updatedAt: string; category: string; featured: boolean; visible: boolean; Category: Category; };

const Products = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ name: "", type: "" });
  const [data, setData] = useState<Product[]>([]);
  const [backupData, setBackupData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await api.post("/product/getproducts");
        setData(data);
        setBackupData(data);
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        toast.error(error.message);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (search !== "") {
      setData(backupData.filter(item => item.product_name.toLowerCase().includes(search.toLowerCase())));
    } else {
      setData(backupData);
    }
  }, [search, backupData]);

  useEffect(() => {
    if (filter.name === "price") {
      let sorted = [...backupData];
      sorted.sort((a, b) => filter.type === "low" ? a.price - b.price : b.price - a.price);
      setData(sorted);
    } else {
      setData(backupData);
    }
  }, [filter, backupData]);

  return (
    <main className="min-h-screen w-full" style={{ background: "linear-gradient(135deg, #fff7ed 0%, #fdf2f8 50%, #eff6ff 100%)" }}>
      {/* Header */}
      <div className="w-full py-12 px-6 text-center" style={{ background: "linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)" }}>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: "Georgia, serif" }}>All Products</h1>
        <p className="text-white opacity-80 text-lg">Browse our complete stationery collection</p>
      </div>

      <section className="w-full md:w-[90%] max-w-7xl mx-auto px-4 py-8">
        {/* Search + Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-8 p-4 rounded-2xl" style={{ background: "white", boxShadow: "0 4px 20px rgba(249,115,22,0.1)" }}>
          <input
            placeholder="🔍  Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-orange-100 focus:outline-none focus:border-orange-400 text-gray-700"
            style={{ background: "#fff7ed" }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter({ type: "low", name: "price" })}
              className="px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: filter.type === "low" ? "linear-gradient(135deg, #f97316, #ec4899)" : "#fff7ed", color: filter.type === "low" ? "white" : "#f97316" }}
            >
              ↑ Price
            </button>
            <button
              onClick={() => setFilter({ type: "high", name: "price" })}
              className="px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: filter.type === "high" ? "linear-gradient(135deg, #f97316, #ec4899)" : "#fff7ed", color: filter.type === "high" ? "white" : "#f97316" }}
            >
              ↓ Price
            </button>
            {filter.name && (
              <button
                onClick={() => setFilter({ name: "", type: "" })}
                className="px-4 py-3 rounded-xl text-sm font-bold"
                style={{ background: "#fee2e2", color: "#ef4444" }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Product count */}
        {!loading && (
          <p className="text-sm font-semibold text-gray-500 mb-6">
            Showing <span style={{ color: "#f97316" }}>{data.length}</span> products
          </p>
        )}

        {!loading && data.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl font-bold text-gray-700 mb-2">No products found</p>
            <p className="text-gray-400">{search ? "Try a different search term" : "Check back later"}</p>
          </div>
        )}

        <section className="grid md:grid-cols-5 grid-cols-2 gap-4 md:gap-6">
          {!loading && data && data.map((item: Product) => (
            <ProductCard feature={false} product={item} key={item.id} />
          ))}
          {loading && Array(10).fill(0).map((_, i) => <ProductLoadingSkeleton key={i} />)}
        </section>
      </section>
    </main>
  );
};

export default Products;
