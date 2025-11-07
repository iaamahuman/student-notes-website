"use client";
import ProductCard from "@/components/product-card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
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
  const navigate = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (loading) {
      getData();
    }
  }, [loading]);
  const getData = async (): Promise<void> => {
    try {
      const resp = await api.post("/product/getproducts");
      setProducts(resp.data);
      setLoading(false);
      toast.dismiss();
    } catch (error: any) {
      setProducts([]);
      setLoading(false);
      toast.dismiss();
      toast.error("Something Went Wrong!");
    }
  };
  return (
    <div className="mb-12">
      <div className="flex items-center mb-2">
        <Star className="mr-2 h-5 w-5 md:h-6 md:w-6 text-yellow-500 fill-yellow-500" />
        <p className="md:text-2xl text-xl font-bold text-gray-800">
          Featured Products
        </p>
      </div>
      <Separator className="my-4" />
      <div className="grid md:grid-cols-5 md:gap-6 grid-cols-2 gap-4">
        {!loading &&
          products &&
          products.map((product: Product) => {
            if (product.visible && product.featured)
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  feature={true}
                />
              );
          })}
        {loading && (
          <>
            <ProductLoadingSkeleton />
            <ProductLoadingSkeleton />
            <ProductLoadingSkeleton />
            <ProductLoadingSkeleton />
            <ProductLoadingSkeleton />
            <ProductLoadingSkeleton />
            <ProductLoadingSkeleton />
            <ProductLoadingSkeleton />
            <ProductLoadingSkeleton />
            <ProductLoadingSkeleton />
          </>
        )}
      </div>
    </div>
  );
};

export default Featured;
