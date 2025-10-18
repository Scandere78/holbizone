# Module Like

## 📋 Vue d'ensemble

Le module Like gère le système de "j'aime" sur les posts, permettant aux utilisateurs d'exprimer leur appréciation pour une publication.

## 🎯 Responsabilités

- Ajout/Suppression de likes sur les posts
- Prévention des likes en double
- Gestion des notifications lors de nouveaux likes
- Comptage des likes par post
- Vérification de l'état "liked" par utilisateur

## 📊 Modèle de Données

### Schéma Prisma

```prisma
model Like {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([userId, postId])
  @@unique([userId, postId])
}
```

### Propriétés

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| id | String | Identifiant unique (CUID) | ✅ |
| postId | String | ID du post liké | ✅ |
| userId | String | ID de l'utilisateur | ✅ |
| createdAt | DateTime | Date de création du like | ✅ |

### Relations

- **user**: L'utilisateur qui a liké (Many-to-One avec User)
- **post**: Le post liké (Many-to-One avec Post)

### Contraintes

- ✅ **Index composite** sur `[userId, postId]` pour performance
- ✅ **Contrainte unique** sur `[userId, postId]` → **Empêche les likes en double**
- ✅ **Cascade delete**: Si le post est supprimé → likes supprimés
- ✅ **Cascade delete**: Si l'utilisateur est supprimé → ses likes supprimés

## 🔧 Server Actions

### Fichier: `src/actions/post.action.ts`

#### `toggleLike(postId: string)`

Ajoute ou retire un like sur un post (toggle).

**Paramètres**:
- `postId` (String): ID du post à liker/unliker

**Retour**: `{ success: boolean, error?: string }`

**Logique détaillée**:
```typescript
1. Récupère l'ID de l'utilisateur connecté
2. Vérifie si un like existe déjà pour ce couple (userId, postId)
3. Récupère l'authorId du post
4. Si like existe:
   a. Supprime le like (unlike)
5. Si like n'existe pas:
   a. Transaction Prisma:
      - Crée le like
      - Si post d'un autre utilisateur: crée une notification
6. Revalide le cache de la page
7. Retourne le résultat
```

**Code détaillé**:
```typescript
export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    // 1. Vérifier si like existe
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    // 2. Récupérer l'auteur du post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      // 3. Unlike: supprimer le like
      await prisma.like.delete({
        where: {
          userId_postId: { userId, postId },
        },
      });
    } else {
      // 4. Like: créer le like + notification
      await prisma.$transaction([
        // Créer le like
        prisma.like.create({
          data: { userId, postId },
        }),
        // Créer notification (sauf si like de son propre post)
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId,  // Destinataire
                  creatorId: userId,      // Auteur du like
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}
```

**Exemple d'utilisation**:
```typescript
const result = await toggleLike("post123");
if (result?.success) {
  // Like/unlike réussi
}
```

## 📱 Composants UI

### Bouton Like (dans `PostCard.tsx`)

#### État local
```typescript
const [hasLiked, setHasLiked] = useState(
  post.likes.some((like) => like.userId === dbUserId)
);
const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);
const [isLiking, setIsLiking] = useState(false);
```

#### Optimistic Update
```typescript
const handleLike = async () => {
  if (isLiking) return;

  try {
    setIsLiking(true);

    // Mise à jour optimiste de l'UI
    setHasLiked((prev) => !prev);
    setOptimisticLikes((prev) => prev + (hasLiked ? -1 : 1));

    // Appel serveur
    await toggleLike(post.id);
  } catch (error) {
    // Rollback en cas d'erreur
    setOptimisticLikes(post._count.likes);
    setHasLiked(post.likes.some((like) => like.userId === dbUserId));
  } finally {
    setIsLiking(false);
  }
};
```

#### UI du bouton
```typescript
<Button
  variant="ghost"
  size="sm"
  className={hasLiked ? "text-red-500" : "text-muted-foreground"}
  onClick={handleLike}
>
  {hasLiked ? (
    <HeartIcon className="size-5 fill-current animate-pulse" />
  ) : (
    <HeartIcon className="size-5" />
  )}
  <span className="font-semibold">{optimisticLikes}</span>
</Button>
```

### Fonctionnalités UI

- ✅ **Optimistic update**: L'UI se met à jour immédiatement
- ✅ **Rollback automatique**: Si erreur, retour à l'état précédent
- ✅ **Animation**: Icône cœur pulse quand liké
- ✅ **Couleur**: Rouge si liké, gris sinon
- ✅ **Compteur**: Affiche le nombre de likes
- ✅ **Protection**: Empêche les clics multiples pendant le traitement

## 🔐 Sécurité

