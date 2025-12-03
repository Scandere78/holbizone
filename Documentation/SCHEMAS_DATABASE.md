# Schémas Mermaid - Base de Données Complète

## 1. Diagramme Entité-Relation Complet

```mermaid
erDiagram
    User ||--o{ Post : "authorId"
    User ||--o{ Comment : "authorId"
    User ||--o{ Like : "userId"
    User ||--o{ CommentLike : "userId"
    User ||--o{ Bookmark : "userId"
    User ||--o{ Follows : "followerId"
    User ||--o{ Follows : "followingId"
    User ||--o{ Block : "blockerId"
    User ||--o{ Block : "blockedId"
    User ||--o{ Notification : "userId (receiver)"
    User ||--o{ Notification : "creatorId (sender)"
    User ||--o{ Message : "senderId"
    User ||--o{ ConversationMember : "userId"
    User ||--o{ Conversation : "creatorId"
    User ||--o{ Reclamation : "userId"

    Post ||--o{ Comment : "postId"
    Post ||--o{ Like : "postId"
    Post ||--o{ Bookmark : "postId"
    Post ||--o{ Notification : "postId"

    Comment ||--o{ CommentLike : "commentId"
    Comment ||--o{ Notification : "commentId"

    Conversation ||--o{ ConversationMember : "conversationId"
    Conversation ||--o{ Message : "conversationId"

    User {
        string id PK
        string email UK
        string username UK
        string clerkId UK
        string name
        string bio
        string image
        string location
        string website
        datetime createdAt
        datetime updatedAt
    }

    Post {
        string id PK
        string authorId FK
        string content
        string image
        datetime createdAt
        datetime updatedAt
    }

    Comment {
        string id PK
        string content
        string image
        string authorId FK
        string postId FK
        datetime createdAt
        datetime updatedAt
    }

    Like {
        string id PK
        string postId FK
        string userId FK
        datetime createdAt
    }

    CommentLike {
        string id PK
        string commentId FK
        string userId FK
        datetime createdAt
    }

    Bookmark {
        string id PK
        string userId FK
        string postId FK
        datetime createdAt
    }

    Follows {
        string followerId PK,FK
        string followingId PK,FK
        datetime createdAt
    }

    Block {
        string id PK
        string blockerId FK
        string blockedId FK
        datetime createdAt
    }

    Notification {
        string id PK
        string userId FK
        string creatorId FK
        string type
        boolean read
        string postId FK
        string commentId FK
        datetime createdAt
    }

    Conversation {
        string id PK
        string name
        string image
        boolean isGroup
        string creatorId FK
        datetime createdAt
        datetime updatedAt
    }

    ConversationMember {
        string id PK
        string userId FK
        string conversationId FK
        string role
        datetime joinedAt
        datetime lastReadAt
    }

    Message {
        string id PK
        string content
        string image
        string senderId FK
        string conversationId FK
        datetime createdAt
        datetime updatedAt
    }

    Reclamation {
        string id PK
        string type
        string title
        text description
        string priority
        string status
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
```

## 2. Vue d'Ensemble des Modules

```mermaid
graph TB
    subgraph "Core - Utilisateurs"
        User[User]
    end

    subgraph "Module Social"
        Post[Post]
        Comment[Comment]
        Like[Like]
        CommentLike[CommentLike]
        Bookmark[Bookmark]
    end

    subgraph "Module Relations"
        Follows[Follows]
        Block[Block]
        Notification[Notification]
    end

    subgraph "Module Messagerie"
        Conversation[Conversation]
        ConversationMember[ConversationMember]
        Message[Message]
    end

    subgraph "Module Support"
        Reclamation[Reclamation]
    end

    User --> Post
    User --> Comment
    User --> Like
    User --> CommentLike
    User --> Bookmark
    User --> Follows
    User --> Block
    User --> Notification
    User --> Conversation
    User --> ConversationMember
    User --> Message
    User --> Reclamation

    Post --> Comment
    Post --> Like
    Post --> Bookmark
    Comment --> CommentLike
    Conversation --> ConversationMember
    Conversation --> Message

    style User fill:#4F46E5,stroke:#312E81,stroke-width:4px,color:#fff
    style Post fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
    style Comment fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
    style Like fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
    style CommentLike fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
    style Bookmark fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
    style Follows fill:#8B5CF6,stroke:#5B21B6,stroke-width:2px,color:#fff
    style Block fill:#8B5CF6,stroke:#5B21B6,stroke-width:2px,color:#fff
    style Notification fill:#8B5CF6,stroke:#5B21B6,stroke-width:2px,color:#fff
    style Conversation fill:#F59E0B,stroke:#92400E,stroke-width:2px,color:#fff
    style ConversationMember fill:#F59E0B,stroke:#92400E,stroke-width:2px,color:#fff
    style Message fill:#F59E0B,stroke:#92400E,stroke-width:2px,color:#fff
    style Reclamation fill:#EF4444,stroke:#991B1B,stroke-width:2px,color:#fff
```

