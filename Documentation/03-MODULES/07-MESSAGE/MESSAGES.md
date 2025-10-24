# Documentation - Système de Messages

## Vue d'ensemble

Le système de messages de HolbiHub permet aux utilisateurs d'échanger des messages privés en temps réel. Le système utilise Pusher pour les communications WebSocket et supporte l'envoi de textes et d'images.

## Architecture

### Structure des dossiers

```
src/
├── actions/
│   └── message.action.ts          # Actions serveur pour la gestion des messages
├── app/
│   └── messages/
│       ├── page.tsx               # Page principale des messages
│       ├── new/
│       │   └── page.tsx           # Nouvelle conversation
│       └── [conversationId]/
│           └── page.tsx           # Page de chat
└── components/
    └── messages/
        ├── ChatHeader.tsx         # En-tête du chat
        ├── ConversationList.tsx   # Liste des conversations
        ├── MessageInput.tsx       # Zone de saisie de message
        ├── MessageList.tsx        # Affichage des messages
        └── NewConversationButton.tsx # Bouton pour créer une conversation
```

## Base de données (Prisma Schema)

### Modèles principaux

#### Conversation
```prisma
model Conversation {
  id         String   @id @default(cuid())
  name       String?  // Nom du groupe (null pour conversations privées)
  image      String?  // Image du groupe
  isGroup    Boolean  @default(false)
  creatorId  String?  // ID du créateur (pour les groupes)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  members    ConversationMember[]
  messages   Message[]
}
```

#### ConversationMember
```prisma
model ConversationMember {
  id             String   @id @default(cuid())
  userId         String
  conversationId String
  role           String   @default("member") // "admin" ou "member"
  lastReadAt     DateTime @default(now())
  joinedAt       DateTime @default(now())

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@unique([userId, conversationId])
}
```

#### Message
```prisma
model Message {
  id             String   @id @default(cuid())
  content        String
  image          String?
  senderId       String
  conversationId String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  sender         User         @relation(fields: [senderId], references: [id], onDelete: Cascade)
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

## Actions serveur (message.action.ts)

### getOrCreatePrivateConversation(otherUserId: string)

Crée une nouvelle conversation privée ou récupère une existante entre deux utilisateurs.

**Paramètres:**
- `otherUserId`: ID de l'autre utilisateur

**Retour:**
```typescript
{
  success: boolean;
  conversation?: Conversation;
  error?: string;
}
```

**Logique:**
1. Vérifie l'authentification de l'utilisateur
2. Recherche une conversation existante entre les deux utilisateurs
3. Si elle existe, la retourne
4. Sinon, crée une nouvelle conversation avec les deux membres
5. Revalide le cache de la page `/messages`

### createGroupConversation(data)

Crée un nouveau groupe de discussion.

**Paramètres:**
```typescript
{
  name: string;
  memberIds: string[];
  image?: string;
}
```

**Retour:**
```typescript
{
  success: boolean;
  conversation?: Conversation;
  error?: string;
}
```

**Logique:**
1. Vérifie l'authentification
2. Crée la conversation avec `isGroup: true`
3. Ajoute le créateur comme admin
4. Ajoute les autres membres comme "member"

### getUserConversations()

Récupère toutes les conversations de l'utilisateur connecté.

**Retour:** `Conversation[]`

**Inclusions:**
- Tous les membres avec leurs informations utilisateur
- Le dernier message de chaque conversation
- Triées par date de mise à jour (plus récentes en premier)

### getConversationMessages(conversationId: string)

Récupère tous les messages d'une conversation.

**Paramètres:**
- `conversationId`: ID de la conversation

**Retour:** `Message[]`

**Logique:**
1. Vérifie que l'utilisateur est membre de la conversation
2. Récupère tous les messages triés par date (plus anciens en premier)
3. Marque la conversation comme lue (`lastReadAt`)

### sendMessage(data)

Envoie un nouveau message dans une conversation.

**Paramètres:**
```typescript
{
  conversationId: string;
  content: string;
  image?: string;
}
```

**Retour:**
```typescript
{
  success: boolean;
  message?: Message;
  error?: string;
}
```

**Logique:**
1. Vérifie que l'utilisateur est membre
2. Crée le message
3. Met à jour `updatedAt` de la conversation
4. Émet un événement Pusher pour le temps réel
5. Revalide le cache

**Événement Pusher:**
- Canal: `conversation-${conversationId}`
- Événement: `new-message`
- Payload: Objet Message complet

### getUnreadMessagesCount()

Compte le nombre total de messages non lus de l'utilisateur.

**Retour:** `number`

**Logique:**
1. Récupère toutes les conversations de l'utilisateur
2. Pour chaque conversation, compte les messages reçus après `lastReadAt`
3. Retourne la somme totale

### getAvailableUsersForChat()

Récupère la liste des utilisateurs avec qui on peut démarrer une conversation.

**Retour:** `User[]` (nom, username, image)

**Critères:**
- Doit être un ami mutuel (follow bidirectionnel)
- Ne doit pas avoir de conversation privée existante avec cet utilisateur

**Logique:**
1. Récupère les utilisateurs qu'on suit
2. Filtre ceux qui nous suivent en retour
3. Exclut ceux avec qui on a déjà une conversation privée

## Pages

### /messages (page.tsx)

Page principale affichant la liste des conversations.

**Composants:**
- Titre "Messages" avec bouton "+"
- `<ConversationList />` avec toutes les conversations
- Zone de sélection (desktop uniquement)

**Layout:**
- Desktop: Grid 3 colonnes (1/3 liste, 2/3 zone de sélection)
- Mobile: Liste complète

### /messages/new (new/page.tsx)

Page pour créer une nouvelle conversation.

**Fonctionnalités:**
- Affiche la liste des amis disponibles
- Bouton "Message" pour chaque ami
- Si aucun ami: message avec lien vers `/explorer`

**Composants:**
- `<NewConversationButton />` pour chaque utilisateur disponible

### /messages/[conversationId] (page.tsx)

Page de chat pour une conversation spécifique.

**Composants:**
- `<ChatHeader />`: Affiche l'avatar et le nom
- `<MessageList />`: Messages avec WebSocket
- `<MessageInput />`: Zone de saisie

**Layout:**
- Desktop: Liste des conversations à gauche, chat à droite
- Mobile: Chat uniquement (bouton retour dans le header)

## Composants

### ChatHeader

Affiche l'en-tête d'une conversation.

**Props:**
```typescript
{
  conversationId: string;
  isGroup: boolean;
  name?: string | null;
  image?: string | null;
  otherUser?: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}
