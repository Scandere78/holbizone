# Module Notification

## 📋 Vue d'ensemble

Le module Notification gère le système de notifications en temps réel, informant les utilisateurs des interactions sur leur contenu (likes, commentaires, nouveaux followers).

## 🎯 Responsabilités

- Création automatique de notifications lors d'interactions
- Affichage des notifications non lues
- Marquage des notifications comme lues
- Gestion des différents types de notifications
- Association aux entités liées (post, commentaire)

## 📊 Modèle de Données

### Schéma Prisma

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  creatorId String
  type      NotificationType
  read      Boolean          @default(false)
  postId    String?
  commentId String?
  createdAt DateTime         @default(now())

  // Relations
  user    User     @relation("userNotifications", fields: [userId], references: [id], onDelete: Cascade)
  creator User     @relation("notificationCreator", fields: [creatorId], references: [id], onDelete: Cascade)
  post    Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment Comment? @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

enum NotificationType {
  LIKE
  COMMENT
  FOLLOW
}
```

### Propriétés

| Champ | Type | Description | Requis |
|-------|------|-------------|--------|
| id | String | Identifiant unique (CUID) | ✅ |
| userId | String | ID du destinataire | ✅ |
| creatorId | String | ID de l'auteur de l'action | ✅ |
| type | NotificationType | Type de notification | ✅ |
| read | Boolean | État de lecture | ✅ (défaut: false) |
| postId | String | ID du post (si applicable) | ❌ |
| commentId | String | ID du commentaire (si applicable) | ❌ |
| createdAt | DateTime | Date de création | ✅ |

### Types de Notifications

#### 1. LIKE
- **Déclencheur**: Un utilisateur like un post
- **Données**: userId, creatorId, postId
- **Message**: "{creator.name} a aimé votre post"

#### 2. COMMENT
- **Déclencheur**: Un utilisateur commente un post
- **Données**: userId, creatorId, postId, commentId
- **Message**: "{creator.name} a commenté votre post"

#### 3. FOLLOW
- **Déclencheur**: Un utilisateur vous suit
- **Données**: userId, creatorId
- **Message**: "{creator.name} a commencé à vous suivre"

### Relations

- **user**: Destinataire de la notification (Many-to-One avec User)
- **creator**: Auteur de l'action (Many-to-One avec User)
- **post**: Post associé (Many-to-One avec Post, optionnel)
- **comment**: Commentaire associé (Many-to-One avec Comment, optionnel)

### Contraintes

- ✅ **Index composite** sur `[userId, createdAt]` pour optimiser les requêtes
- ✅ **Cascade delete**: Si l'utilisateur est supprimé → notifications supprimées
- ✅ **Cascade delete**: Si le post est supprimé → notifications liées supprimées

## 🔧 Server Actions

### Fichier: `src/actions/notification.action.ts`

#### 1. `getNotifications()`

Récupère toutes les notifications de l'utilisateur connecté.

**Retour**: `Array<Notification>` avec relations complètes

**Données incluses**:
- ✅ Informations du créateur (id, name, username, image)
- ✅ Informations du post (id, content, image)
- ✅ Informations du commentaire (id, content, createdAt)

**Tri**: Par date décroissante (plus récentes en premier)

**Code**:
```typescript
export async function getNotifications() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}
```

---

#### 2. `markNotificationsAsRead(notificationIds: string[])`

Marque plusieurs notifications comme lues.

**Paramètres**:
- `notificationIds` (Array<String>): Liste des IDs de notifications à marquer

**Retour**: `{ success: boolean, error?: string }`

**Code**:
```typescript
export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false, error: "Failed to mark notifications as read" };
  }
}
```

## 🔄 Création automatique de notifications

Les notifications sont créées automatiquement dans les Server Actions suivantes :

### 1. Lors d'un Like (`toggleLike`)
```typescript
// Dans post.action.ts
if (!existingLike && post.authorId !== userId) {
  await prisma.notification.create({
    data: {
      type: "LIKE",
      userId: post.authorId,   // Destinataire
      creatorId: userId,       // Auteur du like
      postId,
    },
  });
}
```

**Conditions**:
- ✅ Création uniquement si nouveau like
- ✅ Pas de notification si like de son propre post

---

### 2. Lors d'un Commentaire (`createComment`)
```typescript
// Dans post.action.ts
if (post.authorId !== userId) {
  await tx.notification.create({
    data: {
      type: "COMMENT",
      userId: post.authorId,   // Destinataire
      creatorId: userId,       // Auteur du commentaire
      postId,
      commentId: newComment.id,
    },
  });
}
```

**Conditions**:
- ✅ Création dans une transaction
- ✅ Pas de notification si commentaire sur son propre post

---

### 3. Lors d'un Follow (`toggleFollow`)
```typescript
// Dans user.action.ts
if (!existingFollow) {
  await prisma.$transaction([
    prisma.follows.create({ /* ... */ }),
    prisma.notification.create({
      data: {
        type: "FOLLOW",
        userId: targetUserId,  // Utilisateur suivi
        creatorId: userId,     // Utilisateur qui suit
      },
    }),
  ]);
}
```

**Conditions**:
- ✅ Création uniquement lors d'un nouveau follow
- ✅ Pas de notification lors d'un unfollow

## 📱 Composants UI

### Page Notifications (`src/app/notifications/page.tsx`)

#### Fonctionnalités
- Affichage de toutes les notifications
- Badge "New" sur les notifications non lues
- Marquage automatique comme lu lors de l'affichage
- Avatar du créateur
- Message formaté selon le type
- Timestamp relatif
- Lien vers le contenu associé

#### Structure
```typescript
// Récupération des données
const notifications = await getNotifications();
const unreadIds = notifications
  .filter((n) => !n.read)
  .map((n) => n.id);

