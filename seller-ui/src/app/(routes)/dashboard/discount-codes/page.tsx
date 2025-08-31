"use client";
import Input from "@/shared/components/input";
import DeleteDiscountCodeModal from "@/shared/components/modals/delete-discount-codes";
import axiosInstance from "@/utils/axiosInstance";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ChevronRight, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const page = () => {
  // 10h58m
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();

  const queryClient = useQueryClient();

  // 11h1m
  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    },
  });

  // 11h14m
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      discountCode: "",
    },
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post("/product/api/create-discount-code", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shop-discounts"],
      });
      reset();
      setShowModal(false);
    },
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId) => {
      await axiosInstance.delete(
        `/product/api/delete-discount-code/${discountId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shop-discounts"],
      });
      setShowDeleteModal(false);
    },
  });

  // 11h6m
  const handleDeleteClick = async (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  };

  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only create up to 8 discount codes.");
      return;
    }

    createDiscountCodeMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Create Discount
        </button>
      </div>

      {/* Breadcums */}

      <div className="flex items-center text-white">
        <Link href={"/dashboard"} className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8]" />
        <span>Discount Codes</span>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>
        {isLoading ? (
          <p className="text-gray-400 text-center">Loading discounts...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes?.map((discount: any) => (
                <tr
                  key={discount?.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="p-3 capitalize">
                    {discount.discountType === "percentage"
                      ? "Percentage (%)"
                      : "Flat ($)"}
                  </td>
                  <td className="p-3">
                    {discount.discountType === "percentage"
                      ? `${discount.discountValue}%`
                      : `$$${discount.discountValue}`}
                  </td>
                  <td className="p-3">{discount.discountCode}</td>

                  <td className="p-3">
                    <button
                      className="text-red-400 hover:text-red-300 transition"
                      onClick={() => handleDeleteClick(discount)}
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 11h7m */}
        {!isLoading && discountCodes?.length === 0 && (
          <p className="text-gray-400 w-full pt-4 block text-center">
            No Discount Codes Available!
          </p>
        )}

        {/*Create discount model 11h8m */}

        {showModal && (
          <div className="fixed top-0 w-full h-full bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
              <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <h3 className="text-xl text-white">Create Discount Code</h3>
                <button
                  className="text-gray-400 hover:text-white "
                  onClick={() => setShowModal(false)}
                >
                  <X size={22} />
                </button>
              </div>

              {/* form will be here */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                {/* Title */}
                <Input
                  label="Title (Public Name)"
                  {...register("public_name", {
                    required: "Title is required",
                  })}
                />

                {errors.public_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.public_name.message}
                  </p>
                )}

                {/* Discount Type */}
                <div className="mt-2">
                  <label className="block font-semibold text-gray-300 mb-1">
                    Discount Type
                  </label>
                  <Controller
                    control={control}
                    name="discountType"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full border outline-none border-gray-700 bg-transparent py-2 rounded-md"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount ($)</option>
                      </select>
                    )}
                  />
                </div>

                {/* Discount value */}
                <div className="mt-2">
                  <Input
                    label="Discount Value"
                    type="number"
                    min={1}
                    {...register("discountValue", {
                      required: "Value is required",
                    })}
                  />
                </div>

                {/* Discount Code*/}
                <div className="mt-2">
                  <Input
                    label="Discount Code"
                    type="number"
                    min={1}
                    {...register("discountCode", {
                      required: "Discount code is required",
                    })}
                  />
                </div>

                <button
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2"
                  disabled={createDiscountCodeMutation.isPending}
                >
                  <Plus size={18} />

                  {createDiscountCodeMutation.isError
                    ? "Creating..."
                    : "Create"}
                </button>

                {/* 11h20m */}
                {createDiscountCodeMutation.isError && (
                  <p className="text-red-500 text-sm mt-2">
                    {(
                      createDiscountCodeMutation.error as AxiosError<{
                        message: string;
                      }>
                    )?.response?.data?.message || "Something went wrong"}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && selectedDiscount && (
          <DeleteDiscountCodeModal
            discount={selectedDiscount}
            onClose={() => setShowDeleteModal(false)}
            // 11h30m
            onConfirm={() => {
              deleteDiscountCodeMutation.mutate(selectedDiscount?.id);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default page;
