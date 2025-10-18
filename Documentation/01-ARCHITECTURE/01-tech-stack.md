# Stack Technique - HolbiHub

## 🚀 Technologies Utilisées

### Frontend

#### Framework & Runtime
| Technologie | Version | Description |
|-------------|---------|-------------|
| **Next.js** | 14.2.15 | Framework React avec SSR/SSG |
| **React** | 18.x | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |

**Pourquoi Next.js 14 ?**
- ✅ App Router moderne
- ✅ Server Components par défaut
- ✅ Server Actions intégrées
- ✅ Optimisations automatiques
- ✅ Routing file-based
- ✅ SSR + SSG natif

#### Styling & UI
| Technologie | Version | Description |
|-------------|---------|-------------|
| **Tailwind CSS** | 3.4.1 | Framework CSS utility-first |
| **Shadcn/UI** | Latest | Composants React (Radix UI) |
| **Lucide React** | 0.545.0 | Icônes |
| **next-themes** | 0.4.6 | Dark mode |

**Stack UI**:
```
Tailwind CSS → Base styling
  ↓
Shadcn/UI (Radix UI) → Components accessibles
  ↓
Custom Components → Business logic
```

#### State Management & Hooks
| Technologie | Usage |
|-------------|-------|
| **React useState** | État local des composants |
| **React useEffect** | Side effects |
| **Server State** | Via Server Components & Actions |

**Pas de bibliothèque de state management** (Redux, Zustand) car :
- Server Components gèrent la majorité de l'état
- useState suffit pour l'UI locale
- Server Actions pour la synchronisation

#### Formulaires & Validation
| Technologie | Status | Notes |
|-------------|--------|-------|
| **React Hook Form** | ❌ Non utilisé | À implémenter |
| **Zod** | ❌ Non utilisé | Recommandé pour validation |

**À implémenter**:
```typescript
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  content: z.string().max(500),
});
```

### Backend

#### Runtime & Framework
| Technologie | Version | Description |
|-------------|---------|-------------|
| **Node.js** | 20+ | Runtime JavaScript |
| **Next.js API** | 14.2.15 | Backend framework |

**Approche Backend**:
- ✅ Server Actions (recommandé Next.js 14)
- ✅ Route Handlers (API Routes)
- ❌ Pas de serveur Express séparé

#### Base de Données & ORM
| Technologie | Version | Description |
|-------------|---------|-------------|
| **PostgreSQL** | 14+ | Base de données relationnelle |
| **Prisma** | 6.17.1 | ORM moderne pour TypeScript |

**Pourquoi Prisma ?**
- ✅ Type-safe
- ✅ Migrations automatiques
- ✅ Prisma Studio (GUI)
- ✅ Excellent support TypeScript
- ✅ Requêtes optimisées

**Exemple de requête Prisma**:
```typescript
const posts = await prisma.post.findMany({
  include: {
    author: true,
    comments: true,
    _count: {
      select: { likes: true },
    },
  },
});
```

### Authentification

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Clerk** | 6.33.3 | Plateforme d'authentification complète |

**Fonctionnalités Clerk**:
- ✅ Sign In / Sign Up
- ✅ OAuth (Google, GitHub, etc.)
- ✅ Session management
- ✅ User management
- ✅ Middleware protection
- ✅ Webhooks

**Hooks & Fonctions**:
```typescript
// Client-side
import { useUser, useAuth } from "@clerk/nextjs";

// Server-side
import { auth, currentUser } from "@clerk/nextjs/server";
```

### Upload de Fichiers

| Technologie | Version | Description |
|-------------|---------|-------------|
| **UploadThing** | 7.7.4 | Service d'upload de fichiers |

**Configuration**:
- Endpoint: `postImage`
- Max size: 4MB
- Types: images uniquement

**Composants**:
```typescript
import { UploadButton, UploadDropzone } from "@uploadthing/react";
```

### Utilities & Helpers

| Technologie | Version | Usage |
|-------------|---------|-------|
| **clsx** | 2.1.1 | Conditional classnames |
| **tailwind-merge** | 3.3.1 | Merge Tailwind classes |
| **date-fns** | 4.1.0 | Manipulation de dates |
| **react-hot-toast** | 2.6.0 | Notifications toast |

**Exemple date-fns**:
```typescript
import { formatDistanceToNow } from "date-fns";
formatDistanceToNow(new Date(createdAt)); // "2 hours ago"
```

### UI Components (Shadcn/UI)

| Composant | Package | Usage |
|-----------|---------|-------|
| **Button** | @radix-ui/react-slot | Boutons |
| **Avatar** | @radix-ui/react-avatar | Avatars utilisateurs |
| **Card** | Custom | Cartes de contenu |
| **Dialog** | @radix-ui/react-dialog | Modales |
| **Alert Dialog** | @radix-ui/react-alert-dialog | Confirmations |
| **Tabs** | @radix-ui/react-tabs | Onglets |
| **Textarea** | Native HTML | Zone de texte |
| **Input** | Native HTML | Champs de formulaire |
| **Separator** | @radix-ui/react-separator | Séparateurs |
| **Scroll Area** | @radix-ui/react-scroll-area | Zones scrollables |
| **Sheet** | @radix-ui/react-dialog | Sidebar mobile |

