# Module Follow

## 📋 Vue d'ensemble

Le module Follow gère le système de suivi entre utilisateurs, permettant de créer un réseau social et de personnaliser le fil d'actualité.

## 🎯 Responsabilités

- Gestion du follow/unfollow entre utilisateurs
- Prévention de l'auto-follow
- Suggestions d'utilisateurs à suivre
- Comptage des followers/following
- Gestion des notifications lors de nouveaux follows

## 📊 Modèle de Données

### Schéma Prisma

```prisma
model Follows {
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  // Relations
  follower  User @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("following", fields: [followingId], references: [id], onDelete: Cascade)

  @@index([followerId, followingId])
  @@id([followerId, followingId])
}
```

### Propriétés

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| followerId | String | ID de l'utilisateur qui suit | ✅ |
| followingId | String | ID de l'utilisateur suivi | ✅ |
| createdAt | DateTime | Date du follow | ✅ |

### Relations

- **follower**: L'utilisateur qui suit (Many-to-One avec User)
- **following**: L'utilisateur suivi (Many-to-One avec User)

### Contraintes

- ✅ **Clé primaire composite** `[followerId, followingId]` → **Empêche les follows en double**
- ✅ **Index composite** pour optimiser les requêtes
- ✅ **Cascade delete**: Si un utilisateur est supprimé → ses relations de follow sont supprimées

### Architecture Many-to-Many

```
User (follower) ←→ Follows ←→ User (following)

Exemple:
- Alice (followerId: user1) → Bob (followingId: user2)
  Signifie: Alice suit Bob
```

## 🔧 Server Actions

### Fichier: `src/actions/user.action.ts`

#### `toggleFollow(targetUserId: string)`

Gère le follow/unfollow d'un utilisateur.

**Paramètres**:
- `targetUserId` (String): ID de l'utilisateur à suivre/ne plus suivre

**Retour**: `{ success: boolean, error?: string }`

**Logique détaillée**:
```typescript
1. Récupère l'ID de l'utilisateur connecté (follower)
2. Valide que l'utilisateur ne se suit pas lui-même
3. Vérifie si une relation de follow existe déjà
4. Si relation existe:
   a. Supprime le follow (unfollow)
5. Si relation n'existe pas:
   a. Transaction Prisma:
      - Crée le follow
      - Crée une notification pour l'utilisateur suivi
6. Revalide le cache de la page
7. Retourne le résultat
```

**Code détaillé**:
```typescript
export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    // 1. Empêcher l'auto-follow
    if (userId === targetUserId) {
      throw new Error("You cannot follow yourself");
    }

    // 2. Vérifier si follow existe
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // 3. Unfollow: supprimer la relation
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // 4. Follow: créer la relation + notification
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId,  // Destinataire (celui qui est suivi)
            creatorId: userId,     // Créateur (celui qui suit)
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}
```

---

#### `getRandomUsers()`

Récupère 3 utilisateurs aléatoires à suggérer.

**Retour**: `Array<User>` (max 3)

**Logique**:
```typescript
1. Récupère l'ID de l'utilisateur connecté
2. Requête Prisma avec exclusions:
   a. Exclut l'utilisateur lui-même
   b. Exclut les utilisateurs déjà suivis
3. Retourne 3 utilisateurs avec leurs stats
```

**Code**:
```typescript
const randomUsers = await prisma.user.findMany({
  where: {
    AND: [
      { NOT: { id: userId } },                    // Pas soi-même
      {
        NOT: {
          followers: {
            some: {
              followerId: userId,                 // Pas déjà suivis
            },
          },
        },
      },
    ],
  },
  select: {
    id: true,
    name: true,
    username: true,
    image: true,
    _count: {
      select: {
        followers: true,
      },
    },
  },
  take: 3,
});
```

---

#### `isFollowing(userId: string)`

Vérifie si l'utilisateur connecté suit un utilisateur donné.

**Paramètres**:
- `userId` (String): ID de l'utilisateur à vérifier

**Retour**: `boolean`

**Code**:
```typescript
export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}
```

## 📱 Composants UI

### `FollowButton.tsx`

Bouton de follow/unfollow utilisé dans les profils et suggestions.

#### Props
```typescript
interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
}
```

#### État local
```typescript
const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
const [isPending, setIsPending] = useState(false);
```

#### Handler
```typescript
const handleToggleFollow = async () => {
  if (isPending) return;

  setIsPending(true);
  setIsFollowing(!isFollowing); // Optimistic update

  try {
    const result = await toggleFollow(userId);
    if (!result?.success) {
      setIsFollowing(!isFollowing); // Rollback
      toast.error("Failed to update follow status");
    }
  } catch (error) {
    setIsFollowing(!isFollowing); // Rollback
    toast.error("An error occurred");
  } finally {
    setIsPending(false);
  }
};
```

