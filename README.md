# Documentation Technique - HolbiHub

## 📚 Vue d'ensemble

HolbiHub est une application web fullstack de réseau social développée avec Next.js 14, TypeScript, Prisma et PostgreSQL.

## 📖 Table des matières

### 1. Architecture
- [Architecture Générale](./01-ARCHITECTURE/00-overview.md)
- [Stack Technique](./01-ARCHITECTURE/01-tech-stack.md)
- [Structure du Projet](./01-ARCHITECTURE/02-project-structure.md)

### 2. Base de Données
- [Schéma de la Base de Données](./02-DATABASE/00-schema.md)
- [Diagramme ERD](./02-DATABASE/01-erd.md)
- [Migrations](./02-DATABASE/02-migrations.md)

### 3. Modules Fonctionnels

#### 3.1 Module Utilisateur
- [Documentation Utilisateur](./03-MODULES/01-USER/README.md)
- [Modèle de données](./03-MODULES/01-USER/model.md)
- [API & Actions](./03-MODULES/01-USER/api.md)
- [Composants UI](./03-MODULES/01-USER/components.md)

#### 3.2 Module Post
- [Documentation Post](./03-MODULES/02-POST/README.md)
- [Modèle de données](./03-MODULES/02-POST/model.md)
- [API & Actions](./03-MODULES/02-POST/api.md)
- [Composants UI](./03-MODULES/02-POST/components.md)

#### 3.3 Module Commentaire
- [Documentation Commentaire](./03-MODULES/03-COMMENT/README.md)
- [Modèle de données](./03-MODULES/03-COMMENT/model.md)
- [API & Actions](./03-MODULES/03-COMMENT/api.md)

#### 3.4 Module Like
- [Documentation Like](./03-MODULES/04-LIKE/README.md)
- [Modèle de données](./03-MODULES/04-LIKE/model.md)
- [API & Actions](./03-MODULES/04-LIKE/api.md)

#### 3.5 Module Follow
- [Documentation Follow](./03-MODULES/05-FOLLOW/README.md)
- [Modèle de données](./03-MODULES/05-FOLLOW/model.md)
- [API & Actions](./03-MODULES/05-FOLLOW/api.md)

#### 3.6 Module Notification
- [Documentation Notification](./03-MODULES/06-NOTIFICATION/README.md)
- [Modèle de données](./03-MODULES/06-NOTIFICATION/model.md)
- [API & Actions](./03-MODULES/06-NOTIFICATION/api.md)

#### 3.7 Module Upload
- [Documentation Upload](./03-MODULES/07-UPLOAD/README.md)
- [Configuration UploadThing](./03-MODULES/07-UPLOAD/configuration.md)

### 4. API
- [Vue d'ensemble des APIs](./04-API/00-overview.md)
- [Server Actions](./04-API/01-server-actions.md)
- [Route Handlers](./04-API/02-route-handlers.md)

### 5. Authentification
- [Clerk Authentication](./05-AUTH/00-clerk-setup.md)
- [Gestion des Sessions](./05-AUTH/01-session-management.md)
- [Synchronisation Utilisateur](./05-AUTH/02-user-sync.md)

### 6. Guide de Développement
- [Installation](./06-GUIDES/01-installation.md)
- [Configuration Environnement](./06-GUIDES/02-environment.md)
- [Conventions de Code](./06-GUIDES/03-code-conventions.md)
- [Guide de Contribution](./06-GUIDES/04-contributing.md)

### 7. Déploiement
- [Guide de Déploiement](./07-DEPLOYMENT/00-deployment-guide.md)
- [Variables d'Environnement](./07-DEPLOYMENT/01-environment-variables.md)

---

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env

# Migration de la base de données
npx prisma migrate dev

# Démarrage
npm run dev
```

## 📞 Support

Pour toute question, veuillez consulter la documentation appropriée ou créer une issue sur GitHub.

---

**Version**: 1.0.0
**Dernière mise à jour**: 2025-01-18


Highlights: 🚀 Tech stack: Next.js App Router, Postgres, Prisma, Clerk & TypeScript 💻 Server Components, Layouts, Route Handlers, Server Actions 🔥 Special Next.js files: loading.tsx, error.tsx, not-found.tsx 📡 API Integration using Route Handlers 🔄 Data Fetching, Caching & Revalidation 🎭 Client & Server Components 🛣️ Dynamic & Static Routes 🎨 Styling with Tailwind & Shadcn 🔒 Authentication & Authorization -📤 File Uploads with UploadThing 🗃️ Database Integration with Prisma 🚀 Server Actions & Forms -⚡ Optimistic Updates