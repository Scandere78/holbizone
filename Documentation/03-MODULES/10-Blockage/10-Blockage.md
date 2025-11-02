# 🛡️ Module de Blocage d'Utilisateurs

## 📋 Vue d'ensemble

Le module de blocage permet aux utilisateurs de bloquer d'autres utilisateurs pour ne plus voir leur contenu (posts et commentaires) dans l'application. Cette fonctionnalité améliore l'expérience utilisateur en donnant le contrôle sur le contenu visible.

---

## 🗄️ Modèle de données

### Schema Prisma

```prisma
model Block {
  id        String   @id @default(cuid())
  blockerId String
  blocker   User     @relation("BlockedBy", fields: [blockerId], references: [id], onDelete: Cascade)
  blockedId String
  blocked   User     @relation("Blocking", fields: [blockedId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([blockerId, blockedId])
  @@index([blockerId])
  @@index([blockedId])
}

model User {
  // ... autres champs
  blockedBy Block[] @relation("BlockedBy") // utilisateurs qui m'ont bloqué
  blocking  Block[] @relation("Blocking")  // utilisateurs que j'ai bloqués
}
```

### Relations
- **Relation bidirectionnelle** : Un utilisateur peut bloquer plusieurs utilisateurs et être bloqué par plusieurs utilisateurs
- **Contrainte unique** : Un utilisateur ne peut bloquer qu'une seule fois le même utilisateur (`@@unique([blockerId, blockedId])`)
- **Index** : Optimisation des requêtes de recherche par `blockerId` et `blockedId`
- **Cascade delete** : Si un utilisateur est supprimé, tous ses blocs sont automatiquement supprimés

---

## 🔧 Actions Serveur

### Fichier: `src/actions/block.actions.ts`

#### 1. **blockUser(targetUserId: string)**

Bloque un utilisateur spécifique.

```typescript
/**
 * Bloquer un utilisateur
 * @param targetUserId - ID de l'utilisateur à bloquer
 * @returns Objet avec success (boolean) et error (string optionnel)
 */
export async function blockUser(targetUserId: string)
```

**Validations:**
- Vérification de l'authentification
- Vérification que l'utilisateur existe
- Empêche l'auto-blocage
- Vérifie si l'utilisateur est déjà bloqué

**Retour:**
```typescript
{ success: true } // En cas de succès
{ success: false, error: "Message d'erreur" } // En cas d'échec
```

---

#### 2. **unblockUser(targetUserId: string)**

Débloque un utilisateur précédemment bloqué.

```typescript
/**
 * Débloquer un utilisateur
 * @param targetUserId - ID de l'utilisateur à débloquer
 * @returns Objet avec success (boolean) et error (string optionnel)
 */
export async function unblockUser(targetUserId: string)
```

**Validations:**
- Vérification de l'authentification
- Vérification que l'utilisateur existe

**Retour:**
```typescript
{ success: true } // En cas de succès
{ success: false, error: "Message d'erreur" } // En cas d'échec
```

---

#### 3. **getBlockedUsers()**

Récupère la liste complète des utilisateurs bloqués par l'utilisateur actuel.

```typescript
/**
 * Récupérer la liste des utilisateurs bloqués
 * @returns Liste des utilisateurs bloqués avec leurs informations
 */
export async function getBlockedUsers()
```

**Données retournées:**
```typescript
{
  success: true,
  blocked: [
    {
      id: string,
      createdAt: Date,
      blocked: {
        id: string,
        username: string,
        name: string,
        image: string,
        bio: string
      }
    }
  ]
}
```

---

#### 4. **isUserBlocked(targetUserId: string)**

Vérifie si un utilisateur spécifique est bloqué.

```typescript
/**
 * Vérifier si un utilisateur est bloqué
 * @param targetUserId - ID de l'utilisateur à vérifier
 * @returns true si bloqué, false sinon
 */
export async function isUserBlocked(targetUserId: string): Promise<boolean>
```

**Utilisation:**
Cette fonction est utilisée pour afficher l'état du bouton "Bloquer" dans l'interface.

---

## 🎨 Interface Utilisateur

### 1. Page de gestion des utilisateurs bloqués

**Fichier:** `src/app/settings/blocked/page.tsx`

**Route:** `/settings/blocked`

**Fonctionnalités:**
- Affichage de la liste complète des utilisateurs bloqués
- Bouton "Débloquer" pour chaque utilisateur
- État vide avec message informatif si aucun utilisateur bloqué
- Skeleton loading pendant le chargement

**Composants clés:**
```tsx
// État vide
<Card className="p-12 text-center">
  <ShieldOff className="w-12 h-12 mx-auto text-red-600/50" />
  <p>Aucun utilisateur bloqué</p>
</Card>

// Carte utilisateur bloqué
<Card className="p-4 flex items-center gap-4">
  <Avatar>...</Avatar>
  <div>
    <h3>{user.name}</h3>
    <p>@{user.username}</p>
  </div>
  <Button onClick={handleUnblock}>Débloquer</Button>
</Card>
```

