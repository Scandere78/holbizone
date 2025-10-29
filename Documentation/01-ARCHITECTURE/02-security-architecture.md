# Architecture de Sécurité - HolbiHub

## Vue d'ensemble

L'architecture de sécurité de HolbiHub repose sur une approche **Defense in Depth** (défense en profondeur) avec plusieurs couches de protection indépendantes.

---

## Schéma d'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  (Browser / Mobile)                                         │
│  - Validation côté client (React Hook Form + Zod)          │
│  - HTTPS obligatoire                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS MIDDLEWARE (Layer 1)                   │
│  [src/middleware.ts]                                        │
│  ✓ Protection des routes (Clerk Auth)                      │
│  ✓ Headers de sécurité (CSRF, XSS, Clickjacking)          │
│  ✓ Filtrage des routes publiques/privées                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVER ACTIONS (Layer 2)                       │
│  [src/actions/*.action.ts]                                  │
│                                                             │
│  1. Authentification                                        │
│     └─> getDbUserId() via Clerk                            │
│                                                             │
│  2. Rate Limiting ⭐ NOUVEAU                                │
│     └─> checkRateLimit() via Upstash Redis                 │
│                                                             │
│  3. Validation stricte                                      │
│     └─> Zod schemas                                        │
│                                                             │
│  4. Sanitisation                                            │
│     └─> DOMPurify (si HTML)                                │
│                                                             │
│  5. Vérifications métier                                    │
│     └─> Autorisations, ownership                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   UPSTASH    │  │    CLERK     │  │  UPLOADTHING │    │
│  │    REDIS     │  │     AUTH     │  │   (Images)   │    │
│  │              │  │              │  │              │    │
│  │ Rate Limit   │  │ User Auth    │  │ File Upload  │    │
│  │ Storage      │  │ Sessions     │  │ Validation   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (Prisma)                         │
│  - Data validation (Prisma schema)                         │
│  - Transactions ACID                                        │
│  - SQL injection protection (ORM)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Couches de sécurité détaillées

### Layer 1 : Middleware Next.js

**Fichier :** [src/middleware.ts](../../src/middleware.ts)

**Responsabilités :**
- Première ligne de défense
- S'exécute AVANT toute logique applicative
- Protection au niveau réseau/protocole

**Protections implémentées :**

#### A. Protection des routes (Auth)

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

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect(); // 🔒 Redirection vers /sign-in si non authentifié
  }
});
```

**Comportement :**
- Routes publiques : Accessibles à tous
- Routes privées : Authentification obligatoire
- Redirection automatique vers `/sign-in`

#### B. Headers de sécurité HTTP

| Header | Valeur | Protection contre |
|--------|--------|-------------------|
| `X-CSRF-Token` | UUID unique | Cross-Site Request Forgery |
| `X-Content-Type-Options` | `nosniff` | MIME-type sniffing attacks |
| `X-Frame-Options` | `DENY` | Clickjacking (iframe embedding) |
| `X-XSS-Protection` | `1; mode=block` | XSS attacks (browser filter) |

**Exemple d'attaque bloquée :**
```html
<!-- Attaque Clickjacking bloquée par X-Frame-Options -->
<iframe src="https://holbihub.com/profile/settings"></iframe>
<!-- ❌ Refusé par le navigateur -->
```

---

### Layer 2 : Rate Limiting (Anti-spam)

**Fichier :** [src/lib/rate-limit.ts](../../src/lib/rate-limit.ts)

**Architecture :**

```
┌──────────────┐
│ Server Action│
│ (createPost) │
└──────┬───────┘
       │
       │ 1. Appel checkRateLimit(userId)
       ▼
┌──────────────────────┐
│  checkRateLimit()    │
│  [rate-limit.ts]     │
└──────┬───────────────┘
       │
       │ 2. Requête Redis
       ▼
┌──────────────────────┐
│  UPSTASH REDIS       │
│  (Serverless)        │
│                      │
│  Key: ratelimit:post:userId123
│  Value: {count: 5, window: 1730xxx}
└──────┬───────────────┘
       │
       │ 3. Retour { success, remaining, resetAfter }
       ▼
┌──────────────────────┐
│  Server Action       │
│  - Si success: ✅    │
│  - Si blocked: ❌    │
└──────────────────────┘
```

**Configuration des limites :**

| Ressource | Limite | Fenêtre | Justification |
|-----------|--------|---------|---------------|
| Posts | 10 | 10s | Éviter spam de publications |
| Messages | 20 | 10s | Chat plus dynamique que posts |
| Commentaires | 15 | 10s | Équilibre discussion/spam |
| Likes | 50 | 10s | Action rapide légitime |
| Uploads | 5 | 60s | Protection bande passante |

**Algorithme : Sliding Window**

```
Temps (secondes) : 0    2    4    6    8    10   12   14
                   │    │    │    │    │    │    │    │
Requêtes:          █    █         █    █         █
                   ├─────────────────────┤
                        Fenêtre 10s

À t=10s: 4 requêtes dans la fenêtre ✅ (< 10)
À t=12s: 3 requêtes dans la fenêtre ✅
```

**Avantages sur Fixed Window :**
- Pas de "pic" en bordure de fenêtre
- Répartition équitable du trafic
- Plus précis

**Fail-Safe Strategy :**

```typescript
try {
  const result = await limiter.limit(identifier);
  return { success: result.success };
} catch (error) {
  logger.error({ context: "RateLimit", error });
  // ⚠️ Fail-Open : On laisse passer en cas d'erreur Redis
  return { success: true };
}
```

**Pourquoi Fail-Open ?**
- Redis indisponible = tous les utilisateurs bloqués ❌
- Mieux vaut risquer un spam temporaire que bloquer tout le site

---

### Layer 3 : Validation stricte (Zod)

**Fichiers :**
- [src/lib/validations/post.validation.ts](../../src/lib/validations/post.validation.ts)
- [src/lib/validations/message.validation.ts](../../src/lib/validations/message.validation.ts)
- [src/lib/validations/image.ts](../../src/lib/validations/image.ts)

**Architecture de validation :**

```typescript
// 1. Définition du schéma (compile-time + runtime)
export const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu ne peut pas être vide")
    .max(5000, "Le contenu ne peut pas dépasser 5000 caractères")
    .trim(),
  image: z.string().url("URL d'image invalide").optional(),
});

// 2. Inférence du type TypeScript
export type CreatePostInput = z.infer<typeof CreatePostSchema>;

// 3. Validation dans la Server Action
export async function createPost(content: string, image?: string) {
  try {
    // ✅ Validation + transformation (trim)
    const validatedData = CreatePostSchema.parse({ content, image });

    // TypeScript sait que validatedData.content est une string trimmed
    // et entre 1-5000 caractères
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Message d'erreur explicite
      return { error: error.issues[0]?.message };
    }
  }
}
```

**Avantages de Zod :**
- **Type-safety** : Types garantis au runtime
- **Messages clairs** : Erreurs explicites pour l'utilisateur
- **Transformations** : `.trim()`, `.toLowerCase()`, etc.
- **Compositions** : Réutilisation de schémas

**Protection contre :**
- Injections SQL (via typage strict)
- Buffer overflows (limites de taille)
- Données malformées

---

### Layer 4 : Sanitisation HTML (XSS)

**Fichier :** [src/lib/security.ts](../../src/lib/security.ts)

**Protection contre : Cross-Site Scripting (XSS)**

#### A. Types d'attaques XSS

**1. Stored XSS (le plus dangereux)**

```typescript
// ❌ SANS sanitisation
const post = await prisma.post.create({
  data: {
    content: '<script>alert(document.cookie)</script>', // Stocké en DB
  }
});

// Plus tard, lors de l'affichage :
<div dangerouslySetInnerHTML={{ __html: post.content }} />
// 🔥 Le script s'exécute chez tous les utilisateurs !
```

**2. Reflected XSS**

```typescript
// URL malveillante
https://holbihub.com/search?q=<script>alert('XSS')</script>

// ❌ SANS sanitisation
<div>Résultats pour : {searchQuery}</div>
```

#### B. Solution : DOMPurify

```typescript
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string): string {
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "p", "ul", "li", "ol"],
    ALLOWED_ATTR: ["href", "title", "target"],
    KEEP_CONTENT: true, // Garder le texte, supprimer juste les balises
  });
  return clean;
}
```

**Exemple de sanitisation :**

```typescript
const dirty = `
  <p>Hello</p>
  <script>alert('XSS')</script>
  <a href="javascript:alert('XSS')">Click</a>
  <img src=x onerror="alert('XSS')">
  <div onclick="alert('XSS')">Click me</div>
`;

const clean = sanitizeHtml(dirty);
// Résultat :
// <p>Hello</p>
// Click
// Click me
```

**Balises et attributs autorisés :**

| Catégorie | Éléments |
|-----------|----------|
| Texte simple | `<b>`, `<i>`, `<em>`, `<strong>` |
| Paragraphes | `<p>`, `<br>` |
| Listes | `<ul>`, `<ol>`, `<li>` |
| Liens | `<a>` (href, title, target) |

**Balises INTERDITES :**
- `<script>`, `<iframe>`, `<object>`, `<embed>`
- `<style>`, `<link>`
- Tout attribut `on*` (onclick, onerror, etc.)
- `javascript:` dans les URLs

---

### Layer 5 : Validation d'uploads (Images)

**Fichiers :**
- [src/lib/security.ts](../../src/lib/security.ts) - `validateImageUpload()`
- [src/lib/validations/image.ts](../../src/lib/validations/image.ts) - Schémas Zod

**Architecture de validation d'images :**

```
┌──────────────────┐
│  User uploads    │
│  file.jpg (15MB) │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  1. Client-side validation       │
│     - File type (extension)      │
│     - File size                  │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  2. Server Action                │
│     validateAndSanitizeImage()   │
│                                  │
│     a) Zod validation            │
│        ├─ instanceof File        │
│        ├─ size <= 10MB ✅        │
│        └─ MIME type check        │
│                                  │
│     b) Security validation       │
│        validateImageUpload()     │
│        ├─ Double-check size      │
│        └─ Verify MIME type       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  3. UploadThing (externe)        │
│     - CDN storage                │
│     - Additional security        │
│     - Optimization               │
└──────────────────────────────────┘
```

**Protection contre :**

| Attaque | Protection |
|---------|------------|
| **Upload de malware** | Type MIME strict (images uniquement) |
| **Bomb attacks (zip bomb, etc.)** | Limite de taille 10MB |
| **Denial of Service** | Rate limiting (5 uploads/60s) |
| **Path traversal** | UploadThing gère le stockage |
| **Executable déguisé** | Vérification MIME (future: magic bytes) |

**Types MIME autorisés :**

```typescript
const ALLOWED_TYPES = [
  "image/jpeg",  // .jpg, .jpeg
  "image/png",   // .png
  "image/webp",  // .webp
  "image/gif",   // .gif
];
```

**Exemple d'utilisation :**

```typescript
// Dans une Server Action
export async function uploadPostImage(file: File) {
  // Validation complète
  const validation = await validateAndSanitizeImage(file);

  if (!validation.success) {
    return { error: validation.error };
    // Exemples de messages :
    // - "Le fichier doit faire moins de 10MB"
    // - "Le format doit être JPEG, PNG, WebP ou GIF"
  }

  // Upload vers UploadThing
  const uploadedFile = await uploadFiles("imageUploader", {
    files: [validation.file],
  });

  return { success: true, url: uploadedFile[0].url };
}
```

---

## Flux de sécurité complet : Exemple "Créer un post"

### Diagramme de séquence

```
User          Client        Middleware      Server Action    Redis    Database
 │               │               │                │            │          │
 │ 1. Submit form│               │                │            │          │
 │──────────────>│               │                │            │          │
 │               │ 2. HTTPS req  │                │            │          │
 │               │──────────────>│                │            │          │
 │               │               │ 3. Check auth  │            │          │
 │               │               │ (Clerk)        │            │          │
 │               │               │                │            │          │
 │               │               │ 4. Add headers │            │          │
 │               │               │ (CSRF, XSS)    │            │          │
 │               │               │                │            │          │
 │               │               │ 5. Route to action           │          │
 │               │               │───────────────>│            │          │
 │               │               │                │            │          │
 │               │               │                │ 6. Rate    │          │
 │               │               │                │ limit check│          │
 │               │               │                │───────────>│          │
 │               │               │                │            │          │
 │               │               │                │ 7. Result  │          │
 │               │               │                │<───────────│          │
 │               │               │                │            │          │
 │               │               │                │ 8. Validate│          │
 │               │               │                │ with Zod   │          │
 │               │               │                │            │          │
 │               │               │                │ 9. Sanitize│          │
 │               │               │                │ HTML       │          │
 │               │               │                │            │          │
 │               │               │                │ 10. Insert │          │
 │               │               │                │────────────────────>│
 │               │               │                │            │          │
 │               │               │                │ 11. Return │          │
 │               │               │                │<────────────────────│
 │               │               │                │            │          │
 │               │               │ 12. Response   │            │          │
 │               │<──────────────────────────────│            │          │
 │               │               │                │            │          │
 │ 13. Display   │               │                │            │          │
 │<──────────────│               │                │            │          │
```

### Code annoté

```typescript
// src/actions/post.action.ts
export async function createPost(content: string, image?: string) {
  try {
    // ────────────────────────────────────────
    // LAYER 1: Authentification
    // ────────────────────────────────────────
    const userId = await getDbUserId(); // Via Clerk
    if (!userId) {
      logger.warn({ context: "createPost", action: "Unauthorized" });
      return { success: false, error: "Non autorisé" };
    }

    // ────────────────────────────────────────
    // LAYER 2: Rate Limiting
    // ────────────────────────────────────────
    const rateLimitResult = await checkRateLimit(
      postRateLimit,      // Limiter: 10 posts / 10s
      userId,             // Identifier unique
      "createPost"        // Context pour logging
    );

    if (!rateLimitResult.success) {
      logger.warn({
        context: "createPost",
        action: "Rate limit exceeded",
        details: {
          userId,
          resetAfter: rateLimitResult.resetAfter,
          remaining: rateLimitResult.remaining,
        },
      });
      return {
        success: false,
        error: `Trop de posts. Réessayez dans ${Math.ceil(rateLimitResult.resetAfter / 1000)}s`,
      };
    }

    // ────────────────────────────────────────
    // LAYER 3: Validation Zod
    // ────────────────────────────────────────
    const validatedData = CreatePostSchema.parse({
      content,  // Vérifie : 1-5000 caractères, trim
      image,    // Vérifie : URL valide ou undefined
    });

    // ────────────────────────────────────────
    // LAYER 4: Sanitisation (si HTML)
    // ────────────────────────────────────────
    // Note: Dans notre cas, on n'accepte que du texte brut
    // Mais si on autorisait le HTML :
    // const cleanContent = sanitizeHtml(validatedData.content);

    // ────────────────────────────────────────
    // LAYER 5: Business logic + Database
    // ────────────────────────────────────────
    const post = await prisma.post.create({
      data: {
        content: validatedData.content,
        image: validatedData.image,
        authorId: userId,
      },
    });

    // ────────────────────────────────────────
    // Logging + Cache invalidation
    // ────────────────────────────────────────
    logger.info({
      context: "createPost",
      action: "Post created successfully",
      details: { postId: post.id, authorId: userId },
    });

    revalidatePath("/"); // Invalider le cache Next.js

    return { success: true, post };

  } catch (error) {
    // ────────────────────────────────────────
    // Error Handling
    // ────────────────────────────────────────
    logger.error({
      context: "createPost",
      action: "Failed to create post",
      error,
    });

    if (error instanceof z.ZodError) {
      // Erreur de validation
      return {
        success: false,
        error: error.issues[0]?.message || "Données invalides",
      };
    }

    // Erreur générique
    return {
      success: false,
      error: "Erreur lors de la création du post",
    };
  }
}
```

---

## Matrice de menaces et protections

| Menace | Vecteur d'attaque | Protection(s) | Fichier(s) |
|--------|-------------------|---------------|------------|
| **XSS (Cross-Site Scripting)** | Injection de `<script>` dans posts/comments | `sanitizeHtml()` + Headers `X-XSS-Protection` | security.ts, middleware.ts |
| **CSRF (Cross-Site Request Forgery)** | Requêtes forgées depuis un autre site | Token CSRF + Header `X-CSRF-Token` | middleware.ts |
| **Clickjacking** | Embedding en iframe | Header `X-Frame-Options: DENY` | middleware.ts |
| **SQL Injection** | Injection SQL via inputs | Prisma ORM + Zod validation | *.validation.ts |
| **Spam / DoS** | Flood de posts/messages | Rate limiting (Redis) | rate-limit.ts |
| **Upload malveillant** | Upload de malware déguisé | MIME type check + Size limit | security.ts, image.ts |
| **Accès non autorisé** | Tentative d'accès sans auth | Clerk middleware + auth checks | middleware.ts, *.action.ts |
| **MIME sniffing** | Navigateur devine un type malveillant | Header `X-Content-Type-Options: nosniff` | middleware.ts |
| **Brute force** | Tentatives massives de login | Rate limiting (à implémenter sur /sign-in) | TODO |
| **Session hijacking** | Vol de cookies de session | Clerk (httpOnly, secure cookies) | Clerk interne |

---

## Métriques et monitoring

### Événements loggés

| Niveau | Contexte | Événements |
|--------|----------|------------|
| **INFO** | Succès | Post créé, Message envoyé, Upload réussi |
| **WARN** | Tentatives suspectes | Rate limit dépassé, Auth échouée, Upload rejeté |
| **ERROR** | Erreurs système | Redis down, DB error, Validation failed |
| **DEBUG** | Détails techniques | Rate limit check passed, Sanitization done |

### Exemples de logs

```json
{
  "level": "WARN",
  "context": "createPost",
  "action": "Rate limit exceeded",
  "details": {
    "userId": "clx123abc",
    "resetAfter": 7000,
    "remaining": 0
  },
  "timestamp": "2024-11-07T15:23:45.123Z"
}
```

```json
{
  "level": "WARN",
  "context": "Security",
  "action": "Image upload rejected - too large",
  "details": {
    "fileName": "huge-image.jpg",
    "fileSize": 15728640,
    "maxSize": 10485760
  },
  "timestamp": "2024-11-07T15:24:10.456Z"
}
```

---

## Checklist de sécurité

### Implémenté ✅

- [x] Authentification (Clerk)
- [x] Protection des routes (middleware)
- [x] Headers de sécurité HTTP
- [x] Rate limiting (posts, messages, comments, likes, uploads)
- [x] Validation stricte (Zod)
- [x] Sanitisation HTML (DOMPurify)
- [x] Validation d'uploads (type MIME + taille)
- [x] Logging de sécurité
- [x] Error handling graceful
- [x] Fail-safe strategy (fail-open pour rate limiting)

### À implémenter 🚧

- [ ] CSRF token validation (génération + vérification)
- [ ] Content Security Policy (CSP)
- [ ] Rate limiting sur /sign-in (brute force protection)
- [ ] Vérification magic bytes pour images (en plus du MIME)
- [ ] Scan antivirus des uploads (ClamAV ou VirusTotal)
- [ ] IP-based rate limiting (en plus du userId)
- [ ] WAF (Web Application Firewall) - Cloudflare
- [ ] CAPTCHA sur actions sensibles
- [ ] Audit logs pour admins
- [ ] Security headers supplémentaires (HSTS, etc.)

---

## Dépendances de sécurité

```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.x.x",        // Auth + session management
    "@upstash/ratelimit": "^2.x.x",   // Rate limiting
    "@upstash/redis": "^1.x.x",       // Redis serverless
    "isomorphic-dompurify": "^2.x.x", // HTML sanitization
    "zod": "^3.x.x"                   // Runtime validation
  }
}
```

---

## Variables d'environnement critiques

```env
# Authentification (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxxx

# Upload (UploadThing)
UPLOADTHING_SECRET=sk_xxx
UPLOADTHING_APP_ID=xxx
```

**Sécurité des variables :**
- ❌ Jamais commit dans Git
- ✅ Stockage dans .env.local (local)
- ✅ Stockage dans Vercel/Platform (production)
- ✅ Rotation régulière des secrets

---

## Références et ressources

### Standards et best practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers#security)

### Documentation des outils
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Zod](https://zod.dev/)
- [Clerk Security](https://clerk.com/docs/security)

---

## Contact et support

Pour toute question de sécurité :
- Créer une issue sur GitHub (pour questions générales)
- Email privé (pour vulnérabilités) : security@holbihub.com (TODO: à configurer)
