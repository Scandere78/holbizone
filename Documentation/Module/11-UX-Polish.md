# 🎨 Module UX & Polish

## 📋 Vue d'ensemble

Ce module contient tous les composants et utilitaires pour améliorer l'expérience utilisateur de l'application. Il inclut des skeletons de chargement, des dialogues de confirmation, des messages d'erreur améliorés, et des utilitaires d'accessibilité.

**Date de création:** 2 Novembre 2025
**Version:** 1.0

---

## 📦 Composants créés

### 1. Skeletons de chargement

Les skeletons sont des placeholders animés qui s'affichent pendant le chargement des données.

#### PostSkeleton

**Fichier:** `src/components/skeletons/PostSkeleton.tsx`

```tsx
import { PostSkeleton, PostSkeletonList } from '@/components/skeletons';

// Skeleton unique
<PostSkeleton />

// Liste de 5 skeletons
<PostSkeletonList count={5} />
```

**Usage dans une page:**
```tsx
export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div>
      {isLoading ? (
        <PostSkeletonList count={3} />
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
```

#### UserSkeleton

**Fichier:** `src/components/skeletons/UserSkeleton.tsx`

```tsx
import { UserSkeleton, UserSkeletonList, UserProfileSkeleton } from '@/components/skeletons';

// Carte utilisateur (pour listes)
<UserSkeleton />

// Liste d'utilisateurs
<UserSkeletonList count={5} />

// Profil utilisateur complet
<UserProfileSkeleton />
```

#### CommentSkeleton

**Fichier:** `src/components/skeletons/CommentSkeleton.tsx`

```tsx
import { CommentSkeleton, CommentSkeletonList } from '@/components/skeletons';

<CommentSkeletonList count={3} />
```

#### MessageSkeleton

**Fichier:** `src/components/skeletons/MessageSkeleton.tsx`

```tsx
import { MessageSkeleton, ConversationSkeleton } from '@/components/skeletons';

// Conversation dans la liste
<ConversationSkeleton />

// Message individuel
<MessageSkeleton isOwn={false} />
```

#### NotificationSkeleton

**Fichier:** `src/components/skeletons/NotificationSkeleton.tsx`

```tsx
import { NotificationSkeletonList } from '@/components/skeletons';

<NotificationSkeletonList count={5} />
```

---

### 2. ConfirmDialog - Dialogue de confirmation

**Fichier:** `src/components/ui/confirm-dialog.tsx`

Dialogue de confirmation réutilisable pour toutes les actions critiques.

**Props:**
- `open` (boolean) - Contrôle l'ouverture
- `onOpenChange` (function) - Callback de changement d'état
- `title` (string) - Titre du dialogue
- `description` (string) - Description
- `confirmText` (string) - Texte du bouton de confirmation
- `cancelText` (string) - Texte du bouton d'annulation
- `onConfirm` (function) - Fonction appelée à la confirmation
- `isLoading` (boolean) - État de chargement
- `variant` ('default' | 'destructive') - Style du bouton

**Exemple d'utilisation:**

```tsx
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useState } from 'react';

function DeletePostButton({ postId }: { postId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(postId);
      toast.success('Post supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="destructive">
        Supprimer
      </Button>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Supprimer le post ?"
        description="Cette action est irréversible. Le post sera définitivement supprimé."
        confirmText="Supprimer"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
```

**Hook useConfirmDialog:**

```tsx
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

function MyComponent() {
  const { isOpen, open, close } = useConfirmDialog();

  return (
    <>
      <Button onClick={open}>Supprimer</Button>
      <ConfirmDialog
        open={isOpen}
        onOpenChange={close}
        // ... autres props
      />
    </>
  );
}
```

---

### 3. ErrorMessage - Messages d'erreur améliorés

**Fichier:** `src/components/ui/error-message.tsx`

Composants pour afficher des erreurs et des états vides de manière élégante.

#### ErrorMessage

**Props:**
- `title` (string, optionnel) - Titre de l'erreur
- `message` (string) - Message d'erreur
- `type` ('error' | 'warning' | 'info' | 'critical') - Type d'erreur
- `onRetry` (function, optionnel) - Fonction de retry
- `retryText` (string) - Texte du bouton retry

**Exemples:**

```tsx
import { ErrorMessage } from '@/components/ui/error-message';

// Erreur simple
<ErrorMessage
  message="Impossible de charger les posts"
/>

// Erreur avec titre et retry
<ErrorMessage
  title="Erreur de chargement"
  message="Impossible de charger les posts. Vérifiez votre connexion."
  type="error"
  onRetry={handleRetry}
/>

// Avertissement
<ErrorMessage
  message="Votre session expire bientôt"
  type="warning"
/>

// Information
<ErrorMessage
  message="Nouvelle version disponible"
  type="info"
/>
```

