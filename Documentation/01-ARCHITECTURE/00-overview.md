# Architecture Générale - HolbiHub test

## 📋 Vue d'ensemble

HolbiHub est une application web fullstack de réseau social construite avec une architecture moderne basée sur Next.js 14, suivant le pattern **Server-Side Rendering (SSR)** et **Server Actions**.

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                      UTILISATEUR                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Client)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React Components (TSX)                          │  │
│  │  - Server Components (fetch data)                │  │
│  │  - Client Components (interactivity)             │  │
│  │  - UI Components (Shadcn/UI)                     │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 NEXT.JS APP ROUTER                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  - Page Routes                                   │  │
│  │  - API Routes                                    │  │
│  │  - Server Actions                                │  │
│  │  - Middleware                                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────┬──────────────────────────┬────────────────────────┘
      │                          │
      ▼                          ▼
┌──────────────┐        ┌───────────────────┐
│ CLERK AUTH   │        │  SERVER ACTIONS   │
│ - Sign In    │        │  - user.action    │
│ - Sign Up    │        │  - post.action    │
│ - Session    │        │  - profile.action │
│ - Webhook    │        │  - notification   │
└──────────────┘        └─────────┬─────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   PRISMA ORM     │
                        │  - User Model    │
                        │  - Post Model    │
                        │  - Comment Model │
                        │  - etc.          │
                        └─────────┬────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   POSTGRESQL     │
                        │   (Database)     │
                        └──────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  SERVICES EXTERNES                      │
│  - UploadThing (Upload fichiers)                       │
│  - Clerk (Authentification)                             │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Pattern Architectural

### 1. **Architecture en Couches**

```
┌──────────────────────────────────────┐
│  Présentation Layer                  │  ← Components React
├──────────────────────────────────────┤
│  Application Layer                   │  ← Server Actions / API Routes
├──────────────────────────────────────┤
│  Domain Layer                        │  ← Modèles Prisma
├──────────────────────────────────────┤
│  Data Access Layer                   │  ← Prisma Client
├──────────────────────────────────────┤
│  Infrastructure Layer                │  ← PostgreSQL, Clerk, UploadThing
└──────────────────────────────────────┘
```

### 2. **Next.js App Router Pattern**

```
app/
├── (routes)/
│   ├── page.tsx              → Server Component (fetch data)
│   ├── layout.tsx            → Shared layout
│   └── loading.tsx           → Loading state
│
├── api/
│   └── uploadthing/
│       ├── route.ts          → API Route Handler
│       └── core.ts           → Configuration
│
└── components/
    ├── ServerComponent.tsx   → Server Component
    └── ClientComponent.tsx   → "use client" directive
```

## 🔄 Flux de Données

### Lecture de données (Read)
```
1. User visite une page
2. Server Component exécute
3. Server Action/Fonction appelée (ex: getPosts())
4. Prisma query vers PostgreSQL
5. Données récupérées et formatées
6. SSR: HTML généré côté serveur
7. Hydration côté client
8. Affichage dans le navigateur
```

### Écriture de données (Write)
```
1. User interagit (ex: like un post)
2. Event handler côté client
3. Optimistic update (UI instantanée)
4. Server Action appelée (ex: toggleLike())
5. Authentification vérifiée (Clerk)
6. Validation des données
7. Transaction Prisma vers PostgreSQL
8. revalidatePath() → Cache invalidé
9. Re-fetch automatique
10. UI synchronisée
```

## 🧩 Composants de l'Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI (Radix UI)
- **Icons**: Lucide React
- **Forms**: React Hook Form (non implémenté)
- **State**: React useState, useEffect

### Backend
- **Runtime**: Node.js (Next.js API)
- **Server Actions**: Next.js Server Actions
- **API Routes**: Next.js Route Handlers
- **ORM**: Prisma
- **Database**: PostgreSQL

### Authentification
- **Provider**: Clerk
- **Strategy**: JWT + Session Cookies
- **Protection**: Middleware + Server-side checks

### File Upload
- **Service**: UploadThing
- **Storage**: Cloud storage
- **Max size**: 4MB par image

## 🔐 Sécurité

### Authentification & Autorisation
```
Request
  ↓
Middleware (Clerk)
  ↓
Server Action/Route
  ↓
getDbUserId() → Vérification session
  ↓
Authorization check (ex: isAuthor?)
  ↓
Database operation
```

### Protection des routes
- **Middleware Clerk**: Protection globale
- **Server-side checks**: Vérification dans chaque action
- **Authorization**: Vérification des permissions (ex: delete post)

## ⚡ Performance & Optimisation

