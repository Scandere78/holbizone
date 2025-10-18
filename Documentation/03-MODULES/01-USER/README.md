# Module Utilisateur (User)

## 📋 Vue d'ensemble

Le module Utilisateur gère toutes les fonctionnalités liées aux comptes utilisateurs, incluant la création, la synchronisation avec Clerk, la gestion des profils et les interactions sociales (follow/unfollow).

## 🎯 Responsabilités

- Synchronisation avec Clerk Authentication
- Gestion des profils utilisateurs
- Système de follow/unfollow
- Recherche et suggestions d'utilisateurs
- Statistiques utilisateur (followers, following, posts)

## 📊 Modèle de Données

### Schéma Prisma

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  clerkId   String   @unique
  name      String?
  bio       String?
  image     String?
  location  String?
  website   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  posts                  Post[]
  comments               Comment[]
  likes                  Like[]
  followers              Follows[] @relation("following")
  following              Follows[] @relation("follower")
  notifications          Notification[] @relation("userNotifications")
  notificationsCreated   Notification[] @relation("notificationCreator")
}
```

### Propriétés

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| id | String | Identifiant unique (CUID) | ✅ |
| email | String | Email (unique) | ✅ |
| username | String | Nom d'utilisateur (unique) | ✅ |
| clerkId | String | ID Clerk (unique) | ✅ |
| name | String | Nom complet | ❌ |
| bio | String | Biographie | ❌ |
| image | String | URL de l'avatar | ❌ |
| location | String | Localisation | ❌ |
| website | String | Site web | ❌ |
| createdAt | DateTime | Date de création | ✅ |
| updatedAt | DateTime | Date de mise à jour | ✅ |

### Relations

- **posts**: Un utilisateur peut avoir plusieurs posts (One-to-Many)
- **comments**: Un utilisateur peut avoir plusieurs commentaires (One-to-Many)
- **likes**: Un utilisateur peut avoir plusieurs likes (One-to-Many)
- **followers**: Utilisateurs qui suivent cet utilisateur (Many-to-Many via Follows)
- **following**: Utilisateurs suivis par cet utilisateur (Many-to-Many via Follows)
- **notifications**: Notifications reçues (One-to-Many)
- **notificationsCreated**: Notifications créées par l'utilisateur (One-to-Many)

## 🔧 Server Actions

### Fichier: `src/actions/user.action.ts`

#### 1. `syncUser()`

Synchronise l'utilisateur Clerk avec la base de données.

**Type**: Server Action (création)

**Retour**: `User | undefined`

**Logique**:
```typescript
1. Récupère l'utilisateur Clerk authentifié
2. Vérifie si l'utilisateur existe dans la DB
3. Si oui → retourne l'utilisateur existant
4. Si non → crée un nouvel utilisateur avec les données Clerk
```

**Code détaillé**:
```typescript
export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser", error);
  }
}
```

**Exemple d'utilisation**:
```typescript
const user = await syncUser();
```

---

#### 2. `getUserByClerkId(clerkId: string)`

Récupère un utilisateur par son ID Clerk avec statistiques.

**Paramètres**:
- `clerkId` (String): ID Clerk de l'utilisateur

**Retour**: `User` avec compteurs (followers, following, posts)

**Code détaillé**:
```typescript
export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}
```

**Exemple d'utilisation**:
```typescript
const user = await getUserByClerkId("user_xyz123");
// user._count.followers → Nombre de followers
// user._count.following → Nombre de following
// user._count.posts → Nombre de posts
```

---

#### 3. `getDbUserId()`

Récupère l'ID base de données de l'utilisateur connecté.

**Type**: Server Action (utilitaire)

**Retour**: `string | null`

**Logique**:
```typescript
1. Récupère le clerkId de la session
2. Cherche l'utilisateur dans la DB
3. Retourne l'ID DB ou null si non trouvé
```

**Code détaillé**:
```typescript
export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}
```

**Exemple d'utilisation**:
```typescript
const userId = await getDbUserId();
if (!userId) return; // Non authentifié
```

---

#### 4. `getRandomUsers()`

Récupère 3 utilisateurs aléatoires à suggérer (exclus l'utilisateur actuel et ceux déjà suivis).

**Retour**: `Array<User>` (max 3 utilisateurs)

**Logique**:
```typescript
1. Récupère l'ID de l'utilisateur connecté
2. Exclut l'utilisateur actuel
3. Exclut les utilisateurs déjà suivis
4. Retourne 3 utilisateurs aléatoires
```

**Code détaillé**:
```typescript
export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    // get 3 random users exclude ourselves & users that we already follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
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

    return randomUsers;
  } catch (error) {
    console.log("Error fetching random users", error);
    return [];
  }
}
```

**Exemple d'utilisation**:
```typescript
const suggestions = await getRandomUsers();
```

---

#### 5. `toggleFollow(targetUserId: string)`

Gère le follow/unfollow d'un utilisateur.

**Paramètres**:
- `targetUserId` (String): ID de l'utilisateur cible

**Retour**: `{ success: boolean, error?: string }`

**Logique**:
```typescript
1. Vérifie que l'utilisateur ne se suit pas lui-même
2. Cherche une relation de follow existante
3. Si existe → supprime (unfollow)
4. Si n'existe pas → crée (follow) + notification
```

**Transaction Prisma**:
- Création du follow
- Création de la notification (si follow)

**Code détaillé**:
```typescript
export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
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
            userId: targetUserId, // user being followed
            creatorId: userId, // user following
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

**Exemple d'utilisation**:
```typescript
const result = await toggleFollow("user123");
if (result.success) {
  // Follow/unfollow réussi
}
```

## 📱 Composants UI

### 1. `Sidebar.tsx`

