'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * Props pour le composant ConfirmDialog
 */
interface ConfirmDialogProps {
  /** Contrôle l'ouverture/fermeture du dialog */
  open: boolean;
  /** Fonction appelée lors du changement d'état d'ouverture */
  onOpenChange: (open: boolean) => void;
  /** Titre du dialog */
  title: string;
  /** Description/message du dialog */
  description: string;
  /** Texte du bouton de confirmation (défaut: "Confirmer") */
  confirmText?: string;
  /** Texte du bouton d'annulation (défaut: "Annuler") */
  cancelText?: string;
  /** Fonction appelée lors de la confirmation */
  onConfirm: () => void | Promise<void>;
  /** État de chargement (désactive les boutons) */
  isLoading?: boolean;
  /** Variant du bouton de confirmation ("default" | "destructive") */
  variant?: 'default' | 'destructive';
}

/**
 * Composant ConfirmDialog réutilisable
 *
 * Affiche une boîte de dialogue de confirmation pour les actions critiques
 * Basé sur AlertDialog de shadcn/ui
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Supprimer le post ?"
 *   description="Cette action est irréversible."
 *   confirmText="Supprimer"
 *   variant="destructive"
 *   onConfirm={handleDelete}
 *   isLoading={isDeleting}
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  isLoading = false,
  variant = 'default',
}: ConfirmDialogProps) {
  /**
   * Gère la confirmation de l'action
   */
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // L'erreur est gérée par le composant parent
      console.error('ConfirmDialog error:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                : ''
            }
          >
            {isLoading ? 'Chargement...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook personnalisé pour gérer l'état du ConfirmDialog
 *
 * @example
 * ```tsx
 * const { isOpen, open, close } = useConfirmDialog();
 *
 * <Button onClick={open}>Supprimer</Button>
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={close}
 *   ...
 * />
 * ```
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}

// Pour éviter l'erreur React is not defined
import React from 'react';