---

### 2. Option de blocage dans les profils

**Fichier:** `src/app/profile/[username]/ProfilePageClient.tsx`

**Localisation:** Menu dropdown à côté du bouton Follow/Unfollow

**Fonctionnalités:**
- Bouton "Bloquer l'utilisateur" avec icône `ShieldOff`
- Vérification automatique du statut de blocage au chargement
- Désactivation du bouton Follow si l'utilisateur est bloqué
- État "Utilisateur bloqué" si déjà bloqué

**Code:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {!isBlocked ? (
      <DropdownMenuItem onClick={handleBlock}>
        <ShieldOff className="w-4 h-4" />
        Bloquer l'utilisateur
      </DropdownMenuItem>
    ) : (
      <DropdownMenuItem disabled>
        <ShieldOff className="w-4 h-4" />
        Utilisateur bloqué
      </DropdownMenuItem>
    )}
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 3. Option de blocage dans les posts

**Fichier:** `src/components/PostCard.tsx`

**Localisation:** Menu dropdown des actions de post (avec Supprimer et Partager)

**Fonctionnalités:**
- Option "Bloquer l'utilisateur" séparée par un `DropdownMenuSeparator`
- Visible uniquement si l'utilisateur n'est pas l'auteur du post
- Vérification automatique du statut de blocage
- État "Utilisateur bloqué" si déjà bloqué

**Code:**
```tsx
{!isAuthor && clerkUser && (
  <>
    <DropdownMenuSeparator />
    {!isBlocked ? (
      <DropdownMenuItem onClick={handleBlock}>
        <ShieldOff className="w-4 h-4" />
        Bloquer l'utilisateur
      </DropdownMenuItem>
    ) : (
      <DropdownMenuItem disabled>
        <ShieldOff className="w-4 h-4" />
        Utilisateur bloqué
      </DropdownMenuItem>
    )}
  </>
)}
```

---

## 🔍 Filtrage du Contenu

### 1. Filtrage des posts

**Fichier:** `src/actions/post.action.ts`

**Fonction:** `getPosts()`

Le filtrage est appliqué automatiquement dans la requête Prisma :

```typescript
export async function getPosts() {
  // Récupérer l'utilisateur actuel
  const currentUserId = await getDbUserId();

  // Récupérer les IDs des utilisateurs bloqués
  let blockedUserIds: string[] = [];
  if (currentUserId) {
    const blocks = await prisma.block.findMany({
      where: { blockerId: currentUserId },
      select: { blockedId: true },
    });
    blockedUserIds = blocks.map(block => block.blockedId);
  }

  // Requête avec filtrage
  const posts = await prisma.post.findMany({
    where: {
      // Exclure les posts des utilisateurs bloqués
      authorId: {
        notIn: blockedUserIds.length > 0 ? blockedUserIds : undefined,
      },
    },
    // ... reste de la requête
  });
}
```

**Résultat:** Les posts des utilisateurs bloqués n'apparaissent plus dans le feed principal.

---

### 2. Filtrage des commentaires

**Fichiers:**
- `src/actions/post.action.ts` - `getPosts()`
- `src/actions/profile.action.ts` - `getUserPosts()` et `getUserLikedPosts()`

Le filtrage des commentaires est appliqué dans toutes les requêtes qui incluent des commentaires :

```typescript
comments: {
  // Filtrer les commentaires des utilisateurs bloqués
  where: {
    authorId: {
      notIn: blockedUserIds.length > 0 ? blockedUserIds : undefined,
    },
  },
  include: {
    author: { ... }
  },
  orderBy: { createdAt: "asc" },
}
```

**Impact:**
- Feed principal : Posts et commentaires filtrés
- Page de profil : Commentaires filtrés sur les posts du profil
- Posts aimés : Commentaires filtrés

---

## 📱 Flux Utilisateur

### Scénario 1: Bloquer un utilisateur depuis son profil

1. L'utilisateur visite le profil d'un autre utilisateur
2. Clique sur le bouton menu (trois points) à côté du bouton Follow
3. Sélectionne "Bloquer l'utilisateur"
4. Une notification "Utilisateur bloqué" s'affiche
5. Le bouton Follow est désactivé
6. Le menu affiche maintenant "Utilisateur bloqué"

### Scénario 2: Bloquer un utilisateur depuis un post

1. L'utilisateur voit un post dans son feed
2. Clique sur le menu (trois points) du post
3. Sélectionne "Bloquer l'utilisateur" (en bas du menu)
4. Une notification "Utilisateur bloqué" s'affiche
5. Le post reste visible mais le menu affiche "Utilisateur bloqué"

### Scénario 3: Débloquer un utilisateur

