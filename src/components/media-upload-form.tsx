"use client";

import { useState } from "react";
import { useCreateWorkStore } from "@/store/create-work-store";
import { Button } from "@/components/ui/button";
import Image from "next/image"; // Using Next.js Image component for optimization

export function MediaUploadForm() {
  const { setStep, setFormData, formData } = useCreateWorkStore();
  const [file, setFile] = useState<File | null>(formData.rawFile || null);
  const [preview, setPreview] = useState<string | null>(() => {
    if (formData.rawFile) {
      return URL.createObjectURL(formData.rawFile);
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFormData({ rawFile: selectedFile }); // Store the File object
      
      if (preview) URL.revokeObjectURL(preview); // Clean up previous preview
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFormData({ rawFile: undefined }); // Clear file from store
  };

  const handleNext = () => {
    if (!file) {
      setError("Please upload your artwork before proceeding.");
      return;
    }
    setStep(4);
  };
  
  const handleBack = () => {
    setStep(2);
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Upload your artwork
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          {!preview ? (
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 10MB</p>
            </div>
          ) : (
            <div className="relative w-full h-64">
              <Image src={preview} alt="Artwork preview" layout="fill" objectFit="contain" />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveFile}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next Step
        </Button>
      </div>
    </div>
  );
}
