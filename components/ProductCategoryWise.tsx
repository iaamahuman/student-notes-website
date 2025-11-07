"use client";
import ProductCard from "@/components/product-card";
import { Separator } from "@/components/ui/separator";
import { Zap } from "lucide-react";
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

const ProductCategoryWise = ({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) => {
  return (
    <div className="mb-12">
      <div className="flex items-center mb-2">
        <Zap className="mr-2 h-5 w-5 md:h-6 md:w-6 text-blue-500 fill-blue-500" />
        <p className="md:text-2xl text-xl font-bold text-gray-800">{title}</p>
      </div>
      <Separator className="my-4" />
      <div className="grid md:grid-cols-5 md:gap-6 grid-cols-2 gap-4">
        {products &&
          products.map((product: Product) => {
            if (product.visible) {
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  feature={true}
                />
              );
            }
          })}
      </div>
    </div>
  );
};

export default ProductCategoryWise;
