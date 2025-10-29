# Module de Sécurité

## Vue d'ensemble

Le module de sécurité de HolbiHub protège l'application contre les attaques courantes (XSS, spam, uploads malveillants) et garantit une utilisation saine de la plateforme.

---

## Fichiers du module

### 1. **Rate Limiting** - [src/lib/rate-limit.ts](../../../src/lib/rate-limit.ts)

#### Description
Système de limitation de débit utilisant **Upstash Redis** pour empêcher les abus et le spam.

#### Technologies utilisées
- `@upstash/ratelimit` - Gestion des limites de requêtes
- `@upstash/redis` - Base de données Redis serverless
- Redis.fromEnv() pour la configuration automatique

#### Configuration

Les limites sont définies par type d'action :

| Action | Limite | Fenêtre | Préfixe Redis |
|--------|--------|---------|---------------|
| **Posts** | 10 requêtes | 10 secondes | `ratelimit:post` |
| **Messages** | 20 requêtes | 10 secondes | `ratelimit:message` |
| **Commentaires** | 15 requêtes | 10 secondes | `ratelimit:comment` |
| **Likes** | 50 requêtes | 10 secondes | `ratelimit:like` |
| **Uploads d'images** | 5 requêtes | 60 secondes | `ratelimit:upload` |

#### Algorithme utilisé

**Sliding Window** : Fenêtre glissante qui compte les requêtes sur une période donnée.

Avantages :
- Plus précis que le "fixed window"
- Évite les pics de requêtes en bordure de fenêtre
- Répartition équitable du trafic

#### Fonction principale : `checkRateLimit()`

```typescript
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
  context: string
): Promise<{ success: boolean; remaining: number; resetAfter: number }>
```

**Paramètres :**
- `limiter` : Instance de Ratelimit (ex: `postRateLimit`)
- `identifier` : ID unique (généralement `userId`)
- `context` : Contexte pour le logging (ex: "createPost")

**Retour :**
- `success` : `true` si la limite n'est pas dépassée
- `remaining` : Nombre de requêtes restantes
- `resetAfter` : Temps d'attente en millisecondes avant reset

**Comportement en cas d'erreur :**
- Strategy **"fail-open"** : Si Redis est indisponible, on laisse passer la requête
- Meilleur pour l'UX que bloquer tous les utilisateurs

