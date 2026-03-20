"use client";
import ProductCard from "@/components/product-card";
import React from "react";

interface Product {
  id: string;
  image: string;
  product_name: string;
  price: number;
  visible: Boolean;
  featured: Boolean;
  category: String;
}

const ProductCategoryWise = ({ title, products }: { title: string; products: Product[] }) => {
  return (
    <div className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-[#c8a96e] mb-1">Category</p>
          <p className="text-2xl md:text-3xl font-black text-gray-900">{title}</p>
        </div>
        <a href="/product" className="px-5 py-2.5 rounded-md text-sm font-bold border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all">
          View All →
        </a>
      </div>
      <div className="grid md:grid-cols-5 md:gap-5 grid-cols-2 gap-3">
        {products && products.map((product: Product) => {
          if (product.visible)
            return <ProductCard key={product.id} product={product} feature={true} />;
        })}
      </div>
    </div>
  );
};

export default ProductCategoryWise;
