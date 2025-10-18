# Module Commentaire (Comment)

## 📋 Vue d'ensemble

Le module Commentaire gère le système de commentaires sur les posts, permettant aux utilisateurs d'interagir et de discuter sous les publications.

## 🎯 Responsabilités

- Création de commentaires sur les posts
- Affichage des commentaires avec informations de l'auteur
- Gestion des notifications lors de nouveaux commentaires
- Tri chronologique des commentaires

## 📊 Modèle de Données

### Schéma Prisma

```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String
  authorId  String
  postId    String
  createdAt DateTime @default(now())

  // Relations
  author        User           @relation(fields: [authorId], references: [id], onDelete: Cascade)
  post          Post           @relation(fields: [postId], references: [id], onDelete: Cascade)
  notifications Notification[]

  @@index([authorId, postId])
}
```

### Propriétés

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| id | String | Identifiant unique (CUID) | ✅ |
| content | String | Contenu du commentaire | ✅ |
| authorId | String | ID de l'auteur du commentaire | ✅ |
| postId | String | ID du post commenté | ✅ |
| createdAt | DateTime | Date de création | ✅ |

### Relations

- **author**: L'auteur du commentaire (Many-to-One avec User)
- **post**: Le post commenté (Many-to-One avec Post)
- **notifications**: Notifications liées au commentaire (One-to-Many)

### Index

- Composite index sur `[authorId, postId]` pour optimiser les requêtes

### Règles de cascade

- ✅ Si l'auteur est supprimé → commentaires supprimés
- ✅ Si le post est supprimé → commentaires supprimés

## 🔧 Server Actions

### Fichier: `src/actions/post.action.ts`

#### `createComment(postId: string, content: string)`

Crée un nouveau commentaire sur un post.

**Paramètres**:
- `postId` (String): ID du post à commenter
- `content` (String): Contenu du commentaire

**Retour**: `{ success: boolean, comment?: Comment, error?: string }`

**Logique détaillée**:
```typescript
1. Récupère l'ID de l'utilisateur connecté
2. Valide que le contenu n'est pas vide
3. Vérifie que le post existe et récupère l'authorId
4. Transaction Prisma:
   a. Crée le commentaire
   b. Si commentaire sur post d'autrui:
      - Crée une notification pour l'auteur du post
5. Revalide le cache de la page
6. Retourne le commentaire créé
```

**Validation**:
- ✅ Le contenu est requis (validation côté serveur)
- ✅ L'utilisateur doit être authentifié
- ✅ Le post doit exister

**Transaction Prisma**:
```typescript
const [comment] = await prisma.$transaction(async (tx) => {
  // 1. Créer le commentaire
  const newComment = await tx.comment.create({
    data: {
      content,
      authorId: userId,
      postId,
    },
  });

  // 2. Créer la notification (si commentaire sur post d'autrui)
  if (post.authorId !== userId) {
    await tx.notification.create({
      data: {
        type: "COMMENT",
        userId: post.authorId,      // Destinataire
        creatorId: userId,          // Auteur du commentaire
        postId,
        commentId: newComment.id,
      },
    });
  }

  return [newComment];
});
```

**Exemple d'utilisation**:
```typescript
const result = await createComment("post123", "Super article!");
if (result?.success) {
  toast.success("Commentaire ajouté!");
  setNewComment("");
}
```

**Gestion d'erreurs**:
```typescript
try {
  // Logique de création
} catch (error) {
  console.error("Failed to create comment:", error);
  return { success: false, error: "Failed to create comment" };
}
```

## 📱 Composants UI

### Affichage des commentaires (dans `PostCard.tsx`)

#### Section Commentaires
```typescript
{showComments && (
  <div className="space-y-4">
    {/* Liste des commentaires */}
    {post.comments.map((comment) => (
      <CommentItem key={comment.id} comment={comment} />
    ))}

    {/* Formulaire d'ajout */}
    {user ? (
      <CommentForm onSubmit={handleAddComment} />
    ) : (
      <SignInButton />
    )}
  </div>
)}
```

#### Affichage d'un commentaire
```typescript
<div className="flex space-x-3">
  <Avatar>
    <AvatarImage src={comment.author.image ?? "/avatar.png"} />
  </Avatar>
  <div>
    <div className="flex items-center gap-2">
      <span className="font-semibold">{comment.author.name}</span>
      <span className="text-muted-foreground">@{comment.author.username}</span>
      <span className="text-muted-foreground">
        {formatDistanceToNow(new Date(comment.createdAt))} ago
      </span>
    </div>
    <p className="text-sm">{comment.content}</p>
  </div>
</div>
```

### Formulaire de commentaire

**États**:
- `newComment`: Contenu du commentaire
- `isCommenting`: État de soumission

