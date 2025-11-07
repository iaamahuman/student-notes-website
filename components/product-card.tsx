import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: string;
  image: string;
  product_name: string;
  price: number;
  category: {};
}

interface ProductCardProps {
  product: Product;
  feature: Boolean;
}
const ProductCard: React.FC<ProductCardProps> = ({ product, feature }) => {
  const navigate = useRouter();

  return (
    <div className="bg-white shadow-md hover:shadow-xl rounded-xl overflow-hidden flex flex-col transition-all duration-300 group border border-gray-100">
      <div className="relative overflow-hidden bg-gray-50 aspect-square flex items-center justify-center">
        <Image
          src={product.image}
          width={200}
          height={200}
          alt="product"
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
          onClick={() => navigate.push(`/product/${product.id}`)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
      </div>
      <div className="flex flex-col justify-between p-4 flex-1">
        <div>
          <Link
            href={`/product/${product.id}`}
            className="font-semibold text-sm md:text-base text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors block"
          >
            {product.product_name}
          </Link>
        </div>
        {!feature && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-lg font-bold text-blue-600">₹{product.price}</p>
            <button
              onClick={() => navigate.push(`/product/${product.id}`)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View Details →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
