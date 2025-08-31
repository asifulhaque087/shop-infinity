import { X } from "lucide-react";
import React from "react";

interface Props {
  discount: any;
  onClose: () => void;
  onConfirm?: any;
}

const DeleteDiscountCodeModal = (props: Props) => {
  const { discount, onClose, onConfirm } = props;

  return (
    <div className="fixed top-0 w-full h-full bg-black/50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h3 className="text-xl text-white">Delete Discount Code</h3>

          <button className="text-gray-400 hover:text-white " onClick={onClose}>
            <X size={22} />
          </button>

          {/* Warning Message */}
          <p className="text-gray-300 mt-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              {discount.public_name}
            </span>
            ?
            <br />
            This action **cannot be undone**.
          </p>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white font-semibold transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDiscountCodeModal;
