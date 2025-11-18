"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage";
}

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  if (value) {
    return (
      <div className="relative size-40">
        <img src={value} alt="Upload" className="rounded-md size-40 object-cover" />
        <button
          onClick={() => onChange("")}
          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm hover:bg-red-600 transition-colors"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-red-300 rounded-lg bg-red-50 dark:bg-red-950/20">
        <Loader2 className="h-10 w-10 text-red-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-red-600">Upload en cours...</p>
        <p className="text-xs text-muted-foreground mt-1">Veuillez patienter</p>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onBeforeUploadBegin={(files) => {
        setIsUploading(true);
        toast.loading("Upload en cours...", { id: "upload-image" });
        return files;
      }}
      onClientUploadComplete={(res) => {
        setIsUploading(false);
        toast.dismiss("upload-image");

        console.log("Upload terminé:", res);
        if (res && res[0]) {
          const imageUrl = res[0].url || res[0].appUrl || res[0].serverData?.fileUrl;
          console.log("URL de l'image extraite:", imageUrl);

          if (imageUrl) {
            onChange(imageUrl);
            toast.success("✅ Image uploadée avec succès !");
          } else {
            console.error("Aucune URL trouvée dans la réponse:", res[0]);
            toast.error("Erreur : URL introuvable");
          }
        } else {
          console.error("Pas de résultat dans res[0]");
          toast.error("Erreur lors de l'upload");
        }
      }}
      onUploadError={(error: Error) => {
        setIsUploading(false);
        toast.dismiss("upload-image");
        console.error("Erreur d'upload:", error);
        toast.error(`Erreur : ${error.message}`);
      }}
      className="ut-button:bg-red-600 ut-button:ut-readying:bg-red-500/50 ut-label:text-sm ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground ut-upload-icon:w-8 ut-upload-icon:h-8"
      appearance={{
        container: "w-full max-w-md mx-auto",
        uploadIcon: "w-12 h-12",
        label: "text-sm font-medium",
        allowedContent: "text-xs text-muted-foreground",
        button: "ut-ready:bg-red-600 ut-uploading:cursor-not-allowed ut-uploading:bg-red-400 bg-red-600 hover:bg-red-700 text-white px-4 py-2 transition-colors"
      }}
      content={{
        label: () => "📸 Choisir une image",
        allowedContent: () => "Image (4MB max)",
        button: ({ ready, isUploading }) => {
          if (isUploading) return "Upload en cours...";
          if (!ready) return "En préparation...";
          return "📁 Choisir le fichier";
        },
      }}
    />
  );
}
export default ImageUpload;