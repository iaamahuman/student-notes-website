"use client";
import ProductLoadingSkeleton from "@/components/ProductLoadingSkeleton";
import ProductCard from "@/components/product-card";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type Product = {
  id: string;
  product_name: string;
  product_description: string;
  price: number;
  quantity: number;
  image: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  featured: boolean;
  visible: boolean;
  Category: Category;
};

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
      const updatedData = backupData.filter((item) =>
        item.product_name.toLowerCase().includes(search.toLowerCase())
      );
      setData(updatedData);
    } else {
      setData(backupData);
    }
  }, [search, backupData]);

  useEffect(() => {
    if (filter.name === "price") {
      let updatedData = [...backupData];
      if (filter.type === "low") {
        updatedData.sort((a, b) => a.price - b.price);
      } else if (filter.type === "high") {
        updatedData.sort((a, b) => b.price - a.price);
      }
      setData(updatedData);
    } else {
      setData(backupData);
    }
  }, [filter, backupData]);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white py-8">
      <section className="w-full md:w-[90%] max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            All Products
          </h1>
          <p className="text-gray-500">Browse our complete product catalog</p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-200">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md border-2 focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by Price</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setFilter({ type: "low", name: "price" })}
              >
                Low To High
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter({ type: "high", name: "price" })}
              >
                High To Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {!loading && data.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-2">No products found</p>
            <p className="text-sm text-gray-400">
              {search ? "Try a different search term" : "Check back later for new products"}
            </p>
          </div>
        )}
        <section className="grid md:grid-cols-5 grid-cols-2 gap-4 md:gap-6">
        {!loading &&
          data &&
          data.map((item: Product) => {
            return <ProductCard feature={false} product={item} key={item.id} />;
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
          </>
        )}
        </section>
      </section>
    </main>
  );
};

export default Products;