#### UI
```typescript
<Button
  variant={isFollowing ? "outline" : "default"}
  size="sm"
  onClick={handleToggleFollow}
  disabled={isPending}
>
  {isFollowing ? "Unfollow" : "Follow"}
</Button>
```

---

### `WhoToFollow.tsx`

Widget de suggestions d'utilisateurs à suivre.

**Fonctionnalités**:
- Affiche 3 suggestions aléatoires
- Avatar + nom + username
- Nombre de followers
- Bouton Follow

**Récupération des données**:
```typescript
const users = await getRandomUsers();
```

## 🔐 Sécurité

### Validations
- ✅ Empêche de se suivre soi-même
- ✅ Contrainte unique en base → impossible de suivre deux fois
- ✅ Vérification de l'authentification
- ✅ Gestion d'erreurs complète

### Protection
- ✅ Cascade delete sur suppression d'utilisateur
- ⚠️ **MANQUANT**: Rate limiting (spam possible)

## 🔄 Flux de données

### Follow d'un utilisateur
```
1. User clique "Follow"
2. Optimistic update: bouton devient "Unfollow"
3. toggleFollow(targetUserId)
4. Validation: pas d'auto-follow
5. Vérification: follow n'existe pas
6. Transaction:
   a. Création du follow
   b. Création de la notification
7. Revalidation
8. UI synchronisée
9. Notification envoyée à l'utilisateur suivi
```

### Unfollow d'un utilisateur
```
1. User clique "Unfollow"
2. Optimistic update: bouton devient "Follow"
3. toggleFollow(targetUserId)
4. Follow existe → Suppression
5. Pas de notification
6. Revalidation
7. UI synchronisée
```

## 📊 Statistiques

### Comptage des followers/following
```typescript
// Dans les requêtes User
_count: {
  select: {
    followers: true,  // Nombre de followers
    following: true,  // Nombre de following
  },
}
```

### Affichage
- **Followers**: Nombre de personnes qui suivent l'utilisateur
- **Following**: Nombre de personnes que l'utilisateur suit

## 🎨 UI/UX

### États du bouton
- **Not following**: Bouton bleu "Follow"
- **Following**: Bouton outline "Unfollow"
- **Loading**: Bouton désactivé

### Optimistic Updates
L'UI se met à jour instantanément avec rollback en cas d'erreur.

### Emplacements
- Page de profil
- Widget "Who to Follow" (sidebar)
- Résultats de recherche (future feature)

## 📝 Notes importantes

- Le système est un **toggle**: un clic ajoute/retire le follow
- Les follows sont **bidirectionnels** dans la relation mais **unidirectionnels** dans le comportement
  - Si Alice suit Bob, Bob ne suit pas automatiquement Alice
- Notification créée uniquement lors du follow, pas du unfollow
- Les statistiques sont mises à jour automatiquement via `_count`

## 🐛 Problèmes connus

1. ⚠️ Pas de rate limiting
2. ⚠️ Pas de liste des followers/following
3. ⚠️ Suggestions non personnalisées (aléatoires)
4. ⚠️ Pas de recherche d'utilisateurs

## 🚀 Améliorations futures

- [ ] Rate limiting pour prévenir le spam
- [ ] Page "Followers" avec liste complète
- [ ] Page "Following" avec liste complète
- [ ] Recherche d'utilisateurs
- [ ] Suggestions personnalisées (algorithme)
- [ ] Followers/Following mutuels
- [ ] Blocage d'utilisateurs
- [ ] Follow privé (demande d'abonnement)
- [ ] Analytics: croissance des followers
- [ ] Export de la liste de followers

## 🔗 Fichiers associés

- Modèle: `prisma/schema.prisma` (ligne 87-98)
- Actions: `src/actions/user.action.ts` (ligne 109-162)
- Actions profil: `src/actions/profile.action.ts` (ligne 178-197)
- Composants:
  - `src/components/FollowButton.tsx`
  - `src/components/WhoToFollow.tsx`
  - `src/components/Sidebar.tsx` (affichage stats)

## 📚 Dépendances

- **Module User**: Les follows relient deux utilisateurs
- **Module Notification**: Création de notifications lors de follows
- **Clerk**: Authentification
- **react-hot-toast**: Notifications UI

## 🔍 Requêtes Prisma courantes

### Récupérer les followers d'un utilisateur
```typescript
const followers = await prisma.follows.findMany({
  where: { followingId: userId },
  include: { follower: true },
});
```

### Récupérer les following d'un utilisateur
```typescript
const following = await prisma.follows.findMany({
  where: { followerId: userId },
  include: { following: true },
});
```

### Vérifier un follow mutuel
```typescript
const mutualFollow = await prisma.follows.findFirst({
  where: {
    AND: [
      { followerId: user1, followingId: user2 },
      { followerId: user2, followingId: user1 },
    ],
  },
});
```

---

**Voir aussi**:
- [Module User](../01-USER/README.md)
- [Module Notification](../06-NOTIFICATION/README.md)
