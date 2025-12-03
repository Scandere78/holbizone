# Schémas Mermaid - Architecture de l'Application

## 1. Architecture Globale de HolbiHub

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Navigateur Web]
        Mobile[Application Mobile Future]
    end

    subgraph "Next.js 14 - App Router"
        Pages[Pages React]
        Components[Composants UI]
        ServerActions[Server Actions]
        API[API Routes]
        Middleware[Middleware Auth]
    end

    subgraph "Services externes"
        Clerk[Clerk Auth]
        UploadThing[UploadThing Storage]
        Pusher[Pusher Real-time]
    end

    subgraph "Backend Services"
        Actions[Actions Layer]
        Validations[Zod Validations]
        RateLimit[Rate Limiting]
        Security[Security Layer]
    end

    subgraph "Database Layer"
        Prisma[Prisma ORM]
        PostgreSQL[(PostgreSQL DB)]
    end

    Browser --> Pages
    Mobile -.-> Pages
    Pages --> Components
    Pages --> ServerActions
    Components --> ServerActions
    Pages --> API

    ServerActions --> Actions
    API --> Actions

    Middleware --> Clerk
    Actions --> Validations
    Actions --> RateLimit
    Actions --> Security
    Actions --> Prisma

    API --> UploadThing
    Actions --> Pusher

    Prisma --> PostgreSQL

    style Browser fill:#3B82F6,color:#fff
    style Pages fill:#10B981,color:#fff
    style ServerActions fill:#8B5CF6,color:#fff
    style Actions fill:#F59E0B,color:#fff
    style Prisma fill:#2563EB,color:#fff
    style PostgreSQL fill:#1E40AF,color:#fff
    style Clerk fill:#6366F1,color:#fff
    style UploadThing fill:#EC4899,color:#fff
    style Pusher fill:#14B8A6,color:#fff
```

## 2. Architecture en Couches (Layered Architecture)

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[React Components]
        Forms[Formulaires]
        Displays[Affichage de données]
    end

    subgraph "Business Logic Layer"
        SA[Server Actions]
        PostActions[post.action.ts]
        UserActions[user.action.ts]
        MessageActions[message.action.ts]
        NotifActions[notification.action.ts]
        BookmarkActions[bookmark.action.ts]
        ProfileActions[profile.action.ts]
        BlockActions[block.actions.ts]
        SearchActions[search.action.ts]
    end

    subgraph "Validation Layer"
        ZodSchemas[Schémas Zod]
        PostSchema[Post Schemas]
        UserSchema[User Schemas]
        MessageSchema[Message Schemas]
    end

    subgraph "Security & Infrastructure"
        Auth[Clerk Auth]
        RateLimiter[Upstash Rate Limit]
        SecurityUtils[Security Utils]
        Logger[Logger]
    end

    subgraph "Data Access Layer"
        PrismaClient[Prisma Client]
        Queries[Database Queries]
    end

    subgraph "Data Storage"
        DB[(PostgreSQL)]
        FileStorage[UploadThing S3]
    end

    UI --> SA
    Forms --> SA
    Displays --> SA

    SA --> PostActions
    SA --> UserActions
    SA --> MessageActions
    SA --> NotifActions
    SA --> BookmarkActions
    SA --> ProfileActions
    SA --> BlockActions
    SA --> SearchActions

    PostActions --> ZodSchemas
    UserActions --> ZodSchemas
    MessageActions --> ZodSchemas

    PostActions --> Auth
    UserActions --> Auth
    MessageActions --> Auth

    PostActions --> RateLimiter
    UserActions --> RateLimiter

    PostActions --> PrismaClient
    UserActions --> PrismaClient
    MessageActions --> PrismaClient
    NotifActions --> PrismaClient
    BookmarkActions --> PrismaClient
    ProfileActions --> PrismaClient
    BlockActions --> PrismaClient
    SearchActions --> PrismaClient

    PrismaClient --> Queries
    Queries --> DB

    UI --> FileStorage

    style UI fill:#10B981,color:#fff
    style SA fill:#8B5CF6,color:#fff
    style ZodSchemas fill:#F59E0B,color:#fff
    style Auth fill:#6366F1,color:#fff
    style PrismaClient fill:#2563EB,color:#fff
    style DB fill:#1E40AF,color:#fff
```

## 3. Flux d'une Requête Complète