#### EmptyState

Composant pour les états vides (listes vides, pas de résultats, etc.)

**Props:**
- `icon` (ReactNode) - Icône à afficher
- `title` (string) - Titre
- `description` (string) - Description
- `action` (ReactNode) - Action (bouton, lien, etc.)

**Exemple:**

```tsx
import { EmptyState } from '@/components/ui/error-message';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

<EmptyState
  icon={<Inbox className="h-12 w-12" />}
  title="Aucun post"
  description="Commencez par créer votre premier post !"
  action={
    <Button onClick={handleCreatePost}>
      Créer un post
    </Button>
  }
/>
```

---

### 4. OptimizedImage - Images optimisées

**Fichier:** `src/components/ui/optimized-image.tsx`

Composants pour des images optimisées avec Next.js Image, gestion d'erreur et loading state.

#### OptimizedImage

**Props principales:**
- `src` (string) - URL de l'image
- `alt` (string) - Texte alternatif
- `width` (number) - Largeur
- `height` (number) - Hauteur
- `fill` (boolean) - Remplir le conteneur
- `priority` (boolean) - Priorité de chargement
- `quality` (number) - Qualité (1-100)
- `showLoader` (boolean) - Afficher le skeleton pendant le chargement
- `fallback` (ReactNode) - Fallback en cas d'erreur

**Exemples:**

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

// Image simple avec dimensions fixes
<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  showLoader
/>

// Image qui remplit son conteneur
<OptimizedImage
  src="/image.jpg"
  alt="Description"
  fill
  objectFit="cover"
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Image prioritaire (above-the-fold)
<OptimizedImage
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
  quality={90}
/>
```

#### OptimizedAvatar

Avatar optimisé avec fallback sur les initiales.

```tsx
import { OptimizedAvatar } from '@/components/ui/optimized-image';

<OptimizedAvatar
  src={user.image}
  alt={user.name}
  fallbackText={user.name}
  size={50}
/>
```

---

## 🎯 Utilitaires d'accessibilité

**Fichier:** `src/lib/utils/accessibility.ts`

### Fonctions disponibles

#### generateA11yId
Génère un ID unique pour les labels et inputs.

```tsx
const id = generateA11yId('username');
// Retourne: "username-a1b2c3d4e"
```

#### getLoadingA11yProps
Attributs ARIA pour les états de chargement.

```tsx
<Button {...getLoadingA11yProps(isLoading, 'Envoi en cours')}>
  {isLoading ? 'Envoi...' : 'Envoyer'}
</Button>
```

#### getErrorA11yProps
Attributs ARIA pour les champs avec erreur.

```tsx
<Input
  {...getErrorA11yProps(hasError, 'email-error')}
/>
{hasError && (
  <span id="email-error" role="alert">
    Email invalide
  </span>
)}
```

#### getToggleA11yProps
Pour les boutons toggle (like, bookmark, etc.)

```tsx
<Button
  {...getToggleA11yProps(
    isLiked,
    'Post aimé - cliquer pour retirer',
    'Aimer ce post'
  )}
  onClick={handleLike}
>
  <Heart className={isLiked ? 'fill-current' : ''} />
</Button>
```

#### getNotificationA11yProps
Pour les badges de notification.

```tsx
<div {...getNotificationA11yProps(unreadCount)}>
  {unreadCount > 0 && <span>{unreadCount}</span>}
</div>
```

#### announceToScreenReader
Annoncer des changements dynamiques.

```tsx
import { announceToScreenReader } from '@/lib/utils/accessibility';

// Après une action réussie
announceToScreenReader('Post créé avec succès', 'polite');

// Pour une erreur critique
announceToScreenReader('Erreur : impossible de sauvegarder', 'assertive');
```

#### srOnly
Classe CSS pour le contenu visible uniquement par les lecteurs d'écran.

```tsx
import { srOnly } from '@/lib/utils/accessibility';

<span className={srOnly}>
  Charger plus de posts
