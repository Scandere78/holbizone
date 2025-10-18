# Module Post

## 📋 Vue d'ensemble

Le module Post gère toutes les fonctionnalités liées aux publications, incluant la création, l'affichage, la modification, la suppression et les interactions (likes, commentaires).

## 🎯 Responsabilités

- Création de posts avec texte et/ou image
- Affichage du fil d'actualité
- Système de likes
- Système de commentaires
- Suppression de posts
- Gestion des notifications liées aux posts

## 📊 Modèle de Données

### Schéma Prisma

```prisma
model Post {
  id        String   @id @default(cuid())
  authorId  String
  content   String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  author        User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments      Comment[]
  likes         Like[]
  notifications Notification[]
}
```

### Propriétés

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| id | String | Identifiant unique (CUID) | ✅ |
| authorId | String | ID de l'auteur | ✅ |
| content | String | Contenu textuel du post | ❌ |
| image | String | URL de l'image | ❌ |
| createdAt | DateTime | Date de création | ✅ |
| updatedAt | DateTime | Date de mise à jour | ✅ |

### Relations

- **author**: L'auteur du post (Many-to-One avec User)
- **comments**: Les commentaires du post (One-to-Many)
- **likes**: Les likes du post (One-to-Many)
- **notifications**: Notifications liées au post (One-to-Many)

### Règles de validation

- ⚠️ Un post doit avoir au minimum un `content` OU une `image`
- ✅ Cascade delete: Si l'auteur est supprimé, ses posts sont supprimés
- ✅ Cascade delete: Si un post est supprimé, ses comments/likes sont supprimés

## 🔧 Server Actions

### Fichier: `src/actions/post.action.ts`

#### 1. `createPost(content: string, image: string)`

Crée un nouveau post.

**Paramètres**:
- `content` (String): Contenu textuel du post
- `image` (String): URL de l'image uploadée

**Retour**: `{ success: boolean, post?: Post, error?: string }`

**Logique**:
```typescript
1. Récupère l'ID de l'utilisateur connecté
2. Crée le post dans la DB
3. Revalide le cache de la page d'accueil
4. Retourne le résultat
```

**Validation**:
- Au moins `content` OU `image` doit être fourni (validation côté client)

**Exemple d'utilisation**:
```typescript
const result = await createPost("Hello World!", "https://...");
if (result?.success) {
  toast.success("Post créé!");
}
```

---

#### 2. `getPosts()`

Récupère tous les posts avec leurs relations.

**Retour**: `Array<Post>` avec author, comments, likes, et compteurs

**Données incluses**:
- ✅ Informations de l'auteur (id, name, image, username)
- ✅ Tous les commentaires avec leurs auteurs
- ✅ Tous les likes (userId uniquement)
- ✅ Compteurs: nombre de likes et commentaires

**Tri**: Par date de création décroissante (plus récent en premier)

**Exemple d'utilisation**:
```typescript
const posts = await getPosts();
```

---

#### 3. `toggleLike(postId: string)`

Gère le like/unlike d'un post.

**Paramètres**:
- `postId` (String): ID du post

**Retour**: `{ success: boolean, error?: string }`

**Logique**:
```typescript
1. Vérifie si un like existe déjà
2. Si existe → supprime (unlike)
3. Si n'existe pas → crée (like) + notification
4. Revalide la page
```