```mermaid
sequenceDiagram
    actor User as Utilisateur
    participant UI as Interface React
    participant SA as Server Action
    participant Auth as Clerk Auth
    participant Val as Validation Zod
    participant RL as Rate Limiter
    participant Prisma as Prisma ORM
    participant DB as PostgreSQL
    participant Pusher as Pusher

    User->>UI: Crée un post
    UI->>SA: createPost(data)

    SA->>Auth: Vérifier authentification
    Auth-->>SA: userId validé

    SA->>Val: Valider données (Zod)
    Val-->>SA: Données validées

    SA->>RL: Vérifier rate limit
    RL-->>SA: Limite OK

    SA->>Prisma: prisma.post.create()
    Prisma->>DB: INSERT INTO posts
    DB-->>Prisma: Post créé
    Prisma-->>SA: Post retourné

    SA->>Pusher: Notifier followers
    Pusher-->>User: Notification temps réel

    SA-->>UI: Succès
    UI-->>User: Post affiché
```

## 4. Structure du Projet

```mermaid
graph TB
    subgraph "src/"
        subgraph "app/"
            Pages[Pages Next.js]
            API[api/]
            Upload[api/uploadthing/]
        end

        subgraph "actions/"
            PostAct[post.action.ts]
            UserAct[user.action.ts]
            MsgAct[message.action.ts]
            NotifAct[notification.action.ts]
            BookAct[bookmark.action.ts]
            ProfAct[profile.action.ts]
            BlockAct[block.actions.ts]
            SearchAct[search.action.ts]
        end

        subgraph "components/"
            UIComp[Composants UI]
            Forms[Formulaires]
            Layouts[Layouts]
        end

        subgraph "lib/"
            PrismaLib[prisma.ts]
            UploadLib[uploadthing.ts]
            PusherLib[pusher.ts]
            RateLimitLib[rate-limit.ts]
            SecurityLib[security.ts]
            LoggerLib[logger.ts]
            Validations[validations/]
        end

        Middleware[middleware.ts]
    end

    subgraph "prisma/"
        Schema[schema.prisma]
    end

    Pages --> UIComp
    Pages --> PostAct
    UIComp --> UserAct
    UIComp --> MsgAct

    PostAct --> PrismaLib
    UserAct --> PrismaLib
    MsgAct --> PrismaLib

    PostAct --> Validations
    UserAct --> RateLimitLib
    MsgAct --> PusherLib

    API --> Upload
    Upload --> UploadLib

    Middleware --> SecurityLib

    PrismaLib --> Schema

    style Pages fill:#10B981,color:#fff
    style PostAct fill:#8B5CF6,color:#fff
    style UserAct fill:#8B5CF6,color:#fff
    style MsgAct fill:#8B5CF6,color:#fff
    style PrismaLib fill:#2563EB,color:#fff
    style Schema fill:#1E40AF,color:#fff
```

## 5. Modules et Fonctionnalités

```mermaid
mindmap
  root((HolbiHub))
    Authentification
      Clerk Auth
      Middleware
      Session Management
    Contenu Social
      Posts
        Création
        Modification
        Suppression
        Images
      Commentaires
        Ajout
        Modification
        Images
      Likes
        Posts
        Commentaires
      Bookmarks
        Sauvegarder
        Retirer
    Relations Sociales
      Follows
        Suivre
        Ne plus suivre
        Liste followers
        Liste following
      Blocages
        Bloquer utilisateur
        Débloquer
        Liste bloqués
      Notifications
        Like
        Commentaire
        Follow
        Temps réel
    Messagerie
      Conversations
        Privées 1:1
        Groupes
        Création
      Messages
        Texte
        Images
        Temps réel Pusher
      Gestion
        Membres
        Rôles admin/member
        Messages non lus
    Profil Utilisateur
      Informations
        Bio
        Photo
        Localisation
        Site web
      Statistiques
        Nombre posts
        Followers/Following
    Support
      Réclamations
        BUG
        FEATURE
        IMPROVEMENT
        Priorités
        Statuts
    Infrastructure
      Upload Fichiers
        Images posts
        Images commentaires
        Images messages
        UploadThing
      Rate Limiting
        Upstash Redis
      Sécurité
        Validation Zod
        Security headers
        CSRF protection
      Base de données
        PostgreSQL
        Prisma ORM
```

## 6. Services Externes et Intégrations

```mermaid
graph TB
    subgraph "HolbiHub Application"
        App[Next.js App]
    end

    subgraph "Authentication - Clerk"
        ClerkAuth[Clerk Auth Service]
        ClerkWebhook[Webhooks]
        ClerkUI[UI Components]
    end

    subgraph "File Storage - UploadThing"
        UTCore[UploadThing Core]
        UTRouter[File Router]
        UTStorage[S3 Storage]
    end

    subgraph "Real-time - Pusher"
        PusherServer[Pusher Server]
        PusherClient[Pusher Client]
        PusherChannels[Channels privés]
    end

    subgraph "Rate Limiting - Upstash"
        UpstashRedis[Redis Cloud]
        RateLimiter[Rate Limiter]
    end

    subgraph "Database - PostgreSQL"
        PostgreSQL[(Database)]
    end

    App --> ClerkAuth
    App --> ClerkUI
    ClerkAuth --> ClerkWebhook

    App --> UTCore
    UTCore --> UTRouter
    UTRouter --> UTStorage

    App --> PusherServer
    App --> PusherClient
    PusherServer --> PusherChannels

    App --> RateLimiter
    RateLimiter --> UpstashRedis

    App --> PostgreSQL

    style App fill:#10B981,color:#fff,stroke-width:3px
    style ClerkAuth fill:#6366F1,color:#fff
    style UTCore fill:#EC4899,color:#fff
    style PusherServer fill:#14B8A6,color:#fff
    style UpstashRedis fill:#F59E0B,color:#fff
    style PostgreSQL fill:#1E40AF,color:#fff
```

