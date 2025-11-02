import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * Types de messages d'erreur
 */
type ErrorType = 'error' | 'warning' | 'info' | 'critical';

/**
 * Props pour le composant ErrorMessage
 */
interface ErrorMessageProps {
  /** Titre de l'erreur */
  title?: string;
  /** Message d'erreur */
  message: string;
  /** Type d'erreur (détermine l'icône et la couleur) */
  type?: ErrorType;
  /** Action de retry optionnelle */
  onRetry?: () => void;
  /** Texte du bouton retry */
  retryText?: string;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Composant ErrorMessage réutilisable
 *
 * Affiche un message d'erreur stylisé avec icône et action optionnelle
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   title="Erreur de chargement"
 *   message="Impossible de charger les posts. Vérifiez votre connexion."
 *   type="error"
 *   onRetry={handleRetry}
 * />
 * ```
 */
export function ErrorMessage({
  title,
  message,
  type = 'error',
  onRetry,
  retryText = 'Réessayer',
  className,
}: ErrorMessageProps) {
  // Sélectionner l'icône en fonction du type
  const getIcon = () => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  // Sélectionner la variante en fonction du type
  const getVariant = (): 'default' | 'destructive' => {
    return type === 'error' || type === 'critical' ? 'destructive' : 'default';
  };

  return (
    <Alert variant={getVariant()} className={className}>
      {getIcon()}
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="ml-auto"
        >
          {retryText}
        </Button>
      )}
    </Alert>
  );
}

/**
 * Composant EmptyState pour les listes vides
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Inbox className="h-12 w-12" />}
 *   title="Aucun post"
 *   description="Commencez par créer votre premier post !"
 *   action={<Button>Créer un post</Button>}
 * />
 * ```
 */
interface EmptyStateProps {
  /** Icône à afficher */
  icon?: React.ReactNode;
  /** Titre de l'état vide */
  title: string;
  /** Description de l'état vide */
  description?: string;
  /** Action optionnelle (bouton, lien, etc.) */
  action?: React.ReactNode;
  /** Classe CSS additionnelle */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-12 ${className || ''}`}
    >
      {icon && <div className="mb-4 text-muted-foreground opacity-50">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