```

**Éléments:**
- Bouton retour
- Avatar
- Nom (groupe ou utilisateur)
- Username (si conversation privée)
- Bouton options (non implémenté)

### ConversationList

Liste toutes les conversations de l'utilisateur.

**Props:**
```typescript
{
  conversations: Conversation[];
}
```

**Fonctionnalités:**
- Affiche l'avatar et le nom
- Dernier message avec timestamp
- Indicateur de conversation active
- Indicateur "en ligne" (statique pour l'instant)

**Logique d'affichage:**
- Groupe: Utilise `name` et `image` de la conversation
- Privée: Utilise le nom et l'avatar de l'autre membre

### MessageList

Affiche les messages d'une conversation avec mise à jour en temps réel.

**Props:**
```typescript
{
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
}
```

**Fonctionnalités:**
- WebSocket avec Pusher pour les nouveaux messages
- Auto-scroll vers le bas
- Prévention des doublons
- Affichage différencié (messages envoyés à droite, reçus à gauche)
- Support des images

**État:**
```typescript
const [messages, setMessages] = useState<Message[]>(initialMessages);
```

**Effets:**
1. Auto-scroll: Se déclenche à chaque nouveau message
2. WebSocket: Souscrit au canal `conversation-${conversationId}` et écoute `new-message`

### MessageInput

Zone de saisie pour envoyer des messages.

**Props:**
```typescript
{
  conversationId: string;
}
```

**Fonctionnalités:**
- Saisie de texte (Textarea)
- Upload d'image via UploadThing
- Preview de l'image
- Envoi par bouton ou Enter
- Shift+Enter pour nouvelle ligne

**État:**
```typescript
const [content, setContent] = useState("");
const [image, setImage] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);
const [isSending, setIsSending] = useState(false);
```

**Validation:**
- Bouton d'envoi désactivé si pas de contenu ET pas d'image
- Désactivé pendant l'upload ou l'envoi

### NewConversationButton

Bouton pour créer ou rejoindre une conversation avec un utilisateur.

**Props:**
```typescript
{
  userId: string;
}
```

**Comportement:**
1. Appelle `getOrCreatePrivateConversation(userId)`
2. Redirige vers `/messages/${conversationId}`
3. Affiche un loader pendant l'opération
4. Toast d'erreur en cas de problème

## Temps réel avec Pusher

### Configuration

Fichier: `src/lib/pusher.ts`

**Client:**
```typescript
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);
```

**Serveur:**
```typescript
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});
```

### Canaux et événements

#### new-message

**Canal:** `conversation-${conversationId}`
**Événement:** `new-message`
**Payload:**
```typescript
{
  id: string;
  content: string;
  image?: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    username: string;
    image: string;
  };
}
```

**Émission:** Dans `sendMessage()` (message.action.ts)
**Réception:** Dans `MessageList` component

## Badge de messages non lus

Fichier: `src/components/MessageBadge.tsx`

Affiche le nombre de messages non lus dans la navbar.

**Fonctionnalités:**
- Appelle `getUnreadMessagesCount()` au chargement
- Affiche un badge rouge si > 0
- Limite l'affichage à 99+

**Utilisation:**
```tsx
<MessageBadge />
```

## Upload d'images

Utilise UploadThing pour l'upload d'images dans les messages.

**Endpoint:** `postImage`

**Configuration:** `src/app/api/uploadthing/core.ts`

**Utilisation dans MessageInput:**
```tsx
<UploadButton
  endpoint="postImage"
  onClientUploadComplete={(res) => setImage(res[0].url)}
  onUploadError={(error) => toast.error(error.message)}
  onUploadBegin={() => setIsUploading(true)}