**Transaction Prisma** (lors d'un like):
- Création du like
- Création de la notification (sauf si like de son propre post)

**Exemple d'utilisation**:
```typescript
const result = await toggleLike("post123");
```

---

#### 4. `createComment(postId: string, content: string)`

Crée un commentaire sur un post.

**Paramètres**:
- `postId` (String): ID du post
- `content` (String): Contenu du commentaire

**Retour**: `{ success: boolean, comment?: Comment, error?: string }`

**Logique**:
```typescript
1. Valide que le contenu n'est pas vide
2. Vérifie que le post existe
3. Transaction:
   - Crée le commentaire
   - Crée la notification (si commentaire sur post d'autrui)
4. Revalide la page
```

**Validation**:
- ✅ Le contenu est requis
- ✅ Le post doit exister

**Exemple d'utilisation**:
```typescript
const result = await createComment("post123", "Super post!");
if (result?.success) {
  toast.success("Commentaire ajouté!");
}
```

---

#### 5. `deletePost(postId: string)`

Supprime un post.

**Paramètres**:
- `postId` (String): ID du post à supprimer

**Retour**: `{ success: boolean, error?: string }`

**Logique**:
```typescript
1. Vérifie que le post existe
2. Vérifie que l'utilisateur est l'auteur
3. Supprime le post (cascade sur comments/likes)
4. Revalide la page
```

**Sécurité**:
- ✅ Seul l'auteur peut supprimer son post
- ✅ Vérification d'autorisation

**Exemple d'utilisation**:
```typescript
const result = await deletePost("post123");
if (result.success) {
  toast.success("Post supprimé!");
}
```

## 📱 Composants UI

### Composants principaux

#### 1. `CreatePost.tsx`
Formulaire de création de post.

**Fonctionnalités**:
- Textarea pour le contenu
- Toggle pour afficher l'upload d'image
- Prévisualisation de l'image uploadée
- Bouton de soumission avec état de chargement
- Gestion d'erreurs avec toast

**États**:
- `content`: Contenu textuel
- `imageUrl`: URL de l'image
- `isPosting`: État de soumission
- `showImageUpload`: Toggle upload

---

#### 2. `PostCard.tsx`
Affichage d'un post avec interactions.

**Fonctionnalités**:
- Affichage du contenu et de l'image
- Bouton Like avec optimistic update
- Bouton Commentaire
- Section commentaires (collapse/expand)
- Formulaire d'ajout de commentaire
- Bouton de suppression (si auteur)

**Optimisations**:
- ✅ Optimistic updates pour les likes
- ✅ Affichage conditionnel des commentaires
- ✅ Animations Tailwind

---

#### 3. `ImageUpload.tsx`
Composant d'upload d'image.

**Fonctionnalités**:
- Drag & drop
- Sélection de fichier
- Prévisualisation
- Bouton de suppression
- Gestion d'erreurs

Voir [components.md](./components.md) pour plus de détails.

## 🔐 Sécurité

### Authentification
- ✅ Toutes les actions nécessitent une authentification
- ✅ Vérification de l'utilisateur via `getDbUserId()`

### Autorisations
- ✅ Seul l'auteur peut supprimer son post
- ✅ Vérification d'autorisation avant suppression

### Validations
- ⚠️ **MANQUANT**: Validation Zod côté serveur
- ⚠️ **MANQUANT**: Sanitization du contenu
- ⚠️ **MANQUANT**: Rate limiting

**Recommandations**:
```typescript
// À implémenter
import { z } from 'zod';

const createPostSchema = z.object({
  content: z.string().max(500).optional(),
  image: z.string().url().optional(),
}).refine(data => data.content || data.image, {
  message: "Le post doit contenir du texte ou une image"
});
```

## 🔄 Flux de données

### Création d'un post
```
1. User saisit le contenu
2. (Optionnel) Upload d'image via UploadThing
3. Soumission du formulaire
4. createPost(content, imageUrl)
5. Insertion en DB
6. Revalidation du cache
7. Refresh de la page d'accueil
8. Post visible dans le fil
```

### Like d'un post
```
1. User clique sur le bouton Like
2. Optimistic update (UI immédiate)
3. toggleLike(postId)
4. Vérification like existant
5. Si nouveau like:
   - Création du like
   - Création de la notification
6. Revalidation
7. Synchronisation de l'UI
```

### Suppression d'un post
```
1. User clique sur le bouton Supprimer
2. Confirmation via AlertDialog
3. deletePost(postId)
4. Vérification des autorisations
5. Suppression en cascade:
   - Post
   - Comments
   - Likes
   - Notifications
6. Revalidation
7. Post retiré du fil
```

## 📊 Statistiques et Compteurs

Les données suivantes sont calculées via `_count`:
- **likes**: Nombre de likes du post
- **comments**: Nombre de commentaires du post

Exemple de requête:
```typescript
_count: {
  select: {
    likes: true,
    comments: true,
  },
}
```

## 🎨 Affichage

### Fil d'actualité (Home)
- Tri par date décroissante
- Tous les posts de tous les utilisateurs
- Informations complètes (author, likes, comments)

### Profil utilisateur
- Onglet "Posts": Posts de l'utilisateur
- Onglet "Likes": Posts likés par l'utilisateur
- Tri par date décroissante

## 📝 Notes importantes

- Les posts peuvent contenir uniquement du texte, uniquement une image, ou les deux
- Les images sont uploadées via UploadThing (max 4MB)
- La suppression d'un post supprime automatiquement tous les commentaires et likes associés
- Les notifications sont créées automatiquement lors des likes et commentaires

## 🔗 Fichiers associés

- Modèle: `prisma/schema.prisma`
- Actions: `src/actions/post.action.ts`
- Composants:
  - `src/components/CreatePost.tsx`
  - `src/components/PostCard.tsx`
  - `src/components/ImageUpload.tsx`
- Page: `src/app/page.tsx`

## 🐛 Problèmes connus

1. ⚠️ Pas de validation Zod côté serveur
2. ⚠️ Pas de sanitization du contenu (risque XSS)
3. ⚠️ Pas de pagination (problème de performance avec beaucoup de posts)
4. ⚠️ Images non optimisées (next/image non utilisé)

## 🚀 Améliorations futures

- [ ] Validation Zod côté serveur
- [ ] Sanitization du contenu
- [ ] Pagination ou infinite scroll
- [ ] Optimisation des images avec next/image
- [ ] Édition de posts
- [ ] Partage de posts
- [ ] Hashtags
- [ ] Mentions (@username)

---

**Voir aussi**:
- [Modèle de données détaillé](./model.md)
- [Documentation API](./api.md)
- [Composants UI](./components.md)
- [Module Commentaire](../03-COMMENT/README.md)
- [Module Like](../04-LIKE/README.md)
