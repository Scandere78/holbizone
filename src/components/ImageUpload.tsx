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

  // Fonction de compression d'image
  const compressImage = async (file: File): Promise<File> => {
    const maxSize = 4 * 1024 * 1024; // 4MB

    // Si le fichier est déjà petit, pas de compression
    if (file.size <= maxSize * 0.8) {
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Réduire la taille si trop grande
          const maxDimension = 2048;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compression progressive jusqu'à atteindre la taille cible
          let quality = 0.9;
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <UploadDropzone
      endpoint={endpoint}
      onBeforeUploadBegin={async (files) => {
        setIsUploading(true);
        toast.loading("Préparation de l'image...", { id: "upload-image" });

        // Compression des fichiers avant upload
        const compressedFiles = await Promise.all(
          files.map(async (file) => {
            // Vérification de la taille
            const maxSize = 4 * 1024 * 1024; // 4MB

            if (file.size > maxSize) {
              toast.dismiss("upload-image");
              toast.loading("Compression en cours...", { id: "upload-image" });
              const compressed = await compressImage(file);

              // Vérifier après compression
              if (compressed.size > maxSize) {
                toast.dismiss("upload-image");
                toast.error("Image trop volumineuse même après compression");
                setIsUploading(false);
                throw new Error("Fichier trop volumineux");
              }

              return compressed;
            }

            return file;
          })
        );

        toast.dismiss("upload-image");
        toast.loading("Upload en cours...", { id: "upload-image" });
        return compressedFiles;
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
        allowedContent: () => "Image (auto-compression si > 4MB)",
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