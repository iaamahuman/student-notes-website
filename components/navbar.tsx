"use client";
import { Store, ShoppingCart, Search, Minus, Plus, Trash } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setCartData, setOrderData, setUserData } from "@/redux/actions";
import { api } from "@/lib/api";
import { Cart, CartProduct, InitialState, Order } from "@/redux/types";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { stockDecreasehandler } from "@/helper/stockDecrease";
import Link from "next/link";

const Navbar = () => {
  const dispatch = useDispatch();
  const cartData = useSelector((state: InitialState) => state.cart);
  const userData = useSelector((state: InitialState) => state.userData);
  const router = useRouter();
  const pathname = usePathname();
  const logoutHandler = async () => {
    try {
      await api.get("/auth/logout");
      toast.dismiss();
    } catch (error: any) {
      toast.dismiss();
    }
  };
  useEffect(() => {
    const getUserTokenData = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    if (payload.exp * 1000 < Date.now()) {
      logoutHandler();
      return;
    }
    console.log("payload:", payload);
    dispatch(setUserData({
      name: payload.name,
      email: payload.email,
      id: payload.userId,
    }));
  } catch (error) {
    console.log("auth error:", error);
  }
};

    getUserTokenData();
  }, [dispatch]);

  

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
      toast.error("Error In Saving Cart!");
    }
  };

  const incrementCartProduct = (id: string) => {
    stockDecreasehandler(id, {
      quantity: 1,
      type: "dec",
    });
    const existingCartItemIndex = cartData?.products.findIndex(
      (item: CartProduct) => item.productId === id
    );
    const updatedCart = cartData?.products.map(
      (product: CartProduct, index: number) =>
        index === existingCartItemIndex
          ? { ...product, quantity: Number(product.quantity) + 1 }
          : product
    );
    const sendData = {
      id: cartData.id,
      products: updatedCart,
    };
    dispatch(setCartData(sendData));
    updateCartInDatabase(sendData);
  };

  const decrementCartProduct = (id: string, quantity: number) => {
    stockDecreasehandler(id, {
      quantity: 1,
      type: "inc",
    });
    const existingCartItemIndex = cartData?.products.findIndex(
      (item: CartProduct) => item.productId === id
    );
    if (quantity === 1) {
      const updatedProducts = cartData?.products.filter(
        (item: CartProduct) => item.productId !== id
      );

      const updatedCart: Cart = {
        id: cartData.id,
        products: updatedProducts,
      };

      dispatch(setCartData(updatedCart));

      const sendData = {
        id: cartData.id,
        products: cartData?.products.filter(
          (item: CartProduct) => item.productId !== id
        ),
      };
      updateCartInDatabase(sendData);
    } else {
      let updatedCart = cartData?.products.map(
        (item: CartProduct, index: number) =>
          index === existingCartItemIndex
            ? { ...item, quantity: Number(item.quantity) - 1 }
            : item
      );
      const sendData = {
        id: cartData.id,
        products: updatedCart,
      };
      dispatch(setCartData(sendData));
      updateCartInDatabase(sendData);
    }
  };

  const removeProductFromCartHandler = (id: string) => {
    const sendData = {
      id: cartData.id,
      products: cartData?.products.filter(
        (item: CartProduct) => item.productId !== id
      ),
    };
    let index = cartData?.products.findIndex((item) => item.productId === id);
    stockDecreasehandler(id, {
      quantity: cartData?.products[index].quantity,
      type: "inc",
    });
    dispatch(setCartData(sendData));
    updateCartInDatabase(sendData);
  };

  const buyProductHandler = async () => {
    let productsData: {
      name: string;
      price: number;
      productId: string;
      quantity: number;
      category: string;
    }[] = [];
    let total: number = 0;
    cartData?.products.map((item: any) => {
      productsData.push({
        name: item.name,
        price: item?.price,
        productId: item?.productId,
        quantity: item?.quantity,
        category: item?.category,
      });
      total += item.quantity * item.price;
    });
    let orderData: Order = {
      userId: userData.id,
      total: total,
      products: [...productsData],
    };
    dispatch(setOrderData(orderData));
    router.push("/order");
  };

  const clearCartHandler = async () => {
    const productsToRestore: { productId: string; quantity: number }[] = [];
    const sendData = {
      id: cartData.id,
      products: [],
    };
    cartData?.products.forEach((item) => {
      productsToRestore.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    });
    try {
      for (const product of productsToRestore) {
        await stockDecreasehandler(product.productId, {
          quantity: product.quantity,
          type: "inc",
        });
      }
      dispatch(setCartData(sendData));
      await updateCartInDatabase(sendData);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <div className="border-b w-full bg-white relative shadow-sm px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div
        className="font-bold md:text-2xl cursor-pointer flex justify-center items-center text-blue-600 hover:text-blue-700 transition-colors"
        onClick={() => router.replace("/")}
      >
        <Store className="mr-2 h-6 w-6 md:h-7 md:w-7" /> Student Note Books
      </div>
      <div className="flex justify-center items-center gap-4">
        <Link
          href={"/product"}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Search className="md:h-6 md:w-6 h-5 w-5 text-gray-700" />
        </Link>
        <Sheet>
          <SheetTrigger className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ShoppingCart className="md:h-6 md:w-6 h-5 w-5 text-gray-700" />
            {cartData?.products && cartData.products.length > 0 && (
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartData.products.length}
              </span>
            )}
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg w-full">
            <SheetHeader>
              <SheetTitle className="text-xl md:text-2xl">Your Shopping Cart</SheetTitle>
              <SheetDescription>
                Here are all the products you add to your cart.
              </SheetDescription>
              <div className="w-full pt-4">
                {cartData?.products && cartData?.products?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                      {cartData.products.map((item: CartProduct, index: number) => (
                        <div
                          key={item.productId}
                          className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0"
                        >
                          <div className="flex gap-3 mb-3">
                            <div className="flex-1">
                              <p
                                className="font-semibold text-sm md:text-base cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() =>
                                  router.push(`/product/${item.productId}`)
                                }
                              >
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.category}
                              </p>
                            </div>
                            <button
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                              onClick={() =>
                                removeProductFromCartHandler(item.productId)
                              }
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center bg-gray-100 rounded-lg">
                              <button
                                className="flex justify-center items-center px-3 py-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                                onClick={() =>
                                  decrementCartProduct(item.productId, item.quantity)
                                }
                              >
                                <Minus size={16} />
                              </button>
                              <p className="text-sm font-medium min-w-[40px] text-center">
                                {item.quantity}
                              </p>
                              <button
                                className="flex justify-center items-center px-3 py-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                                onClick={() =>
                                  incrementCartProduct(item.productId)
                                }
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Price</p>
                              <p className="text-base font-semibold">
                                ₹{item.price}
                              </p>
                              <p className="text-xs text-gray-400">
                                Total: ₹{item.price * item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-3 sticky bottom-0 bg-white">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>
                          ₹
                          {cartData.products.reduce(
                            (sum, item) => sum + item.price * item.quantity,
                            0
                          )}
                        </span>
                      </div>
                      <Button
                        onClick={buyProductHandler}
                        className="w-full"
                        size="lg"
                      >
                        Proceed to Checkout
                      </Button>
                      <Button
                        onClick={clearCartHandler}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-full h-[70vh] flex-col">
                    <Image
                      src={require("../public/empty_cart.png")}
                      width={240}
                      alt="Cart Empty"
                    />
                    <p className="font-semibold mt-6 text-gray-600">Cart Is Empty</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Add some products to get started
                    </p>
                  </div>
                )}
              </div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        {pathname !== "/login" &&
          pathname !== "/register" &&
          !pathname.includes("/settings/resetPassword") &&
          userData.id !== "" && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer select-none">
                  {userData.name !== "" && (
                    <AvatarFallback>
                      {userData?.name?.split(" ")[0]?.slice(0, 1)}
                      {userData?.name?.split(" ")[1]?.slice(0, 1)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="absolute -right-2">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/settings/profile")}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/settings/myorders")}
                >
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/settings")}
                >
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        {pathname !== "/login" &&
          pathname !== "/register" &&
          userData.id === "" && (
            <Button
              onClick={() => router.push("/register")}
              size={"sm"}
              variant={"secondary"}
            >
              Register
            </Button>
          )}
      </div>
    </div>
  );
};

export default Navbar;
