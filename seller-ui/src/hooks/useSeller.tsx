import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const fetchSeller = async () => {
  const response = await axiosInstance.get("/api/logged-in-seller");
  return response.data.seller;
};

const useSeller = () => {
  const {
    data: Seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  return { Seller, isLoading, isError, refetch };
};

export default useSeller;