### DevTools & Build

| Technologie | Version | Usage |
|-------------|---------|-------|
| **PostCSS** | 8.x | Processeur CSS |
| **Autoprefixer** | Latest | Préfixes CSS |
| **ESLint** | Latest | Linting |

### Package.json Scripts

```json
{
  "dev": "next dev",           // Mode développement
  "build": "next build",       // Build production
  "start": "next start",       // Serveur production
  "lint": "next lint",         // Linting
  "postinstall": "prisma generate" // Génération client Prisma
}
```

## 📦 Dépendances Complètes

### Dependencies (Production)
```json
{
  "@clerk/nextjs": "^6.33.3",
  "@prisma/client": "^6.17.1",
  "@radix-ui/react-alert-dialog": "^1.1.15",
  "@radix-ui/react-avatar": "^1.1.10",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-scroll-area": "^1.2.10",
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-tabs": "^1.1.13",
  "@uploadthing/react": "^7.3.3",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.545.0",
  "next": "14.2.15",
  "next-themes": "^0.4.6",
  "react": "^18",
  "react-dom": "^18",
  "react-hot-toast": "^2.6.0",
  "tailwind-merge": "^3.3.1",
  "tailwindcss-animate": "^1.0.7",
  "uploadthing": "^7.7.4"
}
```

### DevDependencies
```json
{
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "postcss": "^8",
  "prisma": "^6.17.1",
  "tailwindcss": "^3.4.1",
  "typescript": "^5"
}
```

## 🔧 Configuration

### TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tailwind (tailwind.config.ts)
- Dark mode via class
- Content paths configurés
- Thème étendu avec variables CSS
- Plugins: tailwindcss-animate

## 🌐 Environnements

### Development
```bash
npm run dev
# Écoute sur http://localhost:3000
```

### Production
```bash
npm run build
npm run start
```

## 🔐 Variables d'Environnement

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# UploadThing
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."
```

## ⚠️ Technologies Manquantes (Recommandées)

### Tests
| Technologie | Usage recommandé |
|-------------|------------------|
| **Jest** | Tests unitaires |
| **Testing Library** | Tests de composants |
| **Playwright** | Tests E2E |
| **Vitest** | Alternative à Jest |

### Validation & Formulaires
| Technologie | Usage recommandé |
|-------------|------------------|
| **Zod** | Validation de schémas |
| **React Hook Form** | Gestion de formulaires |

### Monitoring & Analytics
| Technologie | Usage recommandé |
|-------------|------------------|
| **Sentry** | Error tracking |
| **Vercel Analytics** | Web analytics |
| **LogRocket** | Session replay |

### Performance
| Technologie | Usage recommandé |
|-------------|------------------|
| **Redis** | Cache |
| **Next.js Image** | Optimisation images |

### CI/CD
| Technologie | Usage recommandé |
|-------------|------------------|
| **GitHub Actions** | CI/CD |
| **Vercel** | Déploiement auto |

## 📊 Comparaison d'Alternatives

### Pourquoi Next.js et pas...

**vs Create React App**
- ✅ SSR/SSG natif
- ✅ Routing intégré
- ✅ API routes
- ✅ Optimisations auto

**vs Remix**
- ✅ Écosystème plus mature
- ✅ Vercel integration
- ✅ Server Actions plus simple

**vs Astro**
- ✅ Plus adapté aux apps dynamiques
- ✅ Meilleure intégration React

### Pourquoi Prisma et pas...

**vs TypeORM**
- ✅ Meilleur support TypeScript
- ✅ Migrations plus simples
- ✅ Prisma Studio

**vs Sequelize**
- ✅ Type-safety
- ✅ Syntaxe plus moderne
- ✅ Performances

### Pourquoi Clerk et pas...

**vs NextAuth**
- ✅ UI pré-construite
- ✅ Moins de configuration
- ✅ Support premium

**vs Auth0**
- ✅ Meilleure intégration Next.js
- ✅ Prix compétitif
- ✅ DX supérieure

## 🚀 Mises à Jour Recommandées

### Court terme
- [ ] Ajouter Zod pour validation
- [ ] Implémenter React Hook Form
- [ ] Configurer Jest/Testing Library

### Moyen terme
- [ ] Ajouter Redis pour cache
- [ ] Implémenter WebSocket (Socket.io)
- [ ] Optimiser images avec next/image

### Long terme
- [ ] Migrer vers tRPC (type-safe API)
- [ ] Ajouter GraphQL (alternative REST)
- [ ] Implémenter microfrontends

---

**Voir aussi**:
- [Architecture générale](./00-overview.md)
- [Structure du projet](./02-project-structure.md)
