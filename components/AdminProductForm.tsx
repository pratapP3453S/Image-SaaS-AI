"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import FileUpload from "./FileUpload";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useNotification } from "./Notification";
import { IMAGE_VARIANTS, ImageVariantType } from "@/lib/database/models/product.model";
import { apiClient, ProductFormData } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export default function AdminProductForm() {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      variants: [
        {
          type: "SQUARE" as ImageVariantType,
          price: 100,
          license: "personal",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const handleUploadSuccess = (response: IKUploadResponse) => {
    setValue("imageUrl", response.filePath);
    showNotification("Image uploaded successfully!", "success");
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      await apiClient.createProduct(data);
      showNotification("Product created successfully!", "success");

      // Reset form after successful submission
      setValue("name", "");
      setValue("description", "");
      setValue("imageUrl", "");
      setValue("variants", [
        {
          type: "SQUARE" as ImageVariantType,
          price: 100,
          license: "personal",
        },
      ]);
      router.push("/image-e-com")

    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : "Failed to create product",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gradient-to-br dark:from-slate-300 dark:to-slate-500">
      {/* Product Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-900">Product Name</label>
        <input
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-black ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <span className="text-sm text-red-500">{errors.name.message}</span>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-900">Description</label>
        <textarea
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-black ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          {...register("description", { required: "Description is required" })}
        />
        {errors.description && (
          <span className="text-sm text-red-500">{errors.description.message}</span>
        )}
      </div>

      {/* Product Image Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-900">Product Image</label>
        <FileUpload onSuccess={handleUploadSuccess} />
      </div>

      {/* Variants Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Image Variants</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="p-6 bg-gray-50 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Size & Aspect Ratio */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Size & Aspect Ratio</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:text-white"
                  {...register(`variants.${index}.type`)}
                >
                  {Object.entries(IMAGE_VARIANTS).map(([key, value]) => (
                    <option key={key} value={value.type} className="">
                      {value.label} ({value.dimensions.width}x{value.dimensions.height})
                    </option>
                  ))}
                </select>
              </div>

              {/* License */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">License</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:text-white"
                  {...register(`variants.${index}.license`)}
                >
                  <option value="personal">Personal Use</option>
                  <option value="commercial">Commercial Use</option>
                </select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Price (<span className="text-yellow-500">₹</span>)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:text-white ${
                    errors.variants?.[index]?.price ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register(`variants.${index}.price`, {
                    valueAsNumber: true,
                    required: "Price is required",
                    min: { value: 0.01, message: "Price must be greater than 0" },
                  })}
                />
                {errors.variants?.[index]?.price && (
                  <span className="text-sm text-red-500">{errors.variants[index]?.price?.message}</span>
                )}
              </div>

              {/* Remove Button */}
              <div className="flex items-center justify-center bg-red-500 h-7 w-7 rounded-md">
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 transition-colors"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="w-5 h-5 inline-block text-slate-100" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Variant Button */}
        <button
          type="button"
          className=" w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-black transition-colors dark:text-slate-200"
          onClick={() =>
            append({
              type: "SQUARE" as ImageVariantType,
              price: 100,
              license: "personal",
            })
          }
        >
          <Plus className="w-4 h-4 mr-2 dark:text-white hover:text-black" />
          Add Variant
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Product...
          </>
        ) : (
          "Create Product"
        )}
      </button>
    </form>
  );
}




// TODO: In future we will use reactquill to make description a rich text editor so the below code can be used but have some issues in code


// "use client";

// import React, { useState } from "react";
// import { useForm, useFieldArray } from "react-hook-form";
// import FileUpload from "./FileUpload";
// import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
// import { Loader2, Plus, Trash2 } from "lucide-react";
// import { useNotification } from "./Notification";
// import {
//   IMAGE_VARIANTS,
//   ImageVariantType,
// } from "@/lib/database/models/product.model";
// import { apiClient, ProductFormData } from "@/lib/api-client";
// import { useRouter } from "next/navigation";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css"; // Import the styles

// export default function AdminProductForm() {
//   const [loading, setLoading] = useState(false);
//   const { showNotification } = useNotification();
//   const router = useRouter();
//   const [description, setDescription] = useState("");
//   const [isRichTextEnabled, setIsRichTextEnabled] = useState(false); // Toggle state

//   const handleDescriptionChange = (val: string) => {
//     setDescription(val);
//     setValue("description", val); // Update form value
//   };

//   const {
//     register,
//     control,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm<ProductFormData>({
//     defaultValues: {
//       name: "",
//       description: "",
//       imageUrl: "",
//       variants: [
//         {
//           type: "SQUARE" as ImageVariantType,
//           price: 100,
//           license: "personal",
//         },
//       ],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "variants",
//   });

//   const handleUploadSuccess = (response: IKUploadResponse) => {
//     setValue("imageUrl", response.filePath);
//     showNotification("Image uploaded successfully!", "success");
//   };

//   const onSubmit = async (data: ProductFormData) => {
//     setLoading(true);
//     try {
//       await apiClient.createProduct(data);
//       showNotification("Product created successfully!", "success");

//       // Reset form after successful submission
//       setValue("name", "");
//       setValue("description", "");
//       setValue("imageUrl", "");
//       setValue("variants", [
//         {
//           type: "SQUARE" as ImageVariantType,
//           price: 100,
//           license: "personal",
//         },
//       ]);
//       router.push("/image-e-com");
//     } catch (error) {
//       showNotification(
//         error instanceof Error ? error.message : "Failed to create product",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="space-y-8 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gradient-to-br dark:from-slate-300 dark:to-slate-500"
//     >
//       {/* Product Name */}
//       <div className="space-y-2">
//         <label className="block text-sm font-medium text-gray-700 dark:text-slate-900">
//           Product Name
//         </label>
//         <input
//           type="text"
//           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-black ${
//             errors.name ? "border-red-500" : "border-gray-300"
//           }`}
//           {...register("name", { required: "Name is required" })}
//         />
//         {errors.name && (
//           <span className="text-sm text-red-500">{errors.name.message}</span>
//         )}
//       </div>

//       {/* Description */}
//       <div className="space-y-2">
//         <label className="block text-sm font-medium text-gray-700 dark:text-slate-900">
//           <div className="flex justify-between">
//             <div>Description</div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-600">Rich Text Editor</span>
//               <button
//                 type="button"
//                 onClick={() => setIsRichTextEnabled(!isRichTextEnabled)}
//                 className={`relative w-12 h-6 rounded-full p-1 transition-colors shadow-md ${
//                   isRichTextEnabled ? "bg-purple-gradient shadow-xl" : "bg-slate-300"
//                 }`}
//               >
//                 <div
//                   className={` w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
//                     isRichTextEnabled ? "translate-x-6" : "translate-x-0"
//                   }`}
//                 />
//               </button>
//             </div>
//           </div>
//         </label>
//         {isRichTextEnabled ? (
//           <ReactQuill
//             theme="snow" // Use the "snow" theme for the editor
//             value={description}
//             onChange={handleDescriptionChange}
//             className={`w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-black ${
//               errors.description ? "border-red-500" : "border-gray-300"
//             }`}
//             modules={{
//               toolbar: [
//                 [{ header: [1, 2, false] }],
//                 ["bold", "italic", "underline", "strike", "blockquote"],
//                 [{ list: "ordered" }, { list: "bullet" }],
//                 ["link", "image"],
//                 ["clean"],
//               ],
//             }}
//             formats={[
//               "header",
//               "bold",
//               "italic",
//               "underline",
//               "strike",
//               "blockquote",
//               "list",
//               "bullet",
//               "link",
//               "image",
//             ]}
//           />
//         ) : (
//           <textarea
//             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-black ${
//               errors.description ? "border-red-500" : "border-gray-300"
//             }`}
//             {...register("description", { required: "Description is required" })}
//             value={description}
//             onChange={(e) => {
//               setDescription(e.target.value);
//               setValue("description", e.target.value); // Update form value
//             }}
//           />
//         )}
//         {errors.description && (
//           <span className="text-sm text-red-500">
//             {errors.description.message}
//           </span>
//         )}
//       </div>

//       {/* Product Image Upload */}
//       <div className="space-y-2">
//         <label className="block text-sm font-medium text-gray-700 dark:text-slate-900">
//           Product Image
//         </label>
//         <FileUpload onSuccess={handleUploadSuccess} />
//       </div>

//       {/* Variants Section */}
//       <div className="space-y-6">
//         <h3 className="text-xl font-semibold text-gray-800">Image Variants</h3>
//         {fields.map((field, index) => (
//           <div key={field.id} className="p-6 bg-gray-50 rounded-lg shadow-sm">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Size & Aspect Ratio */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Size & Aspect Ratio
//                 </label>
//                 <select
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:text-white"
//                   {...register(`variants.${index}.type`)}
//                 >
//                   {Object.entries(IMAGE_VARIANTS).map(([key, value]) => (
//                     <option key={key} value={value.type} className="">
//                       {value.label} ({value.dimensions.width}x
//                       {value.dimensions.height})
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* License */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">
//                   License
//                 </label>
//                 <select
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:text-white"
//                   {...register(`variants.${index}.license`)}
//                 >
//                   <option value="personal">Personal Use</option>
//                   <option value="commercial">Commercial Use</option>
//                 </select>
//               </div>

//               {/* Price */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Price (<span className="text-yellow-500">₹</span>)
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   min="0.01"
//                   className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:text-white ${
//                     errors.variants?.[index]?.price
//                       ? "border-red-500"
//                       : "border-gray-300"
//                   }`}
//                   {...register(`variants.${index}.price`, {
//                     valueAsNumber: true,
//                     required: "Price is required",
//                     min: {
//                       value: 0.01,
//                       message: "Price must be greater than 0",
//                     },
//                   })}
//                 />
//                 {errors.variants?.[index]?.price && (
//                   <span className="text-sm text-red-500">
//                     {errors.variants[index]?.price?.message}
//                   </span>
//                 )}
//               </div>

//               {/* Remove Button */}
//               <div className="flex items-center justify-center bg-red-500 h-7 w-7 rounded-md">
//                 <button
//                   type="button"
//                   className="text-red-500 hover:text-red-700 transition-colors"
//                   onClick={() => remove(index)}
//                   disabled={fields.length === 1}
//                 >
//                   <Trash2 className="w-5 h-5 inline-block text-slate-100" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Add Variant Button */}
//         <button
//           type="button"
//           className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-black transition-colors dark:text-slate-200"
//           onClick={() =>
//             append({
//               type: "SQUARE" as ImageVariantType,
//               price: 100,
//               license: "personal",
//             })
//           }
//         >
//           <Plus className="w-4 h-4 mr-2 dark:text-white hover:text-black" />
//           Add Variant
//         </button>
//       </div>

//       {/* Submit Button */}
//       <button
//         type="submit"
//         className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
//         disabled={loading}
//       >
//         {loading ? (
//           <>
//             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//             Creating Product...
//           </>
//         ) : (
//           "Create Product"
//         )}
//       </button>
//     </form>
//   );
// }