</span>
```

---

## 📝 Checklist d'implémentation

### Intégration des Skeletons

- [ ] Remplacer les loading states par des skeletons dans :
  - [ ] Page feed principal (`src/app/page.tsx`)
  - [ ] Page profil (`src/app/profile/[username]/page.tsx`)
  - [ ] Page messages (`src/app/messages/page.tsx`)
  - [ ] Page notifications (`src/app/notifications/page.tsx`)
  - [ ] Page recherche (`src/app/search/page.tsx`)

### Confirmation Dialogues

- [ ] Ajouter ConfirmDialog pour :
  - [ ] Suppression de post
  - [ ] Suppression de commentaire
  - [ ] Suppression de message
  - [ ] Blocage d'utilisateur
  - [ ] Déblocage d'utilisateur

### Messages d'erreur

- [ ] Remplacer les toasts d'erreur par ErrorMessage dans :
  - [ ] Pages de chargement de données
  - [ ] Formulaires
  - [ ] Actions serveur

### États vides

- [ ] Ajouter EmptyState pour :
  - [ ] Feed vide
  - [ ] Aucun post sur un profil
  - [ ] Aucune notification
  - [ ] Aucun message
  - [ ] Résultats de recherche vides
  - [ ] Aucun utilisateur bloqué

### Optimisation images

- [ ] Remplacer `<img>` par `<OptimizedImage>` dans :
  - [ ] PostCard (images de posts)
  - [ ] Profils utilisateurs
  - [ ] Messages avec images
  - [ ] Avatars

- [ ] Utiliser `<OptimizedAvatar>` pour :
  - [ ] Tous les avatars utilisateurs
  - [ ] Liste d'utilisateurs
  - [ ] Commentaires
  - [ ] Messages

### Accessibilité

- [ ] Ajouter aria-labels sur :
  - [ ] Boutons sans texte visible
  - [ ] Champs de formulaire
  - [ ] Liens
  - [ ] Éléments interactifs

- [ ] Ajouter role attributes sur :
  - [ ] Listes
  - [ ] Menus
  - [ ] Dialogues
  - [ ] États de chargement

- [ ] Tester avec :
  - [ ] Clavier uniquement (Tab, Enter, Esc)
  - [ ] Lecteur d'écran (NVDA ou JAWS)
  - [ ] Zoom à 200%

---

## 🎨 Guidelines UX

### Loading States

1. **Skeletons pour le contenu structuré** (posts, utilisateurs, commentaires)
2. **Spinners pour les actions** (boutons, soumission de formulaires)
3. **Progress bars pour les uploads** (images, fichiers)

### Messages d'erreur

1. **Toujours explicites** : Dire ce qui s'est passé et pourquoi
2. **Proposer une solution** : Bouton retry, lien vers aide, etc.
3. **Ton amical** : Pas de jargon technique

**Mauvais:** "Error 500: Internal server error"
**Bon:** "Oups ! Impossible de charger les posts. Vérifiez votre connexion et réessayez."

### Confirmations

Demander confirmation pour :
- ✅ Suppression définitive
- ✅ Blocage d'utilisateur
- ✅ Quitter un formulaire non sauvegardé
- ❌ Like / Unlike (action réversible)
- ❌ Follow / Unfollow (action réversible)

### Accessibilité

**Règles d'or:**
1. Tout élément interactif doit être accessible au clavier
2. Tout contenu visuel doit avoir un équivalent textuel
3. Les changements dynamiques doivent être annoncés
4. Contraste minimum de 4.5:1 pour le texte
5. Zones de clic minimum de 44x44px

---

## 📊 Performance

### Images

**Tailles recommandées:**
- Avatar: 100x100px (quality: 80)
- Post image: max 1200px width (quality: 75)
- Hero images: 1920px width (quality: 90, priority)

**Formats:**
- WebP pour les photos
- PNG pour les logos/icônes
- SVG pour les illustrations

### Skeletons

- Utiliser les mêmes dimensions que le contenu réel
- Animer avec CSS (pas JS) pour de meilleures performances
- Ne pas animer si `prefers-reduced-motion` est activé

---

## 🧪 Tests recommandés

### Tests visuels

1. Vérifier les skeletons sur connexion lente (Chrome DevTools → Network → Slow 3G)
2. Tester les images avec et sans connexion
3. Vérifier les états vides

### Tests d'accessibilité

1. Navigation clavier complète de l'app
2. Lecteur d'écran sur les pages principales
3. Zoom à 200% et 400%
4. Contraste avec un outil comme axe DevTools

### Tests de performance

1. Lighthouse score > 90
2. Temps de chargement < 3s
3. First Contentful Paint < 1.5s

---

## 🚀 Prochaines améliorations

### Animations (optionnel)

Si vous voulez ajouter des animations subtiles:

```bash
pnpm add framer-motion
```

**Exemples d'animations:**
- Fade in pour les nouveaux posts
- Slide in pour les notifications
- Scale pour les likes/bookmarks
- Shake pour les erreurs

**Règle:** Toujours respecter `prefers-reduced-motion`

### Dark mode avancé

- Transitions douces entre modes
- Mémoriser la préférence utilisateur
- Adapter les images au mode

### Offline support

- Service worker
- Cache des images
- Queue pour les actions hors ligne

---

## 📚 Ressources

### Documentation
- [Next.js Image](https://nextjs.org/docs/api-reference/next/image)
- [WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

### Outils
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**Date de création:** 2 Novembre 2025
**Version:** 1.0
**Statut:** ✅ Implémenté