Affiche le profil de l'utilisateur connecté dans la sidebar.

**Données affichées**:
- Avatar
- Nom complet
- Username
- Statistiques (followers, following)

**Code**:
```typescript
const { user } = useUser();
const dbUser = await getUserByClerkId(user?.id);

<div className="profile">
  <Avatar>
    <AvatarImage src={user?.imageUrl} />
  </Avatar>
  <div>
    <h3>{dbUser?.name}</h3>
    <p>@{dbUser?.username}</p>
  </div>
  <div className="stats">
    <span>{dbUser?._count.following} Following</span>
    <span>{dbUser?._count.followers} Followers</span>
  </div>
</div>
```

---

### 2. `WhoToFollow.tsx`

Widget de suggestions d'utilisateurs à suivre.

**Fonctionnalités**:
- Affiche 3 suggestions aléatoires
- Avatar + nom + username
- Nombre de followers
- Bouton Follow

**Code**:
```typescript
const users = await getRandomUsers();

{users.map((user) => (
  <div key={user.id} className="user-suggestion">
    <Avatar>
      <AvatarImage src={user.image ?? "/avatar.png"} />
    </Avatar>
    <div>
      <h4>{user.name}</h4>
      <p>@{user.username}</p>
      <span>{user._count.followers} followers</span>
    </div>
    <FollowButton userId={user.id} initialIsFollowing={false} />
  </div>
))}
```

---

### 3. `FollowButton.tsx`

Bouton de follow/unfollow avec optimistic updates.

**Props**:
```typescript
interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
}
```

**États**:
```typescript
const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
const [isPending, setIsPending] = useState(false);
```

**Handler**:
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

**UI**:
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

### 4. `ProfilePageClient.tsx`

Page de profil utilisateur avec onglets.

**Fonctionnalités**:
- Affichage du profil complet
- Statistiques (posts, followers, following)
- Bouton Follow/Unfollow (si profil d'autrui)
- Bouton Edit Profile (si son propre profil)
- Onglets: Posts / Likes

**Récupération des données**:
```typescript
const user = await getProfileByUsername(username);
const isFollowing = await isFollowing(user.id);
```

## 🔐 Sécurité

### Authentification
- Toutes les actions utilisent `auth()` de Clerk
- Vérification de l'utilisateur connecté avant toute opération

### Validations
- ✅ Empêche de se suivre soi-même
- ✅ Vérification de l'existence de l'utilisateur
- ✅ Unicité email/username garantie par Prisma

### Gestion d'erreurs
- Try/catch sur toutes les actions
- Logs en console pour debugging
- Retours d'erreur explicites

## 📊 Statistiques

Les compteurs suivants sont disponibles via `_count`:
- **followers**: Nombre de followers
- **following**: Nombre d'utilisateurs suivis
- **posts**: Nombre de posts créés

**Exemple de requête**:
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    _count: {
      select: {
        followers: true,
        following: true,
        posts: true,
      },
    },
  },
});

console.log(user._count.followers); // 42
```

## 🔄 Flux de données

### Création d'utilisateur (Sign Up)
```
1. User s'inscrit via Clerk
2. Clerk crée le compte
3. Redirection vers l'application
4. syncUser() appelé automatiquement
5. Utilisateur créé dans PostgreSQL
6. Session établie
```

### Follow d'un utilisateur
```
1. User clique "Follow"
2. toggleFollow(targetUserId)
3. Vérification: pas d'auto-follow
4. Transaction:
   - Création du follow
   - Création de la notification
5. Revalidation de la page
6. UI mise à jour
7. Notification envoyée
```

### Mise à jour du profil
```
1. User modifie son profil
2. updateProfile(formData)
3. Validation des données
4. Mise à jour en DB
5. Revalidation
6. UI synchronisée
```

## 📝 Notes importantes

- La synchronisation Clerk ↔ DB est manuelle via `syncUser()`
- Les usernames sont générés depuis l'email si non fournis
- Le système de follow utilise une table pivot `Follows`
- Les notifications sont créées automatiquement lors d'un follow

## 🐛 Problèmes connus

1. ⚠️ Pas de validation Zod côté serveur
2. ⚠️ Pas de sanitization des inputs
3. ⚠️ Pas de rate limiting
4. ⚠️ Suggestions non personnalisées (aléatoires)
5. ⚠️ Pas de recherche d'utilisateurs

## 🚀 Améliorations futures

- [ ] Validation Zod pour updateProfile
- [ ] Recherche d'utilisateurs par nom/username
- [ ] Suggestions personnalisées (algorithme)
- [ ] Liste complète followers/following
- [ ] Blocage d'utilisateurs
- [ ] Profils privés
- [ ] Badges/Vérification
- [ ] Import/Export de données utilisateur
- [ ] Suppression de compte

## 🔗 Fichiers associés

- Modèle: `prisma/schema.prisma` (ligne 16-39)
- Actions: `src/actions/user.action.ts`
- Actions profil: `src/actions/profile.action.ts`
- Composants:
  - `src/components/Sidebar.tsx`
  - `src/components/WhoToFollow.tsx`
  - `src/components/FollowButton.tsx`
- Pages:
  - `src/app/profile/[username]/page.tsx`
  - `src/app/profile/[username]/ProfilePageClient.tsx`

## 📚 Dépendances

- **Clerk**: Authentification
- **Prisma**: ORM
- **React**: UI
- **date-fns**: Formatage de dates (member since)
- **react-hot-toast**: Notifications

---

**Voir aussi**:
- [Module Follow](../05-FOLLOW/README.md)
- [Module Post](../02-POST/README.md)
- [Module Notification](../06-NOTIFICATION/README.md)
- [Actions Profile](../../../src/actions/profile.action.ts)
