"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage";
}

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  if (value) {
    return (
      <div className="relative size-40">
        <img src={value} alt="Upload" className="rounded-md size-40 object-cover" />
        <button
          onClick={() => onChange("")}
          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        console.log("Upload terminé:", res);
        if (res && res[0]) {
          // Try multiple possible URL locations
          const imageUrl = res[0].url || res[0].appUrl || res[0].serverData?.fileUrl;
          console.log("URL de l'image:", imageUrl);
          if (imageUrl) {
            onChange(imageUrl);
          } else {
            console.error("No URL found in response:", res[0]);
          }
        }
      }}
      onUploadError={(error: Error) => {
        console.error("Erreur d'upload:", error);
      }}
      className="ut-button:bg-red-600 ut-button:ut-readying:bg-red-500/50 ut-label:text-sm ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground ut-upload-icon:w-8 ut-upload-icon:h-8"
      appearance={{
        container: "w-full max-w-md mx-auto",
        uploadIcon: "w-12 h-12",
        label: "text-sm",
        allowedContent: "text-xs text-muted-foreground",
        button: "ut-ready:bg-red-600 ut-uploading:cursor-not-allowed bg-red-600 text-white px-4 py-2"
      }}
      content={{
        label: () => "Choisir une image",
        allowedContent: () => "Image (4MB max)",
        button: ({ ready }) => (ready ? "Choisir le fichier" : "En préparation..."),
      }}
    />
  );
}
export default ImageUpload;