## 7. Pattern de Server Actions (Next.js 14)

```mermaid
graph LR
    subgraph "Client Component"
        Form[Formulaire React]
        Button[Bouton Submit]
    end

    subgraph "Server Action"
        Action["'use server'<br/>async function"]
        Auth[Vérification Auth]
        Validation[Validation Zod]
        Business[Logique métier]
        DB[Accès DB Prisma]
    end

    subgraph "Response"
        Success[Succès]
        Error[Erreur]
        Revalidate[revalidatePath]
    end

    Form --> Button
    Button -->|action prop| Action
    Action --> Auth
    Auth --> Validation
    Validation --> Business
    Business --> DB
    DB --> Success
    DB --> Error
    Success --> Revalidate
    Revalidate --> Form

    style Form fill:#10B981,color:#fff
    style Action fill:#8B5CF6,color:#fff
    style Success fill:#059669,color:#fff
    style Error fill:#DC2626,color:#fff
```

## 8. Sécurité Multi-Couches

```mermaid
graph TB
    Request[Requête entrante]

    subgraph "Layer 1: Network"
        HTTPS[HTTPS Only]
        Headers[Security Headers]
        CSP[Content Security Policy]
    end

    subgraph "Layer 2: Authentication"
        ClerkMW[Clerk Middleware]
        Protected[Routes protégées]
    end

    subgraph "Layer 3: Authorization"
        UserCheck[Vérification userId]
        OwnerCheck[Vérification propriétaire]
    end

    subgraph "Layer 4: Validation"
        ZodVal[Validation Zod]
        Sanitize[Sanitization]
    end

    subgraph "Layer 5: Rate Limiting"
        RateLimit[Upstash Rate Limit]
        IPCheck[Vérification IP]
    end

    subgraph "Layer 6: Business Logic"
        Logic[Logique métier]
        BlockCheck[Vérification blocage]
    end

    subgraph "Layer 7: Database"
        Prisma[Prisma ORM]
        Prepared[Prepared Statements]
    end

    Request --> HTTPS
    HTTPS --> Headers
    Headers --> CSP
    CSP --> ClerkMW
    ClerkMW --> Protected
    Protected --> UserCheck
    UserCheck --> OwnerCheck
    OwnerCheck --> ZodVal
    ZodVal --> Sanitize
    Sanitize --> RateLimit
    RateLimit --> IPCheck
    IPCheck --> Logic
    Logic --> BlockCheck
    BlockCheck --> Prisma
    Prisma --> Prepared

    style Request fill:#3B82F6,color:#fff
    style HTTPS fill:#10B981,color:#fff
    style ClerkMW fill:#6366F1,color:#fff
    style ZodVal fill:#F59E0B,color:#fff
    style RateLimit fill:#EF4444,color:#fff
    style Prisma fill:#2563EB,color:#fff
```

## 9. Performance et Optimisations

```mermaid
graph TB
    subgraph "Frontend Optimizations"
        NextImage[Next.js Image Optimization]
        Lazy[Lazy Loading Components]
        Cache[React Cache]
    end

    subgraph "Backend Optimizations"
        ServerCache[Server-side Caching]
        RateLimit[Rate Limiting]
        ConnPool[Connection Pooling]
    end

    subgraph "Database Optimizations"
        Indexes[Indexes composites]
        Relations[Eager/Lazy Loading]
        Batching[Query Batching]
    end

    subgraph "CDN & Assets"
        UploadThingCDN[UploadThing CDN]
        StaticAssets[Static Assets]
        ImageFormats[AVIF/WebP]
    end

    NextImage --> UploadThingCDN
    NextImage --> ImageFormats
    Cache --> ServerCache
    ServerCache --> ConnPool
    ConnPool --> Indexes
    Indexes --> Relations
    Relations --> Batching

    style NextImage fill:#10B981,color:#fff
    style ServerCache fill:#8B5CF6,color:#fff
    style Indexes fill:#2563EB,color:#fff
    style UploadThingCDN fill:#EC4899,color:#fff
```
