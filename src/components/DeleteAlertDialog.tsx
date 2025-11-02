"use client";

import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteAlertDialogProps {
  isDeleting: boolean;
  isOpen: boolean;
  onDeleteAction: () => void;
  onCloseAction: () => void;
  title?: string;
  description?: string;
}

export function DeleteAlertDialog({
  isDeleting,
  isOpen,
  onDeleteAction,
  onCloseAction,
  title = "Delete Post",
  description = "This action cannot be undone.",
}: DeleteAlertDialogProps) {
  const handleDelete = async () => {
    try {
      await onDeleteAction();
      // Fermer le dialog après succès
      onCloseAction();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) onCloseAction();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCloseAction}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2Icon className="size-4 animate-spin mr-2" />
            ) : null}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}