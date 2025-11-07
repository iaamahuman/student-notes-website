import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export const stockDecreasehandler = async (id: string, data: {}) => {
  try {
    await api.post(`/product/updateproduct/${id}`, data);
  } catch (error) {
    toast.error("Something Goes Wrong!");
  }
};
