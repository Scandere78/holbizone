'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageOff } from 'lucide-react';

/**
 * Props pour le composant OptimizedImage
 */
interface OptimizedImageProps {
  /** URL de l'image */
  src: string;
  /** Texte alternatif pour l'accessibilité */
  alt: string;
  /** Largeur de l'image */
  width?: number;
  /** Hauteur de l'image */
  height?: number;
  /** Classe CSS additionnelle */
  className?: string;
  /** Priorité de chargement (pour les images above-the-fold) */
  priority?: boolean;
  /** Remplissage de l'image */
  fill?: boolean;
  /** Style de l'objet (cover, contain, etc.) */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Position de l'objet */
  objectPosition?: string;
  /** Tailles responsive */
  sizes?: string;
  /** Quality de l'image (1-100) */
  quality?: number;
  /** Afficher un loader pendant le chargement */
  showLoader?: boolean;
  /** Fallback en cas d'erreur */
  fallback?: React.ReactNode;
}

/**
 * Composant OptimizedImage
 *
 * Wrapper autour de next/image avec gestion d'erreur et loading state
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src={user.image}
 *   alt={user.name}
 *   width={100}
 *   height={100}
 *   className="rounded-full"
 *   showLoader
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  sizes,
  quality = 75,
  showLoader = true,
  fallback,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  /**
   * Gère la fin du chargement de l'image
   */
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  /**
   * Gère les erreurs de chargement
   */
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Afficher le fallback en cas d'erreur
  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Fallback par défaut
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className || ''}`}
        style={
          fill
            ? undefined
            : {
                width: width ? `${width}px` : '100%',
                height: height ? `${height}px` : 'auto',
              }
        }
      >
        <ImageOff className="w-8 h-8 text-gray-400" />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <div className="relative" style={fill ? undefined : { width, height }}>
      {/* Skeleton loader pendant le chargement */}
      {isLoading && showLoader && (
        <Skeleton
          className={`absolute inset-0 ${className || ''}`}
          style={
            fill
              ? undefined
              : {
                  width: width ? `${width}px` : '100%',
                  height: height ? `${height}px` : 'auto',
                }
          }
        />
      )}

      {/* Image Next.js optimisée */}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`${isLoading && showLoader ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className || ''}`}
        style={{
          objectFit: fill ? objectFit : undefined,
          objectPosition: fill ? objectPosition : undefined,
        }}
        sizes={sizes}
        quality={quality}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

/**
 * Composant OptimizedAvatar
 *
 * Avatar optimisé avec fallback pour les initiales
 *
 * @example
 * ```tsx
 * <OptimizedAvatar
 *   src={user.image}
 *   alt={user.name}
 *   fallbackText={user.name}
 *   size={50}
 * />
 * ```
 */
interface OptimizedAvatarProps {
  /** URL de l'image */
  src?: string | null;
  /** Texte alternatif */
  alt: string;
  /** Texte pour le fallback (initiales) */
  fallbackText: string;
  /** Taille de l'avatar */
  size?: number;
  /** Classe CSS additionnelle */
  className?: string;
}

export function OptimizedAvatar({
  src,
  alt,
  fallbackText,
  size = 40,
  className,
}: OptimizedAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Récupérer les initiales
  const getInitials = (text: string): string => {
    return text
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  // Si pas d'image ou erreur, afficher les initiales
  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold rounded-full ${className || ''}`}
        style={{ width: size, height: size, fontSize: size / 2.5 }}
        aria-label={alt}
      >
        {getInitials(fallbackText)}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className || ''}`}
      objectFit="cover"
      quality={80}
      fallback={
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold rounded-full ${className || ''}`}
          style={{ width: size, height: size, fontSize: size / 2.5 }}
        >
          {getInitials(fallbackText)}
        </div>
      }
    />
  );
}