/>
```

## Permissions et sécurité

### Vérifications

1. **getConversationMessages:**
   - Vérifie que l'utilisateur est membre avant de récupérer les messages

2. **sendMessage:**
   - Vérifie que l'utilisateur est membre avant d'envoyer

3. **getAvailableUsersForChat:**
   - Seuls les amis mutuels (follow bidirectionnel) sont disponibles

### Règles métier

- On ne peut envoyer de messages qu'à des amis mutuels
- On ne peut voir les messages que des conversations dont on est membre
- Le créateur d'un groupe est automatiquement admin
- Les messages marquent automatiquement la conversation comme lue

## Améliorations futures

### Fonctionnalités

1. **Groupes:**
   - Interface pour créer des groupes
   - Gestion des membres (ajout/suppression)
   - Permissions admin

2. **Messages:**
   - Réactions aux messages
   - Répondre à un message spécifique
   - Modification/suppression de messages
   - Messages vocaux
   - Partage de fichiers

3. **Notifications:**
   - Notifications push
   - Sons de notification
   - Notifications desktop

4. **Statut:**
   - Statut en ligne/hors ligne réel
   - "En train d'écrire..."
   - Dernière connexion

5. **Recherche:**
   - Recherche dans les messages
   - Recherche de conversations
   - Filtres

### Optimisations

1. **Performance:**
   - Pagination des messages
   - Lazy loading des images
   - Optimisation des requêtes Prisma

2. **UX:**
   - Indicateurs de lecture (vu/non vu)
   - Confirmation d'envoi
   - Mode hors ligne
   - Brouillons de messages

3. **Sécurité:**
   - Chiffrement end-to-end
   - Signalement de messages
   - Blocage d'utilisateurs
   - Limite de taille des messages

## Variables d'environnement requises

```env
# Pusher
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
PUSHER_APP_ID=
PUSHER_SECRET=

# UploadThing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

## Dépendances

```json
{
  "pusher": "^5.x",
  "pusher-js": "^8.x",
  "uploadthing": "^6.x",
  "react-hot-toast": "^2.x",
  "date-fns": "^3.x"
}
```

## Routes API

### /api/uploadthing

Endpoint pour l'upload d'images via UploadThing.

**Configuration:** `src/app/api/uploadthing/core.ts`
**Route:** `src/app/api/uploadthing/route.ts`

## Exemples d'utilisation

### Créer une conversation et envoyer un message

```typescript
// 1. Créer ou récupérer une conversation
const result = await getOrCreatePrivateConversation("user123");

if (result.success && result.conversation) {
  // 2. Envoyer un message
  await sendMessage({
    conversationId: result.conversation.id,
    content: "Bonjour !",
  });
}
```

### Écouter les nouveaux messages

```typescript
"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";

function MyComponent({ conversationId }) {
  useEffect(() => {
    const channel = pusherClient.subscribe(`conversation-${conversationId}`);

    channel.bind("new-message", (message) => {
      console.log("Nouveau message:", message);
    });

    return () => {
      channel.unbind("new-message");
      pusherClient.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);
}
```

### Compter les messages non lus

```typescript
const unreadCount = await getUnreadMessagesCount();
console.log(`Vous avez ${unreadCount} message(s) non lu(s)`);
```