## 3. Relations par Type

### 3.1 Relations One-to-Many

```mermaid
graph LR
    User[User] -->|1:N| Post[Posts]
    User -->|1:N| Comment[Comments]
    User -->|1:N| Like[Likes]
    User -->|1:N| Message[Messages]
    User -->|1:N| Reclamation[Reclamations]

    Post -->|1:N| Comment
    Post -->|1:N| Like
    Post -->|1:N| Notification[Notifications]

    Conversation[Conversation] -->|1:N| Message
    Conversation -->|1:N| ConversationMember[Members]

    style User fill:#4F46E5,color:#fff
    style Post fill:#10B981,color:#fff
    style Conversation fill:#F59E0B,color:#fff
```

### 3.2 Relations Many-to-Many

```mermaid
graph TB
    U1[User A] ---|Follows| U2[User B]
    U1 ---|Block| U2
    U1 ---|ConversationMember| Conv[Conversation]
    U2 ---|ConversationMember| Conv
    U1 ---|Bookmark| Post[Post]

    style U1 fill:#4F46E5,color:#fff
    style U2 fill:#4F46E5,color:#fff
    style Conv fill:#F59E0B,color:#fff
    style Post fill:#10B981,color:#fff
```

## 4. Enums et Types

### 4.1 NotificationType

```mermaid
graph LR
    NT[NotificationType]
    NT --> LIKE
    NT --> COMMENT
    NT --> FOLLOW

    style NT fill:#8B5CF6,color:#fff
    style LIKE fill:#10B981,color:#fff
    style COMMENT fill:#10B981,color:#fff
    style FOLLOW fill:#10B981,color:#fff
```

### 4.2 ReclamationType

```mermaid
graph LR
    RT[ReclamationType]
    RT --> BUG
    RT --> FEATURE
    RT --> IMPROVEMENT
    RT --> OTHER

    style RT fill:#EF4444,color:#fff
    style BUG fill:#DC2626,color:#fff
    style FEATURE fill:#059669,color:#fff
    style IMPROVEMENT fill:#3B82F6,color:#fff
    style OTHER fill:#6B7280,color:#fff
```

### 4.3 ReclamationPriority

```mermaid
graph LR
    RP[Priority]
    RP --> LOW[LOW - Basse]
    RP --> MEDIUM[MEDIUM - Moyenne]
    RP --> HIGH[HIGH - Haute]

    style RP fill:#EF4444,color:#fff
    style LOW fill:#10B981,color:#fff
    style MEDIUM fill:#F59E0B,color:#fff
    style HIGH fill:#DC2626,color:#fff
```

### 4.4 ReclamationStatus

```mermaid
graph LR
    RS[Status]
    RS --> PENDING[PENDING - En attente]
    RS --> IN_PROGRESS[IN_PROGRESS - En cours]
    RS --> RESOLVED[RESOLVED - Résolue]
    RS --> REJECTED[REJECTED - Rejetée]

    style RS fill:#EF4444,color:#fff
    style PENDING fill:#F59E0B,color:#fff
    style IN_PROGRESS fill:#3B82F6,color:#fff
    style RESOLVED fill:#10B981,color:#fff
    style REJECTED fill:#DC2626,color:#fff
```

## 5. Index et Optimisations

### Index Composites

