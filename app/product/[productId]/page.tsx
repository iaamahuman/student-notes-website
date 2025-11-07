"use client";
import { api } from "@/lib/api";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { setCartData, setOrderData } from "@/redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { CartProduct, InitialState, Order } from "@/redux/types";
import { Minus, Plus } from "lucide-react";
import { Oval } from "react-loader-spinner";
import { stockDecreasehandler } from "@/helper/stockDecrease";
import Featured from "@/components/Featured";

interface Product {
  product_name: string;
  product_description: string;
  price: number;
  image: string;
  id: string;
  Category: {
    name: string;
  };
  quantity: number;
}

const Product = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const cartData = useSelector((state: InitialState) => state.cart);
  const userData = useSelector((state: InitialState) => state.userData);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.post(
          `/product/getproducts/${params.productId}`
        );
        setProduct(response.data);
        setLoading(false);
        toast.dismiss();
      } catch (error) {
        setProduct(null);
        setLoading(false);
        toast.error("Something Went Wrong!");
      }
    };
    if (loading) {
      fetchData();
    }
  }, [loading, params.productId]);

  useEffect(() => {
    const getCartDataFromDB = async () => {
      const resp = await api.post(`/cart/get/${userData.id}`);
      if (resp.data !== "Cart not found") {
        dispatch(setCartData(resp.data));
      }
    };
    userData.id && getCartDataFromDB();
  }, [userData.id, dispatch]);

  const updateCartInDatabase = async (data: any) => {
    try {
      await api.post(`/cart/update/${cartData.id}`, data);
    } catch (error) {
      toast.error("Error updating cart!");
    }
  };

  const createCartInDatabase = async (sendData: any) => {
    try {
      const { data } = await api.post("/cart/create", {
        ...sendData,
        userId: userData.id,
      });
      dispatch(
        setCartData({
          products: [...cartData.products, sendData.products],
          id: data.id,
        })
      );
    } catch (error) {
      toast.error("Error creating cart!");
    }
  };

  const incrementCartProduct = (productId: string) => {
    if (!userData.id) {
      logoutHandler();
      return;
    }

    const existingCartItemIndex = cartData.products.findIndex(
      (item: CartProduct) => item.productId === productId
    );

    stockDecreasehandler(productId, {
      quantity: 1,
      type: "dec",
    });

    const updatedProduct: Product = {
      ...product!,
      quantity: product!.quantity - 1,
    };

    setProduct(updatedProduct);

    let updatedCart;

    if (existingCartItemIndex === -1) {
      const newCartItem: CartProduct = {
        productId: product!.id,
        quantity: 1,
        name: product!.product_name,
        price: product!.price,
        category: product!.Category?.name,
      };

      updatedCart = [...cartData.products, newCartItem];
    } else {
      updatedCart = cartData.products.map((item: CartProduct, index: number) =>
        index === existingCartItemIndex
          ? { ...item, quantity: Number(item.quantity) + 1 }
          : item
      );
    }

    const updatedData = {
      id: cartData.id,
      products: updatedCart,
    };

    if (cartData.id) {
      updateCartInDatabase(updatedData);
    } else {
      createCartInDatabase({
        products: updatedCart,
        userId: userData.id,
      });
    }

    dispatch(setCartData(updatedData));
  };

  const decrementCartProduct = (productId: string) => {
    const existingCartItemIndex = cartData.products.findIndex(
      (item: CartProduct) => item.productId === productId
    );

    stockDecreasehandler(productId, {
      quantity: 1,
      type: "inc",
    });

    const updatedProduct: Product = {
      ...product!,
      quantity: product!.quantity + 1,
    };

    setProduct(updatedProduct);

    if (existingCartItemIndex === -1) {
      return;
    }

    let updatedCart;

    if (cartData.products[existingCartItemIndex].quantity === 1) {
      updatedCart = cartData.products.filter(
        (item: CartProduct) => item.productId !== productId
      );
    } else {
      updatedCart = cartData.products.map((item: CartProduct, index: number) =>
        index === existingCartItemIndex
          ? { ...item, quantity: Number(item.quantity) - 1 }
          : item
      );
    }

    const updatedData = {
      id: cartData.id,
      products: updatedCart,
    };

    dispatch(setCartData(updatedData));
    updateCartInDatabase(updatedData);
  };

  const buyProductHandler = async () => {
    if (!userData.id || !product) {
      logoutHandler();
      return;
    }

    const newCartItem: CartProduct = {
      productId: product.id,
      quantity: 1,
      name: product.product_name,
      price: product.price,
      category: product.Category?.name,
    };

    const updatedProduct: Product = {
      ...product,
      quantity: (product.quantity || 0) - 1,
    };

    setProduct(updatedProduct);

    try {
      await api.post(`/product/updateproduct/${product.id}`, {
        quantity: 1,
        type: "dec",
      });
    } catch (error) {
      toast.error("Error updating product quantity in the database!");
    }

    const updatedCart = [newCartItem];

    const updatedData = {
      id: cartData.id,
      products: updatedCart,
    };

    if (cartData.id) {
      updateCartInDatabase(updatedData);
    } else {
      createCartInDatabase({
        products: updatedCart,
        userId: userData.id,
      });
    }

    dispatch(setCartData(updatedData));

    const orderData: Order = {
      userId: userData.id,
      total: product.price,
      products: [
        {
          productId: product.id,
          quantity: 1,
          name: product.product_name,
          price: product.price,
          category: product.Category?.name,
        },
      ],
    };

    dispatch(setOrderData(orderData));
    router.push("/order");
  };

  const logoutHandler = async () => {
    try {
      await api.get("/auth/logout");
      toast.dismiss();
    } catch (error: any) {
      toast.dismiss();
    }
  };

  return (
    <main className="min-h-screen w-full flex bg-gradient-to-b from-gray-50 to-white flex-col items-center py-8">
      {!loading && product && (
        <section className="w-full md:w-[90%] max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-8 md:p-12">
                <Image
                  src={product.image}
                  alt="product"
                  width={500}
                  height={500}
                  className="w-full max-w-md h-auto object-contain"
                />
              </div>
              <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between">
                <div>
                  <h1 className="font-bold text-2xl md:text-3xl mb-4 text-gray-900">
                    {product.product_name}
                  </h1>
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      {product?.Category?.name}
                    </span>
                  </div>
                  <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">
                    {product.product_description}
                  </p>
                  <div className="mb-6">
                    <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                      ₹{product.price}
                    </p>
                    {product.quantity > 0 && (
                      <p className="text-sm text-gray-500">
                        {product.quantity} items in stock
                      </p>
                    )}
                  </div>
                </div>
                {product.quantity <= 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                    <p className="font-semibold text-red-600 text-center">
                      Product Out Of Stock
                    </p>
                  </div>
                )}
                {product.quantity > 0 && (
                  <div className="space-y-4">
                    {cartData.products.findIndex(
                      (item: CartProduct) => item.productId === product.id
                    ) === -1 ? (
                      <div className="flex gap-4">
                        <Button
                          onClick={buyProductHandler}
                          className="flex-1 py-6 text-lg font-semibold"
                          size="lg"
                        >
                          Buy Now
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 py-6 text-lg font-semibold"
                          size="lg"
                          onClick={() => incrementCartProduct(product.id)}
                        >
                          Add To Cart
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-4 bg-gray-100 rounded-lg p-4">
                          <button
                            className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-gray-200 transition-colors"
                            onClick={() => decrementCartProduct(product.id)}
                          >
                            <Minus size={20} />
                          </button>
                          <p className="text-xl font-semibold min-w-[40px] text-center">
                            {
                              cartData.products[
                                cartData.products.findIndex(
                                  (item: CartProduct) =>
                                    item.productId === product.id
                                )
                              ].quantity
                            }
                          </p>
                          <button
                            className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-gray-200 transition-colors"
                            onClick={() => incrementCartProduct(product.id)}
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                        <Button
                          onClick={buyProductHandler}
                          className="w-full py-6 text-lg font-semibold"
                          size="lg"
                        >
                          Buy Now
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
      {loading && (
        <div className="min-h-[85vh] w-full flex justify-center items-center">
          <Oval
            height={30}
            width={30}
            color="#272d40"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#272d40"
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        </div>
      )}
      {!loading && product && (
        <div className="w-full md:w-[90%] max-w-6xl mx-auto px-4 mt-12">
          <Featured />
        </div>
      )}
    </main>
  );
};

export default Product;
