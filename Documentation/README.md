# Documentation HolbiHub - Schémas Mermaid

Bienvenue dans la documentation technique de HolbiHub ! Cette documentation contient des schémas Mermaid détaillés pour comprendre l'architecture, la base de données et les flux de l'application.

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Schémas disponibles](#schémas-disponibles)
3. [Comment utiliser ces schémas](#comment-utiliser-ces-schémas)
4. [Technologies utilisées](#technologies-utilisées)

---

## Vue d'ensemble

HolbiHub est une application de réseau social construite avec Next.js 14, utilisant le App Router et des Server Actions pour la logique métier. L'application comprend :

- **Authentification** via Clerk
- **Base de données** PostgreSQL avec Prisma ORM
- **Messagerie temps réel** avec Pusher
- **Upload de fichiers** via UploadThing
- **Rate limiting** avec Upstash Redis

---

## Schémas disponibles

### 1. 📊 [Schémas User](./SCHEMAS_USER.md)

Documentation complète du modèle User et de ses relations.

**Contenu :**
- Diagramme Entité-Relation du User
- Relations One-to-Many (User → autres entités)
- Relations Many-to-Many (User ↔ User)
- Contraintes et index de performance
- Cascades de suppression

**Utilisez ce document pour :**
- Comprendre le modèle utilisateur central
- Voir toutes les relations d'un utilisateur
- Comprendre les contraintes d'unicité
- Analyser les impacts de la suppression d'un utilisateur

---

### 2. 🗄️ [Schémas Base de Données](./SCHEMAS_DATABASE.md)

Vue complète de la structure de la base de données.

**Contenu :**
- Diagramme ERD complet (tous les modèles)
- Vue d'ensemble des modules fonctionnels
- Relations par type (One-to-Many, Many-to-Many)
- Enums et types de données
- Index et optimisations de performance
- Statistiques de la base de données

**Utilisez ce document pour :**
- Comprendre la structure globale de la DB
- Voir les relations entre tous les modèles
- Analyser les contraintes et index
- Comprendre les types énumérés
- Planifier des migrations

---

### 3. 🏗️ [Schémas Architecture](./SCHEMAS_ARCHITECTURE.md)

Architecture technique de l'application.

**Contenu :**
- Architecture globale (Client → Server → Database)
- Architecture en couches (Layered Architecture)
- Flux d'une requête complète
- Structure du projet
- Modules et fonctionnalités
- Services externes et intégrations
- Pattern Server Actions Next.js 14
- Sécurité multi-couches
- Performance et optimisations

**Utilisez ce document pour :**
- Comprendre l'architecture globale
- Voir comment les composants interagissent
- Comprendre le flux des requêtes
- Analyser les intégrations externes
- Comprendre les patterns de sécurité

---

### 4. 🔄 [Schémas Flux de Requêtes](./SCHEMAS_FLUX_REQUETES.md)

Flux détaillés des requêtes et parcours utilisateur.

**Contenu :**
- Flux d'authentification (Clerk)
- Flux de création de post
- Flux de messagerie en temps réel
- Flux de notification
- Flux de recherche
- Flux Like/Unlike
- Flux de blocage
- Flux de conversation
- Flux de bookmark
- Flux d'upload d'image
- Flux de réclamation
- Flux de feed personnalisé
- Parcours complets utilisateur
- Gestion d'erreurs et retry
- Matrice des actions et permissions

**Utilisez ce document pour :**
- Comprendre le parcours utilisateur
- Déboguer des problèmes de flux
- Voir les interactions temps réel
- Comprendre la gestion des erreurs
- Analyser les permissions et rate limits

---

## Comment utiliser ces schémas

### Visualisation

Les schémas Mermaid peuvent être visualisés de plusieurs façons :

1. **GitHub/GitLab** : Affichage natif dans les fichiers Markdown
2. **VSCode** : Extensions comme "Markdown Preview Mermaid Support"
3. **Éditeur en ligne** : [Mermaid Live Editor](https://mermaid.live/)
4. **Documentation Gatsby/Docusaurus** : Support natif de Mermaid

### Navigation

Chaque fichier de documentation est organisé de manière logique :

- **Table des matières** au début du document
- **Sections numérotées** pour une navigation facile
- **Styles colorés** pour différencier les types d'entités
- **Légendes et notes** pour expliquer les concepts

### Codes couleurs

Dans les schémas, nous utilisons des couleurs pour identifier rapidement les types d'entités :

| Couleur | Type | Hex |
|---------|------|-----|
| 🔵 Bleu foncé | User / Core | `#4F46E5` |
| 🟢 Vert | Contenu social (Posts, Comments) | `#10B981` |
| 🟣 Violet | Relations sociales (Follows, Block, Notifications) | `#8B5CF6` |
| 🟠 Orange | Messagerie (Conversations, Messages) | `#F59E0B` |
| 🔴 Rouge | Support (Réclamations) | `#EF4444` |
| 🔷 Bleu clair | Actions / API | `#3B82F6` |

---

## Technologies utilisées

### Frontend

- **Next.js 14** - Framework React avec App Router
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Shadcn/UI** - Composants UI

### Backend

- **Next.js Server Actions** - Logique métier côté serveur
- **Prisma ORM** - Accès à la base de données
- **PostgreSQL** - Base de données relationnelle
- **Zod** - Validation de schémas

### Services externes

- **Clerk** - Authentification et gestion des utilisateurs
- **UploadThing** - Upload et stockage de fichiers (S3)
- **Pusher** - Messagerie temps réel et notifications
- **Upstash Redis** - Rate limiting

### Sécurité et Performance

- **Rate Limiting** - Protection contre les abus
- **Security Headers** - Protection XSS, CSRF, etc.
- **Zod Validation** - Validation des données
- **Prisma** - Protection contre les injections SQL
- **Image Optimization** - Next.js Image avec AVIF/WebP

---

## Structure du Projet

```
holbihub/
├── Documentation/           # Cette documentation
│   ├── README.md           # Ce fichier
│   ├── SCHEMAS_USER.md     # Schémas du modèle User
│   ├── SCHEMAS_DATABASE.md # Schémas de la base de données
│   ├── SCHEMAS_ARCHITECTURE.md # Schémas d'architecture
│   └── SCHEMAS_FLUX_REQUETES.md # Schémas des flux
├── prisma/
│   └── schema.prisma       # Schéma Prisma
├── src/
│   ├── app/                # Pages et API routes
│   ├── actions/            # Server Actions
│   ├── components/         # Composants React
│   └── lib/                # Utilitaires
└── ...
```

---

## Modules Fonctionnels

### 1. Authentification
- Connexion/Inscription via Clerk
- Gestion de session
- Webhooks pour synchronisation

### 2. Contenu Social
- **Posts** : Création, modification, suppression, images
- **Commentaires** : Ajout, modification, images
- **Likes** : Posts et commentaires
- **Bookmarks** : Sauvegarde de posts

### 3. Relations Sociales
- **Follows** : Suivre/Ne plus suivre
- **Blocages** : Bloquer/Débloquer
- **Notifications** : Like, Comment, Follow en temps réel

### 4. Messagerie
- **Conversations** : 1:1 et groupes
- **Messages** : Texte et images en temps réel
- **Gestion** : Membres, rôles, messages non lus

### 5. Profil Utilisateur
- Informations personnelles
- Statistiques (posts, followers, following)

### 6. Support
- Système de réclamations
- Types : BUG, FEATURE, IMPROVEMENT, OTHER
- Priorités et statuts

---

## Métriques de la Base de Données

| Métrique | Valeur |
|----------|--------|
| Nombre de modèles | 13 |
| Relations totales | 19+ |
| Index composites | 12 |
| Contraintes d'unicité | 10 |
| Enums définis | 4 |
| Services externes intégrés | 4 |

---

## Guide de Développement

### Ajouter une nouvelle fonctionnalité

1. **Modéliser** : Mettre à jour `schema.prisma`
2. **Migrer** : `npx prisma migrate dev`
3. **Valider** : Créer schémas Zod dans `lib/validations/`
4. **Actions** : Créer Server Actions dans `actions/`
5. **UI** : Créer composants dans `components/`
6. **Documenter** : Mettre à jour les schémas Mermaid

### Déboguer un problème

1. Consulter [SCHEMAS_FLUX_REQUETES.md](./SCHEMAS_FLUX_REQUETES.md) pour comprendre le flux
2. Vérifier [SCHEMAS_DATABASE.md](./SCHEMAS_DATABASE.md) pour les relations
3. Analyser [SCHEMAS_ARCHITECTURE.md](./SCHEMAS_ARCHITECTURE.md) pour l'architecture

### Optimiser les performances

1. Vérifier les index dans [SCHEMAS_DATABASE.md](./SCHEMAS_DATABASE.md)
2. Consulter la section Performance dans [SCHEMAS_ARCHITECTURE.md](./SCHEMAS_ARCHITECTURE.md)
3. Analyser le rate limiting dans [SCHEMAS_FLUX_REQUETES.md](./SCHEMAS_FLUX_REQUETES.md)

---

## Ressources Utiles

### Documentation officielle

- [Next.js 14](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Clerk](https://clerk.com/docs)
- [UploadThing](https://docs.uploadthing.com/)
- [Pusher](https://pusher.com/docs)
- [Mermaid](https://mermaid.js.org/)

### Guides internes

- [ROADMAP_7NOV.md](./ROADMAP_7NOV.md) - Feuille de route du projet

---

## Contribution

Pour contribuer à cette documentation :

1. Mettez à jour les schémas Mermaid existants si nécessaire
2. Ajoutez de nouveaux schémas pour les nouvelles fonctionnalités
3. Maintenez la cohérence des styles et couleurs
4. Testez les schémas sur Mermaid Live Editor
5. Mettez à jour ce README si vous ajoutez de nouveaux fichiers

---

## Contact et Support

Pour toute question sur cette documentation ou l'architecture de HolbiHub :

- Consultez d'abord les schémas appropriés
- Vérifiez le code source pour les détails d'implémentation
- Consultez la roadmap pour les futures fonctionnalités

---

**Dernière mise à jour** : 2025-11-28

**Version de la documentation** : 1.0.0

**Auteur** : Équipe HolbiHub