// Marquage comme lu
useEffect(() => {
  if (unreadIds.length > 0) {
    markNotificationsAsRead(unreadIds);
  }
}, []);

// Affichage
{notifications.map((notification) => (
  <NotificationItem key={notification.id} notification={notification} />
))}
```

#### Affichage par type

**LIKE**:
```
[Avatar] {creator.name} a aimé votre post
"post.content..."
[il y a 2h] [NEW]
```

**COMMENT**:
```
[Avatar] {creator.name} a commenté votre post
"comment.content..."
[il y a 1h] [NEW]
```

**FOLLOW**:
```
[Avatar] {creator.name} a commencé à vous suivre
[il y a 30min] [NEW]
```

### Badge de notifications

Dans la Navbar:
```typescript
// Compteur de notifications non lues
const unreadCount = notifications.filter((n) => !n.read).length;

<Badge>{unreadCount}</Badge>
```

## 🎨 UI/UX

### États visuels
- **Non lue**: Badge "New" + fond légèrement coloré
- **Lue**: Affichage normal
- **Hover**: Mise en surbrillance

### Interactions
- Clic sur une notification → Redirection vers le contenu
- Marquage automatique comme lu lors de l'affichage
- Scroll infinit (future feature)

### Formatage du temps
```typescript
import { formatDistanceToNow } from "date-fns";

formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
// "il y a 2 heures"
```

## 🔐 Sécurité

### Authentification
- ✅ Seules les notifications de l'utilisateur connecté sont récupérées
- ✅ Vérification via `getDbUserId()`

### Validations
- ✅ Filtrage par userId en base de données
- ✅ Impossible de voir les notifications d'autrui

### Privacy
- ✅ Pas de notification si interaction sur son propre contenu
- ✅ Cascade delete sur suppression d'utilisateur/contenu

## 🔄 Flux de données

### Création d'une notification
```
1. Action utilisateur (like/comment/follow)
2. Vérification: pas d'auto-notification
3. Création de la notification dans une transaction
4. Notification stockée en DB avec read=false
5. Destinataire voit le badge mis à jour
```

### Consultation des notifications
```
1. User clique sur l'icône de notifications
2. Redirection vers /notifications
3. getNotifications()
4. Filtrage des IDs non lus
5. Affichage des notifications
6. useEffect → markNotificationsAsRead(unreadIds)
7. Mise à jour en DB: read=true
8. Badge disparaît
```

## 📊 Statistiques

### Comptage des notifications non lues
```typescript
const unreadCount = await prisma.notification.count({
  where: {
    userId: currentUserId,
    read: false,
  },
});
```

### Notifications récentes (7 derniers jours)
```typescript
const recentNotifications = await prisma.notification.findMany({
  where: {
    userId: currentUserId,
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  },
});
```

## 📝 Notes importantes

- Les notifications sont créées **automatiquement** lors d'interactions
- Pas de notification pour les interactions sur son propre contenu
- Le marquage comme lu est **automatique** lors de la consultation
- Les notifications sont triées de la plus récente à la plus ancienne
- Suppression en cascade si le contenu ou l'utilisateur est supprimé

## 🐛 Problèmes connus

1. ⚠️ Pas de notification en temps réel (pas de WebSocket)
2. ⚠️ Toutes les notifications sont marquées comme lues d'un coup
3. ⚠️ Pas de pagination (problème avec beaucoup de notifications)
4. ⚠️ Pas de regroupement des notifications similaires
5. ⚠️ Pas de préférences de notifications

## 🚀 Améliorations futures

- [ ] Notifications en temps réel (WebSocket/Pusher)
- [ ] Marquage individuel comme lu/non lu
- [ ] Pagination ou infinite scroll
- [ ] Regroupement: "Alice et 5 autres ont aimé votre post"
- [ ] Préférences de notifications (email, push, in-app)
- [ ] Notifications push (PWA)
- [ ] Suppression de notifications
- [ ] Filtre par type de notification
- [ ] Son/vibration lors de nouvelles notifications
- [ ] Notifications par email (digest quotidien)

## 🔗 Fichiers associés

- Modèle: `prisma/schema.prisma` (ligne 100-123)
- Actions: `src/actions/notification.action.ts`
- Page: `src/app/notifications/page.tsx`
- Composant: `src/components/NotificationSkeleton.tsx`
- Navbar: Affichage du badge dans `DesktopNavbar.tsx` et `MobileNavbar.tsx`

## 📚 Dépendances

- **Module User**: Créateur et destinataire
- **Module Post**: Association aux posts
- **Module Comment**: Association aux commentaires
- **Module Like**: Déclenche les notifications LIKE
- **Module Follow**: Déclenche les notifications FOLLOW
- **date-fns**: Formatage des dates
- **Lucide React**: Icônes (Bell, Heart, MessageCircle, UserPlus)

## 🔍 Requêtes Prisma courantes

### Notifications non lues d'un utilisateur
```typescript
const unread = await prisma.notification.findMany({
  where: {
    userId: "user123",
    read: false,
  },
});
```

### Toutes les notifications LIKE
```typescript
const likes = await prisma.notification.findMany({
  where: {
    userId: "user123",
    type: "LIKE",
  },
});
```

### Marquer une notification comme lue
```typescript
await prisma.notification.update({
  where: { id: "notif123" },
  data: { read: true },
});
```

---

**Voir aussi**:
- [Module User](../01-USER/README.md)
- [Module Post](../02-POST/README.md)
- [Module Comment](../03-COMMENT/README.md)
- [Module Like](../04-LIKE/README.md)
- [Module Follow](../05-FOLLOW/README.md)