| Modèle | Champs | Type | Raison |
|--------|--------|------|---------|
| Comment | `[authorId, postId]` | Composite | Requêtes de commentaires par auteur et post |
| Like | `[userId, postId]` | Composite + Unique | Empêche les doublons, optimise les requêtes |
| CommentLike | `[userId, commentId]` | Composite + Unique | Empêche les doublons, optimise les requêtes |
| Follows | `[followerId, followingId]` | Composite + PK | Clé primaire composite, empêche les doublons |
| Block | `[blockerId]`, `[blockedId]` | Simple | Recherche rapide des blocages |
| Notification | `[userId, createdAt]` | Composite | Récupération chronologique des notifications |
| ConversationMember | `[userId, conversationId]` | Composite + Unique | Empêche les doublons de membres |
| Message | `[conversationId, createdAt]` | Composite | Messages chronologiques par conversation |
| Reclamation | `[userId, createdAt]`, `[status, createdAt]` | Composite | Réclamations par utilisateur et par statut |
| Conversation | `[isGroup]`, `[creatorId]` | Simple | Filtrage par type et créateur |

### Contraintes d'Unicité

```mermaid
graph TB
    subgraph "User - 3 contraintes uniques"
        UEmail[email]
        UUsername[username]
        UClerkId[clerkId]
    end

    subgraph "Like - Empêche les doublons"
        LUnique["userId + postId"]
    end

    subgraph "CommentLike - Empêche les doublons"
        CLUnique["userId + commentId"]
    end

    subgraph "Follows - Clé primaire composite"
        FUnique["followerId + followingId"]
    end

    subgraph "Block - Empêche les doublons"
        BUnique["blockerId + blockedId"]
    end

    subgraph "ConversationMember - Empêche les doublons"
        CMUnique["userId + conversationId"]
    end

    subgraph "Bookmark - Empêche les doublons"
        BMUnique["userId + postId"]
    end

    style UEmail fill:#4F46E5,color:#fff
    style UUsername fill:#4F46E5,color:#fff
    style UClerkId fill:#4F46E5,color:#fff
    style LUnique fill:#10B981,color:#fff
    style CLUnique fill:#10B981,color:#fff
    style FUnique fill:#8B5CF6,color:#fff
    style BUnique fill:#8B5CF6,color:#fff
    style CMUnique fill:#F59E0B,color:#fff
    style BMUnique fill:#10B981,color:#fff
```

## 6. Cascade de Suppression

Toutes les relations utilisent `onDelete: Cascade` sauf indication contraire :

```mermaid
graph TD
    User[Suppression User]

    User -->|CASCADE| Posts[Supprime tous les Posts]
    User -->|CASCADE| Comments[Supprime tous les Comments]
    User -->|CASCADE| Likes[Supprime tous les Likes]
    User -->|CASCADE| Messages[Supprime tous les Messages]
    User -->|CASCADE| Follows[Supprime tous les Follows]
    User -->|CASCADE| Blocks[Supprime tous les Blocks]
    User -->|CASCADE| Notifs[Supprime toutes les Notifications]
    User -->|CASCADE| Reclam[Supprime toutes les Reclamations]
    User -->|CASCADE| Members[Supprime ConversationMembers]

    Posts -->|CASCADE| PostComments[Supprime Comments du Post]
    Posts -->|CASCADE| PostLikes[Supprime Likes du Post]
    Posts -->|CASCADE| PostNotifs[Supprime Notifications du Post]

    Conv[Suppression Conversation] -->|CASCADE| ConvMessages[Supprime tous les Messages]
    Conv -->|CASCADE| ConvMembers[Supprime tous les Members]

    style User fill:#DC2626,color:#fff,stroke-width:3px
    style Conv fill:#DC2626,color:#fff,stroke-width:3px
    style Posts fill:#EF4444,color:#fff
```

## 7. Statistiques de la Base de Données

| Métrique | Valeur |
|----------|--------|
| Nombre total de modèles | 13 |
| Modèles principaux | User, Post, Conversation |
| Relations One-to-Many | 15 |
| Relations Many-to-Many | 4 |
| Enums définis | 4 |
| Index composites | 12 |
| Contraintes d'unicité | 10 |
| Champs timestamp | 26 (createdAt/updatedAt) |
