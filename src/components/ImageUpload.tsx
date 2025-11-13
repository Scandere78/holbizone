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
        console.log("Réponse complète:", JSON.stringify(res, null, 2));
        if (res && res[0]) {
          // Try multiple possible URL locations
          const imageUrl = res[0].url || res[0].appUrl || res[0].serverData?.fileUrl;
          console.log("URL de l'image extraite:", imageUrl);
          console.log("res[0].url:", res[0].url);
          console.log("res[0].appUrl:", res[0].appUrl);
          console.log("res[0].serverData:", res[0].serverData);

          if (imageUrl) {
            console.log("Appel de onChange avec:", imageUrl);
            onChange(imageUrl);
          } else {
            console.error("Aucune URL trouvée dans la réponse:", res[0]);
            console.error("Clés disponibles:", Object.keys(res[0]));
          }
        } else {
          console.error("Pas de résultat dans res[0]");
        }
      }}
      onUploadError={(error: Error) => {
        console.error("Erreur d'upload:", error);
        console.error("Message d'erreur:", error.message);
        console.error("Stack:", error.stack);
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