#### Variables d'environnement requises

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxxx...
```

---

### 2. **Sécurité générale** - [src/lib/security.ts](../../../src/lib/security.ts)

#### Description
Utilitaires de sécurité pour nettoyer les entrées utilisateur et valider les fichiers.

#### A. Sanitisation HTML : `sanitizeHtml()`

**Protection contre : XSS (Cross-Site Scripting)**

```typescript
export function sanitizeHtml(dirty: string): string
```

**Fonctionnement :**
- Utilise `isomorphic-dompurify` (compatible Node.js et browser)
- Supprime les balises dangereuses (`<script>`, `<iframe>`, etc.)
- Supprime les événements JavaScript (`onclick`, `onerror`, etc.)

**Balises autorisées :**
```typescript
ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "p", "ul", "li", "ol"]
ALLOWED_ATTR: ["href", "title", "target"]
```

**En cas d'erreur :**
- Retourne le texte brut (toutes les balises supprimées)
- Log l'erreur pour investigation

**Exemple d'utilisation :**
```typescript
const userInput = '<script>alert("XSS")</script><p>Hello</p>';
const clean = sanitizeHtml(userInput);
// Résultat: '<p>Hello</p>'
```

#### B. Validation d'images : `validateImageUpload()`

**Protection contre : Uploads malveillants, surcharge serveur**

```typescript
export function validateImageUpload(file: File): {
  valid: boolean;
  error?: string;
}
```

**Vérifications effectuées :**

1. **Taille maximale** : 10 MB
2. **Types MIME autorisés** :
   - `image/jpeg`
   - `image/png`
   - `image/webp`
   - `image/gif`

**Logging :**
- WARN si fichier rejeté (trop gros ou mauvais type)
- DEBUG si fichier accepté

#### C. Validation d'URL : `isValidUrl()`

**Protection contre : Redirections malveillantes, javascript: protocol**

```typescript
export function isValidUrl(url: string): boolean
```

**Protocoles autorisés :**
- `http:`
- `https:`

**Protocoles bloqués :**
- `javascript:`
- `data:`
- `file:`
- etc.

#### D. Token CSRF : `generateCSRFToken()`

**Protection contre : Cross-Site Request Forgery**

```typescript
export function generateCSRFToken(): string
```

**Note :** Version basique actuellement. À améliorer avec :
- Stockage en session/cookie
- Validation côté serveur
- Rotation périodique

---

### 3. **Validation Zod pour images** - [src/lib/validations/image.ts](../../../src/lib/validations/image.ts)

#### Description
Schémas Zod pour valider les uploads d'images côté serveur.

#### Schéma : `ImageUploadSchema`

```typescript
export const ImageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "Le fichier doit faire moins de 10MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Le format doit être JPEG, PNG, WebP ou GIF"
    ),
});
```

#### Fonction : `validateAndSanitizeImage()`

**Double validation :**
1. Validation avec Zod (schéma strict)
2. Validation avec `validateImageUpload()` de security.ts

**Retour :**
```typescript
{
  success: boolean;
  error?: string;
  file?: File;
}
```

**Utilisation dans une Server Action :**
```typescript
const validation = await validateAndSanitizeImage(file);
if (!validation.success) {
  return { error: validation.error };
}
// Upload vers UploadThing
```

---

### 4. **Middleware de sécurité** - [src/middleware.ts](../../../src/middleware.ts)

#### Description
Middleware Next.js qui protège les routes et ajoute des headers de sécurité.

#### A. Protection des routes avec Clerk

**Routes publiques (accessibles sans auth) :**
```typescript
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/explorer(.*)",
  "/api/webhooks(.*)",
  "/api/uploadthing(.*)",
  "/not-found",
]);
```

**Toutes les autres routes :** Authentification obligatoire via `auth.protect()`

#### B. Headers de sécurité ajoutés

| Header | Valeur | Protection |
|--------|--------|------------|
| `X-CSRF-Token` | UUID unique | Protection CSRF |
| `X-Content-Type-Options` | `nosniff` | Empêche le MIME-sniffing |
| `X-Frame-Options` | `DENY` | Empêche l'intégration en iframe (clickjacking) |
| `X-XSS-Protection` | `1; mode=block` | Active le filtre XSS du navigateur |

#### C. Configuration du matcher

```typescript
export const config = {
  matcher: [
    // Skip Next.js internals et fichiers statiques
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Toujours exécuter pour les routes API et tRPC
    "/(api|trpc)(.*)",
  ],
};
```

---

## Intégration dans les Server Actions

### Exemple : [src/actions/post.action.ts](../../../src/actions/post.action.ts)

#### Fonction `createPost()` - Protection complète

```typescript
export async function createPost(content: string, image?: string) {
  try {
    // ÉTAPE 1: Vérifier l'authentification
    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({ context: "createPost", action: "Unauthorized" });
      return { success: false, error: "Non autorisé" };
    }

    // ÉTAPE 2: RATE LIMITING ⭐ NOUVEAU
    const rateLimitResult = await checkRateLimit(
      postRateLimit,
      userId,
      "createPost"
    );

    if (!rateLimitResult.success) {
      logger.warn({ context: "createPost", action: "Rate limit exceeded" });
      return {
        success: false,
        error: `Trop de posts trop rapidement. Réessayez dans ${Math.ceil(rateLimitResult.resetAfter / 1000)}s`,
      };
    }

    // ÉTAPE 3: Validation Zod
    const validatedData = CreatePostSchema.parse({ content, image });

    // ÉTAPE 4: Créer le post
    const post = await prisma.post.create({
      data: {
        content: validatedData.content,
        image: validatedData.image,
        authorId: userId,
      },
    });

    logger.info({ context: "createPost", action: "Post created", details: { postId: post.id } });
    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    logger.error({ context: "createPost", action: "Failed", error });

    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Données invalides" };
    }

    return { success: false, error: "Erreur lors de la création du post" };
  }
}
```

#### Fonction `createComment()` - Protection identique

- Rate limiting avec `commentRateLimit` (15/10s)
- Validation Zod inline
- Vérification que le post existe
- Création + notification en transaction

---

### Exemple : [src/actions/message.action.ts](../../../src/actions/message.action.ts)

#### Fonction `sendMessage()` - Protection messagerie

```typescript
export async function sendMessage(data: {
  conversationId: string;
  content: string;
  image?: string;
}) {
  try {
    // ÉTAPE 1: Validation Zod
    const validatedData = SendMessageSchema.parse(data);

    // ÉTAPE 2: Authentification
    const userId = await getDbUserId();
    if (!userId) {
      logger.warn({ context: "sendMessage", action: "Unauthorized" });
      return { success: false, error: "Unauthorized" };
    }

    // ÉTAPE 3: RATE LIMITING ⭐ NOUVEAU
    const rateLimitResult = await checkRateLimit(
      messageRateLimit,
      userId,
      "sendMessage"
    );

    if (!rateLimitResult.success) {
      logger.warn({ context: "sendMessage", action: "Rate limit exceeded" });
      return {
        success: false,
        error: `Trop de messages trop rapidement. Réessayez dans ${Math.ceil(rateLimitResult.resetAfter / 1000)}s`,
      };
    }

    // ÉTAPE 4: Sanitisation du contenu
    const sanitizedContent = validatedData.content.trim();
    if (!sanitizedContent || sanitizedContent.length > 5000) {
      return {
        success: false,
        error: "Le message doit contenir entre 1 et 5000 caractères",
      };
    }

    // ÉTAPE 5: Vérifier que l'utilisateur est membre
    const isMember = await prisma.conversationMember.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId: validatedData.conversationId,
        },
      },
    });

    if (!isMember) {
      logger.warn({ context: "sendMessage", action: "Not a member" });
      return {
        success: false,
        error: "Vous n'êtes pas membre de cette conversation",
      };
    }

    // ÉTAPE 6: Créer le message
    const message = await prisma.message.create({
      data: {
        content: sanitizedContent,
        image: validatedData.image,
        senderId: userId,
        conversationId: validatedData.conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    // ÉTAPE 7: Temps réel avec Pusher
    await pusherServer.trigger(
      `conversation-${validatedData.conversationId}`,
      "new-message",
      message
    );

    logger.info({
      context: "sendMessage",
      action: "Message sent",
      details: { messageId: message.id },
    });

    revalidatePath(`/messages/${validatedData.conversationId}`);
    return { success: true, message };
  } catch (error) {
    logger.error({ context: "sendMessage", action: "Failed", error });

    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message };
    }

    return { success: false, error: "Erreur lors de l'envoi du message" };
  }
}
```

---

## Flux de sécurité complet

### Exemple : Création d'un post

```
1. Utilisateur soumet un formulaire
   └─> Validation côté client (React Hook Form + Zod)