### Authentification
- ✅ Vérification de l'utilisateur connecté
- ✅ Impossible de liker sans authentification

### Protection contre les abus
- ✅ Contrainte unique en base → impossible de liker deux fois
- ✅ Protection côté client contre les clics multiples
- ⚠️ **MANQUANT**: Rate limiting (spam possible)

### Validation
- ✅ Vérification de l'existence du post
- ✅ Gestion d'erreurs complète

## 🔄 Flux de données

### Like d'un post
```
1. User clique sur le bouton Like
2. Vérification: isLiking = false ?
3. setIsLiking(true)
4. Optimistic update:
   a. setHasLiked(true)
   b. setOptimisticLikes(count + 1)
5. Appel serveur: toggleLike(postId)
6. Serveur:
   a. Vérification like existant
   b. Like n'existe pas → Création
   c. Transaction:
      - Création du like
      - Création de la notification
7. Revalidation du cache
8. setIsLiking(false)
9. Page rafraîchie avec données synchronisées
```

### Unlike d'un post
```
1. User clique sur le bouton Like (déjà liké)
2. Optimistic update:
   a. setHasLiked(false)
   b. setOptimisticLikes(count - 1)
3. Appel serveur: toggleLike(postId)
4. Serveur:
   a. Like existe → Suppression
   b. Pas de notification
5. Revalidation
6. UI synchronisée
```

## 📊 Récupération des données

### Dans les requêtes de posts
```typescript
include: {
  likes: {
    select: {
      userId: true, // Pour vérifier si l'utilisateur a liké
    },
  },
  _count: {
    select: {
      likes: true, // Nombre total de likes
    },
  },
}
```

### Vérification du like utilisateur
```typescript
// Côté client
const hasLiked = post.likes.some((like) => like.userId === dbUserId);
```

### Comptage des likes
```typescript
const likeCount = post._count.likes;
```

## 🎨 UI/UX

### États visuels
- **Non liké**: Icône cœur vide, gris
- **Liké**: Icône cœur plein, rouge, animation pulse
- **Hover**: Changement de couleur
- **Chargement**: Désactivation du bouton

### Optimistic Updates
L'UI se met à jour **instantanément** sans attendre la réponse serveur, offrant une expérience fluide.

### Feedback utilisateur
- Animation visuelle lors du like
- Compteur mis à jour en temps réel
- Pas de toast (action silencieuse)

## 📝 Notes importantes

- Le système est un **toggle**: un clic ajoute/retire le like
- Impossible de liker son propre post (mais aucune notification créée)
- Les likes sont **anonymes**: seul le compteur est public
- Optimistic updates pour une UX fluide
- Rollback automatique en cas d'erreur réseau

## 🐛 Problèmes connus

1. ⚠️ Pas de rate limiting (spam possible)
2. ⚠️ Pas de liste des utilisateurs qui ont liké
3. ⚠️ Impossible de voir qui a liké un post
4. ⚠️ Pas d'analytics sur les likes

## 🚀 Améliorations futures

- [ ] Rate limiting pour prévenir le spam
- [ ] Liste des utilisateurs qui ont liké (modal)
- [ ] Analytics: posts les plus likés
- [ ] Reactions multiples (❤️ 👍 😂 etc.)
- [ ] Notifications groupées si beaucoup de likes
- [ ] Timeline des likes pour un utilisateur
- [ ] Export des statistiques de likes

## 🔗 Fichiers associés

- Modèle: `prisma/schema.prisma` (ligne 73-85)
- Actions: `src/actions/post.action.ts` (ligne 80-142)
- Composant: `src/components/PostCard.tsx` (ligne 29-42, 119-146)
- Type: Inféré depuis `getPosts()` return type

## 📚 Dépendances

- **Module Post**: Les likes appartiennent à un post
- **Module User**: Les likes ont un auteur
- **Module Notification**: Création de notifications lors de likes
- **Clerk**: Authentification de l'utilisateur
- **Lucide React**: Icône `HeartIcon`

## 🔍 Requêtes Prisma courantes

### Compter les likes d'un post
```typescript
const likeCount = await prisma.like.count({
  where: { postId: "post123" },
});
```

### Vérifier si un utilisateur a liké
```typescript
const hasLiked = await prisma.like.findUnique({
  where: {
    userId_postId: {
      userId: "user123",
      postId: "post123",
    },
  },
});
```

### Récupérer tous les likes d'un utilisateur
```typescript
const userLikes = await prisma.like.findMany({
  where: { userId: "user123" },
  include: { post: true },
});
```

---

**Voir aussi**:
- [Module Post](../02-POST/README.md)
- [Module Notification](../06-NOTIFICATION/README.md)
- [Module User](../01-USER/README.md)
