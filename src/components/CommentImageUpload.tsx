"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon, Loader2 } from "lucide-react";
import { useState } from "react";

interface CommentImageUploadProps {
  onChange: (url: string) => void;
  value: string;
}

function CommentImageUpload({ onChange, value }: CommentImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  if (value) {
    return (
      <div className="relative w-full max-w-sm">
        <img
          src={value}
          alt="Upload"
          className="rounded-md w-full h-48 object-cover border border-red-200 dark:border-red-800"
        />
        <button
          onClick={() => onChange("")}
          className="absolute -top-2 -right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-full shadow-lg transition-colors"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {isUploading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <p className="text-sm text-red-600 font-medium">Upload en cours...</p>
          </div>
        </div>
      )}

      <UploadDropzone
        endpoint="postImage"
        onUploadBegin={() => {
          setIsUploading(true);
        }}
        onClientUploadComplete={(res) => {
          setIsUploading(false);
          if (res && res[0]) {
            const imageUrl = res[0].url || res[0].appUrl || res[0].serverData?.fileUrl;
            if (imageUrl) {
              onChange(imageUrl);
            }
          }
        }}
        onUploadError={(error: Error) => {
          setIsUploading(false);
          console.error("Erreur d'upload:", error);
        }}
        className="ut-button:bg-red-600 ut-button:ut-readying:bg-red-500/50 ut-label:text-xs ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground"
        appearance={{
          container: "w-full",
          uploadIcon: "w-8 h-8 text-red-500",
          label: "text-xs text-red-600 dark:text-red-400",
          allowedContent: "text-xs text-muted-foreground",
          button: "ut-ready:bg-red-600 ut-uploading:bg-red-500 bg-red-600 text-white text-xs px-3 py-1.5"
        }}
        content={{
          label: () => "Ajouter une image au commentaire",
          allowedContent: () => "Image (4MB max)",
          button: ({ ready, isUploading }) => {
            if (isUploading) return "Upload en cours...";
            if (ready) return "Choisir l'image";
            return "Préparation...";
          },
        }}
      />
    </div>
  );
}

export default CommentImageUpload;
