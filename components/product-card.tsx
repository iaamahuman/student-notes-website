import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  image: string;
  product_name: string;
  price: number;
  category: {};
}

const ProductCard: React.FC<{ product: Product; feature: Boolean }> = ({ product, feature }) => {
  const navigate = useRouter();

  return (
    <div
      className="group flex flex-col rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md bg-white border border-gray-100 hover:border-gray-300"
      onClick={() => navigate.push(`/product/${product.id}`)}
    >
      <div className="relative aspect-square bg-[#f9f7f4] flex items-center justify-center overflow-hidden p-4">
        <Image
          src={product.image}
          width={200}
          height={200}
          alt="product"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3 border-t border-gray-100">
        <p className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-gray-600 transition-colors">
          {product.product_name}
        </p>
        {!feature && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-base font-black text-gray-900">₹{product.price}</p>
            <span className="text-xs font-bold text-[#c8a96e]">Add →</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
