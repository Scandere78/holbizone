# Schéma de Base de Données

## 📊 Vue d'ensemble

HolbiHub utilise **PostgreSQL** comme base de données relationnelle, gérée via **Prisma ORM**.

## 🗄️ Modèles de données

### Résumé des tables

| Table | Description | Nombre de champs | Relations |
|-------|-------------|------------------|-----------|
| User | Utilisateurs de la plateforme | 11 | 7 relations |
| Post | Publications des utilisateurs | 6 | 4 relations |
| Comment | Commentaires sur les posts | 5 | 3 relations |
| Like | Likes sur les posts | 4 | 2 relations |
| Follows | Relations de suivi entre utilisateurs | 3 | 2 relations |
| Notification | Notifications des utilisateurs | 8 | 4 relations |

## 📋 Schéma Prisma complet

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  posts                Post[]
  comments             Comment[]
  likes                Like[]
  followers            Follows[]      @relation("following")
  following            Follows[]      @relation("follower")
  notifications        Notification[] @relation("userNotifications")
  notificationsCreated Notification[] @relation("notificationCreator")
}

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

model Follows {
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  // Relations
  follower  User @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("following", fields: [followingId], references: [id], onDelete: Cascade)

  @@id([followerId, followingId])
  @@index([followerId, followingId])
}

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

## 🔗 Relations entre tables

### User ↔ Post (One-to-Many)
- Un utilisateur peut créer plusieurs posts
- Un post appartient à un utilisateur
- **Cascade**: Suppression des posts si utilisateur supprimé

### User ↔ Comment (One-to-Many)
- Un utilisateur peut créer plusieurs commentaires
- Un commentaire appartient à un utilisateur
- **Cascade**: Suppression des commentaires si utilisateur supprimé

### Post ↔ Comment (One-to-Many)
- Un post peut avoir plusieurs commentaires
- Un commentaire appartient à un post
- **Cascade**: Suppression des commentaires si post supprimé

### User ↔ Like (One-to-Many)
- Un utilisateur peut liker plusieurs posts
- Un like appartient à un utilisateur
- **Cascade**: Suppression des likes si utilisateur supprimé

### Post ↔ Like (One-to-Many)
- Un post peut avoir plusieurs likes
- Un like appartient à un post
- **Cascade**: Suppression des likes si post supprimé

### User ↔ Follows ↔ User (Many-to-Many)
- Un utilisateur peut suivre plusieurs utilisateurs
- Un utilisateur peut être suivi par plusieurs utilisateurs
- **Cascade**: Suppression des relations si utilisateur supprimé

### User ↔ Notification (One-to-Many, bidirectionnel)
- Un utilisateur peut recevoir plusieurs notifications (`userNotifications`)
- Un utilisateur peut créer plusieurs notifications (`notificationCreator`)
- **Cascade**: Suppression des notifications si utilisateur supprimé

## 🔑 Index et Contraintes

### Index composites
```prisma
@@index([authorId, postId])     // Comment - Optimise les requêtes par auteur et post
@@index([userId, postId])       // Like - Optimise les requêtes par utilisateur et post
@@index([followerId, followingId]) // Follows - Optimise les requêtes de follow
@@index([userId, createdAt])    // Notification - Optimise les requêtes de notifications
```

### Contraintes uniques
```prisma
@unique [email]              // User - Email unique
@unique [username]           // User - Username unique
@unique [clerkId]            // User - ClerkId unique
@@unique([userId, postId])   // Like - Empêche les likes en double
@@id([followerId, followingId]) // Follows - Empêche les follows en double
```

## 🔄 Cascade Deletes

Toutes les relations ont `onDelete: Cascade` :

```
User supprimé
  ├─ Posts supprimés
  │   ├─ Comments supprimés
  │   ├─ Likes supprimés
  │   └─ Notifications supprimées
  ├─ Comments supprimés
  ├─ Likes supprimés
  ├─ Follows supprimés
  └─ Notifications supprimées
```

## 📏 Types de données

### Identifiants
- **CUID**: `@default(cuid())` - Identifiants uniques générés (Collision-resistant Unique ID)

### Dates
- **DateTime**: Stockage des timestamps
- `@default(now())`: Date automatique à la création
- `@updatedAt`: Mise à jour automatique

### Strings
- Aucune limite de longueur définie (⚠️ à améliorer)

### Booleans
- `read` dans Notification: `@default(false)`

### Enums
- `NotificationType`: LIKE | COMMENT | FOLLOW

## ⚡ Optimisations

### Index pour performance
- ✅ Index sur colonnes fréquemment utilisées dans les WHERE
- ✅ Index composites pour les requêtes multi-colonnes
- ✅ Index sur les foreign keys

### Requêtes optimisées avec Prisma
```typescript
// Utilisation de select pour limiter les champs
select: {
  id: true,
  name: true,
  // ...
}

// Utilisation de include pour les relations
include: {
  author: true,
  comments: true,
}

// Utilisation de _count pour les agrégations
_count: {
  select: {
    likes: true,
    comments: true,
  },
}
```

## 🐛 Problèmes connus

1. ⚠️ Pas de validation de longueur sur les champs String
2. ⚠️ Pas de validation d'email côté base
3. ⚠️ Pas de contraintes de longueur sur content, bio, etc.

## 🚀 Améliorations recommandées

### Validation de données
```prisma
model User {
  email    String   @unique @db.VarChar(255)
  username String   @unique @db.VarChar(50)
  name     String?  @db.VarChar(100)
  bio      String?  @db.VarChar(500)
}

model Post {
  content String? @db.VarChar(1000)
}

model Comment {
  content String @db.VarChar(500)
}
```

### Nouveaux index
```prisma
@@index([createdAt])           // User - Pour trier par date d'inscription
@@index([createdAt])           // Post - Pour le fil d'actualité
@@fulltext([content])          // Post - Pour la recherche full-text
@@fulltext([username, name])   // User - Pour la recherche d'utilisateurs
```

## 🔧 Commandes Prisma

### Migration
```bash
# Créer une migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations
npx prisma migrate deploy

# Réinitialiser la DB
npx prisma migrate reset
```

### Génération du client
```bash
npx prisma generate
```

### Prisma Studio
```bash
npx prisma studio
```

### Seed (à créer)
```bash
npx prisma db seed
```

## 📊 Statistiques de la base

- **6 tables** + 1 enum
- **42 colonnes** au total
- **13 relations** entre tables
- **7 index** pour optimisation
- **4 contraintes uniques**

## 🔗 Fichiers associés

- Schéma: `prisma/schema.prisma`
- Client: Généré dans `node_modules/.prisma/client`
- Migrations: `prisma/migrations/`
- Configuration: `lib/prisma.ts`

---

**Voir aussi**:
- [Diagramme ERD](./01-erd.md)
- [Documentation Prisma](https://www.prisma.io/docs)