**Soumission**:
```typescript
const handleAddComment = async () => {
  if (!newComment.trim() || isCommenting) return;

  setIsCommenting(true);
  try {
    const result = await createComment(post.id, newComment);
    if (result?.success) {
      toast.success("Comment posted successfully");
      setNewComment("");
    }
  } catch (error) {
    toast.error("Failed to add comment");
  } finally {
    setIsCommenting(false);
  }
};
```

## 🔐 Sécurité

### Authentification
- ✅ Vérification de l'utilisateur connecté
- ✅ Impossible de commenter sans authentification

### Validations
- ✅ Le contenu ne peut pas être vide
- ✅ Vérification de l'existence du post
- ⚠️ **MANQUANT**: Limitation de la longueur du commentaire
- ⚠️ **MANQUANT**: Sanitization du contenu (risque XSS)

### Recommandations de sécurité

**Validation Zod à implémenter**:
```typescript
import { z } from 'zod';

const createCommentSchema = z.object({
  postId: z.string().cuid(),
  content: z.string()
    .min(1, "Le commentaire ne peut pas être vide")
    .max(500, "Le commentaire ne peut pas dépasser 500 caractères")
    .trim(),
});
```

**Sanitization HTML**:
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizedContent = DOMPurify.sanitize(content);
```

## 🔄 Flux de données

### Ajout d'un commentaire
```
1. User saisit un commentaire
2. User clique "Commenter"
3. Validation côté client (non vide)
4. createComment(postId, content)
5. Validation côté serveur
6. Vérification existence du post
7. Transaction:
   a. Création du commentaire
   b. Création de la notification
8. Revalidation du cache
9. Refresh de la section commentaires
10. Affichage du nouveau commentaire
11. Notification envoyée à l'auteur du post
```

### Affichage des commentaires
```
1. User clique sur l'icône de commentaire
2. Toggle showComments = true
3. Affichage de tous les commentaires du post
4. Tri par date croissante (plus anciens d'abord)
5. Affichage du formulaire si authentifié
```

## 📊 Récupération des données

Les commentaires sont récupérés via les requêtes de posts:

```typescript
// Dans getPosts() ou getUserPosts()
include: {
  comments: {
    include: {
      author: {
        select: {
          id: true,
          username: true,
          image: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc", // Plus anciens d'abord
    },
  },
}
```

## 🎨 UI/UX

### Interactions
- ✅ Toggle pour afficher/masquer les commentaires
- ✅ Animation lors de l'ouverture
- ✅ Formulaire visible uniquement si authentifié
- ✅ Message d'invitation à se connecter si non authentifié
- ✅ État de chargement pendant la soumission
- ✅ Toast de confirmation/erreur

### Affichage
- Avatar de l'auteur
- Nom complet + username
- Temps écoulé (relatif)
- Contenu du commentaire
- Design cohérent avec le reste de l'app

## 📝 Notes importantes

- Les commentaires sont triés du plus ancien au plus récent (conversation chronologique)
- Pas de système de réponse aux commentaires (pas de threading)
- Pas de modification de commentaires
- Pas de suppression de commentaires (sauf cascade si post/user supprimé)
- Une notification est créée uniquement si le commentaire est sur le post d'un autre utilisateur

## 🐛 Problèmes connus

1. ⚠️ Pas de validation de longueur maximale
2. ⚠️ Pas de sanitization du contenu (risque XSS)
3. ⚠️ Impossible de modifier/supprimer un commentaire
4. ⚠️ Pas de pagination (problème si beaucoup de commentaires)
5. ⚠️ Pas de rate limiting (spam possible)

## 🚀 Améliorations futures

- [ ] Validation Zod côté serveur
- [ ] Sanitization du contenu
- [ ] Modification de commentaires
- [ ] Suppression de commentaires (auteur uniquement)
- [ ] Système de réponses (threading)
- [ ] Pagination des commentaires
- [ ] Rate limiting
- [ ] Mentions (@username)
- [ ] Emojis/Reactions
- [ ] Signalement de commentaires

## 🔗 Fichiers associés

- Modèle: `prisma/schema.prisma` (ligne 58-71)
- Actions: `src/actions/post.action.ts` (ligne 144-191)
- Composant: `src/components/PostCard.tsx` (section commentaires ligne 161-230)
- Type: Inféré depuis `getPosts()` return type

## 📚 Dépendances

- **Module Post**: Les commentaires appartiennent à un post
- **Module User**: Les commentaires ont un auteur
- **Module Notification**: Création de notifications lors de nouveaux commentaires
- **Clerk**: Authentification de l'auteur
- **date-fns**: Formatage des dates (`formatDistanceToNow`)
- **react-hot-toast**: Notifications UI

---

**Voir aussi**:
- [Module Post](../02-POST/README.md)
- [Module Notification](../06-NOTIFICATION/README.md)
- [Module User](../01-USER/README.md)
