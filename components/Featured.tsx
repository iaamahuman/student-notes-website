"use client";
import ProductCard from "@/components/product-card";
import { api } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ProductLoadingSkeleton from "@/components/ProductLoadingSkeleton";

interface Product {
  id: string;
  image: string;
  product_name: string;
  price: number;
  visible: Boolean;
  featured: Boolean;
  category: String;
}

const Featured = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) getData();
  }, [loading]);

  const getData = async () => {
    try {
      const resp = await api.post("/product/getproducts");
      setProducts(resp.data);
      setLoading(false);
      toast.dismiss();
    } catch (error: any) {
      setLoading(false);
      toast.dismiss();
    }
  };

  return (
    <div className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#c8a96e] mb-1">Handpicked</p>
          <p className="text-2xl md:text-3xl font-black text-gray-900">Featured Products</p>
        </div>
        <a href="/product" className="px-5 py-2.5 rounded-md text-sm font-bold border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all">
          View All →
        </a>
      </div>
      <div className="grid md:grid-cols-5 md:gap-5 grid-cols-2 gap-3">
        {!loading && products && products.map((product: Product) => {
          if (product.visible && product.featured)
            return <ProductCard key={product.id} product={product} feature={true} />;
        })}
        {loading && Array(10).fill(0).map((_, i) => <ProductLoadingSkeleton key={i} />)}
      </div>
    </div>
  );
};

export default Featured;