2. Middleware Next.js (middleware.ts)
   ├─> Vérification authentification Clerk
   ├─> Ajout headers de sécurité (CSRF, XSS, etc.)
   └─> Routage vers Server Action

3. Server Action (post.action.ts)
   ├─> Récupération userId depuis Clerk
   ├─> RATE LIMITING (10 posts / 10s)
   │   └─> Redis check avec Upstash
   ├─> Validation Zod (CreatePostSchema)
   │   ├─> Longueur du contenu (1-5000 caractères)
   │   └─> Format de l'image (URL valide)
   ├─> Sanitisation HTML (si nécessaire)
   └─> Insertion en base de données

4. Logging (logger.ts)
   ├─> INFO si succès
   └─> WARN/ERROR si échec

5. Réponse au client
   ├─> success: true + données
   └─> success: false + message d'erreur
```

---

## Bonnes pratiques implémentées

### 1. Defense in Depth (Défense en profondeur)

Plusieurs couches de sécurité :
1. Middleware (auth + headers)
2. Rate limiting (anti-spam)
3. Validation Zod (typage strict)
4. Sanitisation (XSS)
5. Vérifications métier (autorisation)

### 2. Fail-Safe

En cas d'erreur du rate limiting :
- On laisse passer (fail-open)
- Mieux vaut un utilisateur légitime passe qu'un blocage général

### 3. Logging complet

Tous les événements de sécurité sont loggés :
- WARN pour tentatives suspectes
- ERROR pour échecs système
- INFO pour actions réussies

### 4. Messages d'erreur explicites

L'utilisateur sait exactement pourquoi sa requête est refusée :
```typescript
error: `Trop de posts trop rapidement. Réessayez dans 5s`
```

### 5. Validation stricte avec Zod

Types garantis au runtime :
- Pas de `any` dangereux
- Validation automatique
- Messages d'erreur clairs

---

## Améliorations futures

### 1. Rate Limiting avancé
- [ ] Rate limiting par IP (en plus du userId)
- [ ] Limites différentes par rôle (admin, user)
- [ ] Whitelist pour utilisateurs de confiance

### 2. CSRF Token
- [ ] Génération avec crypto.randomBytes()
- [ ] Stockage en cookie httpOnly
- [ ] Validation sur chaque mutation

### 3. Content Security Policy (CSP)
- [ ] Header CSP strict
- [ ] Nonce pour scripts inline
- [ ] Report-URI pour violations

### 4. Validation d'images avancée
- [ ] Vérification du contenu réel (magic bytes)
- [ ] Scan antivirus avec ClamAV
- [ ] Compression automatique

### 5. Audit et monitoring
- [ ] Dashboard des tentatives d'attaque
- [ ] Alertes en cas de pic de rate limit
- [ ] Statistiques de sécurité

---

## Dépendances installées

```json
{
  "@upstash/ratelimit": "^2.x.x",
  "@upstash/redis": "^1.x.x",
  "isomorphic-dompurify": "^2.x.x",
  "zod": "^3.x.x"
}
```

---

## Variables d'environnement

```env
# Redis pour Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxxx...

# Clerk (authentification)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
```

---

## Résumé

Le module de sécurité de HolbiHub offre :
- **Protection XSS** via sanitisation HTML
- **Protection spam** via rate limiting Redis
- **Protection uploads** via validation stricte
- **Protection auth** via middleware Clerk
- **Protection CSRF** via tokens et headers
- **Logging complet** pour audit et debug

Tous les points d'entrée utilisateur (posts, messages, comments, uploads) sont protégés par ces mécanismes.
