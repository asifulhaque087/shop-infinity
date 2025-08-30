"use client";
import { Pencil, WandSparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// This interface defines the expected properties for a component.
interface Props {
  size: string;
  small?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  setOpenImageModal: (openImageModal: boolean) => void;
  index?: any;
}

const ImagePlaceHolder = (props: Props) => {
  const {
    size,
    small,
    onImageChange,
    onRemove,
    defaultImage = null,
    index = null,
    setOpenImageModal,
  } = props;

  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  // 8h58m
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageChange(file, index!);
    }
  };

  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex  flex-col justify-center items-center`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {imagePreview ? (
        <>
          <button
            type="button"
            className="absolute top-3 p-2 rounded bg-blue-500 shadow-lg cursor-pointer"
            onClick={() => setOpenImageModal(true)}
          >
            <WandSparkles size={16} />
          </button>
        </>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute top-3 right-3 p-2 rounded border-l-slate-700 shadow-lg cursor-pointer"
        >
          <Pencil size={16} />
        </label>
      )}

      {imagePreview ? (
        <Image
          width={400}
          height={300}
          src={imagePreview}
          alt="uploaded"
          className="w-full  h-full object-cover rounded-lg"
        />
      ) : (
        <>
          <p
            className={`text-gray-400 ${
              small ? "text-xl" : "text-4xl"
            } font-semibold`}
          >
            {size}
          </p>

          <p
            className={`text-gray-500 ${
              small ? "text-sm" : "text-lg"
            } pt-2 text-center`}
          >
            Please choose an image <br />
            according to the expected ration
          </p>
        </>
      )}
    </div>
  );
};

export default ImagePlaceHolder;