1. L'utilisateur accède à `/settings/blocked`
2. Voit la liste de tous les utilisateurs bloqués
3. Clique sur "Débloquer" pour un utilisateur
4. Une notification "Utilisateur débloqué" s'affiche
5. L'utilisateur est retiré de la liste
6. Ses posts et commentaires redeviennent visibles

---

## 🔐 Sécurité et Validations

### Validations côté serveur

1. **Authentification requise**
   - Toutes les actions vérifient que l'utilisateur est connecté
   - Utilisation de `currentUser()` de Clerk

2. **Empêcher l'auto-blocage**
   ```typescript
   if (dbUser.id === targetUserId) {
     return { success: false, error: "Vous ne pouvez pas vous bloquer" };
   }
   ```

3. **Vérification des doublons**
   - Avant de créer un bloc, vérifie s'il existe déjà
   - Retourne une erreur appropriée

4. **Gestion des erreurs**
   - Try-catch sur toutes les opérations
   - Logging des erreurs avec le logger
   - Messages d'erreur clairs pour l'utilisateur

---

## 📊 Logging

Toutes les actions de blocage sont loguées :

```typescript
// Succès
logger.debug({
  context: "blockUser",
  action: "User blocked",
  details: { blockerId: dbUser.id, blockedId: targetUserId },
});

// Erreur
logger.error({
  context: "blockUser",
  action: "Failed",
  error,
});
```

---

## 🎯 Points d'optimisation

### Performance

1. **Index de base de données**
   - Index sur `blockerId` pour des requêtes rapides
   - Index sur `blockedId` pour vérifications rapides

2. **Requêtes optimisées**
   - Sélection uniquement des champs nécessaires
   - Utilisation de `notIn` pour filtrage efficace

3. **Caching côté client**
   - État local pour éviter les appels répétés
   - Vérification du statut au montage du composant

### UX

1. **Feedback immédiat**
   - Toast notifications pour chaque action
   - États de chargement pendant les opérations

2. **États visuels clairs**
   - Boutons désactivés quand approprié
   - Icônes cohérentes (`ShieldOff`)
   - Messages informatifs

---

## 🧪 Tests Recommandés

### Tests unitaires

1. **Actions serveur**
   - Bloquer un utilisateur avec succès
   - Empêcher l'auto-blocage
   - Gérer les utilisateurs déjà bloqués
   - Débloquer un utilisateur

2. **Filtrage**
   - Vérifier que les posts bloqués n'apparaissent pas
   - Vérifier que les commentaires bloqués sont filtrés
   - Tester avec plusieurs utilisateurs bloqués

### Tests d'intégration

1. **Flux complet**
   - Bloquer → Vérifier le filtrage → Débloquer
   - Bloquer depuis profil et depuis post
   - Navigation vers la page de gestion

2. **Edge cases**
   - Utilisateur non connecté
   - Utilisateur inexistant
   - Tentatives de double blocage

---

## 📝 Migrations

### Migration de création

**Fichier:** `prisma/migrations/20251102160844_add_block_model/migration.sql`

```sql
-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Block_blockerId_idx" ON "Block"("blockerId");

-- CreateIndex
CREATE INDEX "Block_blockedId_idx" ON "Block"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockedId_key" ON "Block"("blockerId", "blockedId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey"
    FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedId_fkey"
    FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## 🚀 Améliorations Futures

### Fonctionnalités possibles

1. **Notifications de blocage**
   - Notifier l'utilisateur qu'il a été bloqué (optionnel)
   - Journal d'activité des blocages

2. **Blocage temporaire**
   - Bloquer pour une durée limitée
   - Déblocage automatique après expiration

3. **Raisons de blocage**
   - Ajouter un champ `reason` au modèle Block
   - Catégories : spam, harcèlement, contenu inapproprié

4. **Statistiques**
   - Nombre total d'utilisateurs bloqués
   - Date du dernier blocage
   - Utilisateurs les plus bloqués (pour modération)

5. **Blocage mutuel**
   - Détection des blocages mutuels
   - Actions automatiques appropriées

---

## 📚 Ressources

### Documentation connexe
- [Module Bookmarks](./09-Bookmarks.md)
- [Module Notifications](./05-Notifications.md)
- [Architecture de sécurité](./Security.md)

### Liens externes
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Clerk Authentication](https://clerk.com/docs)

---

## ✅ Checklist de déploiement

Avant de déployer en production :

- [ ] Migrations Prisma appliquées
- [ ] Actions serveur testées
- [ ] Interface utilisateur validée
- [ ] Filtrage vérifié sur toutes les pages
- [ ] Logging configuré
- [ ] Performance optimisée
- [ ] Tests d'intégration passés
- [ ] Documentation à jour

---

**Date de création:** 2 Novembre 2025
**Version:** 1.0
**Statut:** ✅ Implémenté et testé
