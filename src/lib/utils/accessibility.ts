/**
 * Utilitaires pour améliorer l'accessibilité de l'application
 */

/**
 * Génère un ID unique pour associer les labels aux inputs
 * @param prefix - Préfixe pour l'ID
 * @returns ID unique
 */
export function generateA11yId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Attributs ARIA pour les boutons de chargement
 * @param isLoading - État de chargement
 * @param loadingText - Texte pendant le chargement
 * @returns Attributs ARIA
 */
export function getLoadingA11yProps(
  isLoading: boolean,
  loadingText: string = 'Chargement en cours'
) {
  return {
    'aria-busy': isLoading,
    'aria-live': 'polite' as const,
    'aria-label': isLoading ? loadingText : undefined,
  };
}

/**
 * Attributs ARIA pour les messages d'erreur
 * @param hasError - Présence d'une erreur
 * @param errorId - ID de l'élément d'erreur
 * @returns Attributs ARIA
 */
export function getErrorA11yProps(hasError: boolean, errorId?: string) {
  return {
    'aria-invalid': hasError,
    'aria-describedby': hasError && errorId ? errorId : undefined,
  };
}

/**
 * Attributs ARIA pour les dialogues modales
 * @param title - Titre du dialogue
 * @param description - Description du dialogue
 * @returns Attributs ARIA
 */
export function getDialogA11yProps(title: string, description?: string) {
  const titleId = generateA11yId('dialog-title');
  const descId = description ? generateA11yId('dialog-desc') : undefined;

  return {
    'aria-labelledby': titleId,
    'aria-describedby': descId,
    titleId,
    descId,
  };
}

/**
 * Attributs ARIA pour les états de notification
 * @param count - Nombre de notifications non lues
 * @returns Attributs ARIA
 */
export function getNotificationA11yProps(count: number) {
  return {
    'aria-label': count > 0
      ? `${count} notification${count > 1 ? 's' : ''} non lue${count > 1 ? 's' : ''}`
      : 'Aucune notification',
    'aria-live': 'polite' as const,
    role: 'status' as const,
  };
}

/**
 * Attributs ARIA pour les boutons toggle (like, bookmark, etc.)
 * @param isActive - État actif/inactif
 * @param activeLabel - Label quand actif
 * @param inactiveLabel - Label quand inactif
 * @returns Attributs ARIA
 */
export function getToggleA11yProps(
  isActive: boolean,
  activeLabel: string,
  inactiveLabel: string
) {
  return {
    'aria-pressed': isActive,
    'aria-label': isActive ? activeLabel : inactiveLabel,
    role: 'switch' as const,
  };
}

/**
 * Attributs ARIA pour les listes paginées
 * @param currentPage - Page actuelle
 * @param totalPages - Nombre total de pages
 * @param totalItems - Nombre total d'éléments
 * @returns Attributs ARIA
 */
export function getPaginationA11yProps(
  currentPage: number,
  totalPages: number,
  totalItems: number
) {
  return {
    'aria-label': `Pagination, page ${currentPage} sur ${totalPages}`,
    'aria-describedby': `${totalItems} résultat${totalItems > 1 ? 's' : ''} au total`,
    role: 'navigation' as const,
  };
}

/**
 * Attributs ARIA pour les champs de recherche
 * @param hasResults - Présence de résultats
 * @param resultCount - Nombre de résultats
 * @returns Attributs ARIA
 */
export function getSearchA11yProps(hasResults: boolean, resultCount?: number) {
  return {
    'aria-label': 'Rechercher',
    'aria-autocomplete': 'list' as const,
    'aria-haspopup': hasResults,
    'aria-expanded': hasResults,
    role: 'combobox' as const,
    'aria-controls': hasResults ? 'search-results' : undefined,
    'aria-activedescendant': undefined,
    'aria-describedby':
      hasResults && resultCount !== undefined
        ? `${resultCount} résultat${resultCount > 1 ? 's' : ''} trouvé${resultCount > 1 ? 's' : ''}`
        : undefined,
  };
}

/**
 * Attributs ARIA pour les menus dropdown
 * @param isOpen - État ouvert/fermé
 * @param menuId - ID du menu
 * @returns Attributs ARIA
 */
export function getDropdownA11yProps(isOpen: boolean, menuId: string) {
  return {
    'aria-haspopup': true as const,
    'aria-expanded': isOpen,
    'aria-controls': menuId,
  };
}

/**
 * Classe CSS pour masquer visuellement mais garder accessible aux lecteurs d'écran
 */
export const srOnly = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

/**
 * Wrapper pour annoncer des changements dynamiques aux lecteurs d'écran
 * @param message - Message à annoncer
 * @param type - Type d'annonce ('polite' | 'assertive')
 */
export function announceToScreenReader(
  message: string,
  type: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', type);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = srOnly;
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Retirer l'annonce après un court délai
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Vérifie si un élément est actuellement visible dans le viewport
 * Utile pour l'infinite scroll accessible
 * @param element - Élément à vérifier
 * @returns true si visible
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Gère le focus après une action (utile après suppression, soumission, etc.)
 * @param elementId - ID de l'élément à focus
 * @param fallbackSelector - Sélecteur de fallback si l'élément n'existe pas
 */
export function manageFocusAfterAction(
  elementId?: string,
  fallbackSelector: string = 'main'
) {
  let targetElement: HTMLElement | null = null;

  if (elementId) {
    targetElement = document.getElementById(elementId);
  }

  if (!targetElement) {
    targetElement = document.querySelector(fallbackSelector);
  }

  if (targetElement) {
    targetElement.focus();
  }
}