### Server Components
- **Avantage**: Moins de JavaScript côté client
- **Usage**: Fetch de données, rendering lourd
- **Cache**: Automatique via Next.js

### Client Components
- **Usage**: Interactivité (onClick, useState)
- **Optimisation**: Lazy loading, dynamic imports

### Database
- **Index**: Sur foreign keys et colonnes fréquentes
- **Relations**: Eager loading avec `include`
- **Sélection**: `select` pour limiter les champs

### Caching
- **Next.js Cache**: Automatic avec revalidation
- **revalidatePath()**: Invalidation manuelle
- **Static Generation**: Pour les pages non-dynamiques

## 📦 Structure du Projet

```
holbihub/
├── prisma/
│   ├── schema.prisma          → Modèles de données
│   └── migrations/            → Historique des migrations
│
├── public/                    → Fichiers statiques
│
├── src/
│   ├── app/
│   │   ├── (routes)/          → Pages de l'application
│   │   ├── api/               → API Routes
│   │   ├── layout.tsx         → Layout principal
│   │   └── globals.css        → Styles globaux
│   │
│   ├── components/
│   │   ├── ui/                → Composants Shadcn/UI
│   │   └── *.tsx              → Composants métier
│   │
│   ├── actions/               → Server Actions
│   │   ├── user.action.ts
│   │   ├── post.action.ts
│   │   ├── profile.action.ts
│   │   └── notification.action.ts
│   │
│   └── lib/
│       ├── prisma.ts          → Client Prisma
│       ├── uploadthing.ts     → Configuration UploadThing
│       └── utils.ts           → Fonctions utilitaires
│
├── Documentation/             → Documentation technique
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## 🔌 Intégrations Externes

### Clerk
- **Fonctionnalité**: Authentification complète
- **Composants**: SignIn, SignUp, UserButton
- **Hooks**: useUser(), useAuth()
- **Server**: auth(), currentUser()

### UploadThing
- **Fonctionnalité**: Upload d'images
- **Composants**: UploadButton, UploadDropzone
- **Configuration**: Endpoint "postImage"
- **Limite**: 4MB par fichier

### PostgreSQL
- **Hébergement**: À définir (Vercel, Railway, etc.)
- **Connexion**: Via DATABASE_URL
- **ORM**: Prisma

## 🌐 Déploiement

### Environnements
```
Development  → localhost:3000
Staging      → À définir
Production   → À définir (Vercel recommandé)
```

### Variables d'environnement
```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

## 📊 Patterns Utilisés

### Server Actions Pattern
```typescript
"use server"

export async function createPost(content: string, image: string) {
  // 1. Authentification
  const userId = await getDbUserId();

  // 2. Validation
  if (!userId) return;

  // 3. Database operation
  const post = await prisma.post.create({...});

  // 4. Cache revalidation
  revalidatePath("/");

  // 5. Return result
  return { success: true, post };
}
```

### Optimistic Updates Pattern
```typescript
const handleLike = async () => {
  // 1. Optimistic update
  setHasLiked(!hasLiked);
  setLikeCount(likeCount + 1);

  try {
    // 2. Server action
    await toggleLike(postId);
  } catch (error) {
    // 3. Rollback on error
    setHasLiked(hasLiked);
    setLikeCount(likeCount);
  }
};
```

### Repository Pattern (via Prisma)
```typescript
// Abstraction de la DB via Prisma Client
const posts = await prisma.post.findMany({
  include: { author: true }
});
```

## 🎯 Principes de Conception

### Separation of Concerns
- ✅ UI Components séparés de la logique métier
- ✅ Server Actions pour la logique serveur
- ✅ Prisma pour l'accès aux données

### DRY (Don't Repeat Yourself)
- ✅ Composants réutilisables
- ✅ Server Actions partagées
- ✅ Utilisation de types TypeScript

### Single Responsibility
- ✅ Chaque composant a une responsabilité claire
- ✅ Chaque action a un objectif précis

### KISS (Keep It Simple, Stupid)
- ✅ Architecture simple et claire
- ✅ Pas de sur-ingénierie

## 🔄 Évolutions Futures

### Court terme
- [ ] Validation Zod
- [ ] Tests unitaires
- [ ] CI/CD

### Moyen terme
- [ ] WebSocket pour notifications temps réel
- [ ] Redis pour cache
- [ ] CDN pour images

### Long terme
- [ ] Microservices
- [ ] GraphQL API
- [ ] Mobile app (React Native)

---

**Voir aussi**:
- [Stack Technique](./01-tech-stack.md)
- [Structure du Projet](./02-project-structure.md)
