# 🚀 ROADMAP HOLBIHUB - Deadline: 7 NOVEMBRE 2025

**Durée:** 12 jours (27 octobre - 7 novembre)
**Mode:** Sprint intensif
**Objectif:** Application production-ready avec fonctionnalités essentielles

---

## 📊 PLANNING GLOBAL

```
Semaine 1 (27-29 oct): Validation & Sécurité    [CRITIQUE]
Semaine 2 (30 oct-2 nov): Features & Tests      [IMPORTANT]
Semaine 3 (3-5 nov):   Finitions & Polish       [QUALITÉ]
Finals (6-7 nov):      Tests & Déploiement      [LAUNCH]
```

---

## ✅ RÉALISÉ (25-26 OCTOBRE)

### Samedi 25 & Dimanche 26 Octobre
- ✅ Système de messagerie (privé + groupe) implémenté
- ✅ Notifications avec badge unread
- ✅ Responsive design corrigé:
  - Variables CSS pour hauteurs de navigation
  - Hauteurs dynamiques pour mobile/desktop
  - Navigation mobile pour conversations
  - Textareas avec tailles responsives
  - Dialogs avec padding et largeur adaptive
- ✅ Structure de code améliorée et refactorisée
- ✅ Fix problèmes de transaction

**Statut:** Les fondations sont solides, prêt pour la suite!

---

## 📅 SEMAINE 1: VALIDATION & SÉCURITÉ (27-29 OCTOBRE)

### 🔴 JOUR 1 - Lundi 27 Octobre (8h) - AUJOURD'HUI
**Thème:** Validation des données avec Zod

#### Matin (4h)
- [ ] Installer et configurer Zod
  ```bash
  pnpm add zod
  ```
- [ ] Créer `src/lib/validations/post.validation.ts`
  ```typescript
  export const CreatePostSchema = z.object({
    content: z.string().min(1).max(500).trim(),
    image: z.string().url().optional(),
  });
  ```
- [ ] Créer `src/lib/validations/comment.validation.ts`
- [ ] Créer `src/lib/validations/user.validation.ts`
- [ ] Créer `src/lib/validations/message.validation.ts`

#### Après-midi (4h)
- [ ] Intégrer Zod dans `post.action.ts`
- [ ] Intégrer Zod dans `comment.action.ts`
- [ ] Intégrer Zod dans `user.action.ts`
- [ ] Intégrer Zod dans `message.action.ts`
- [ ] Ajouter messages d'erreur personnalisés
- [ ] Tester toutes les validations

**Livrables:** Validation complète sur Posts, Comments, Users, Messages

---

### 🔴 JOUR 2 - Mardi 28 Octobre (8h)
**Thème:** Gestion d'erreurs & Pages

#### Matin (4h)
- [ ] Créer `src/app/error.tsx` (Error boundary global)
  ```tsx
  'use client';
  export default function Error({ error, reset }) {
    return <div>Erreur: {error.message}</div>
  }
  ```
- [ ] Créer `src/app/not-found.tsx` (Page 404 custom)
- [ ] Créer `src/app/loading.tsx` (Skeleton global)
- [ ] Améliorer les messages d'erreur dans toasts

#### Après-midi (4h)
- [ ] Installer et configurer react-error-boundary
- [ ] Wrapper les composants critiques avec ErrorBoundary
- [ ] Ajouter try-catch dans toutes les actions serveur
- [ ] Logger les erreurs (console.error structuré)
- [ ] Créer `src/components/ErrorFallback.tsx`

**Livrables:** Gestion d'erreurs robuste + Pages d'erreur

---

### 🔴 JOUR 3 - Mercredi 29 Octobre (8h)
**Thème:** Sécurité & Rate Limiting

#### Matin (4h)
- [ ] Installer `@upstash/ratelimit` et `@upstash/redis`
  ```bash
  pnpm add @upstash/ratelimit @upstash/redis
  ```
- [ ] Créer compte Upstash Redis (gratuit)
- [ ] Configurer `src/lib/rate-limit.ts`
  ```typescript
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";

  export const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
  });
  ```
- [ ] Appliquer rate limit sur createPost
- [ ] Appliquer rate limit sur sendMessage
- [ ] Appliquer rate limit sur createComment

#### Après-midi (4h)
- [ ] Sanitiser le contenu HTML avec `dompurify`
  ```bash
  pnpm add isomorphic-dompurify
  ```
- [ ] Ajouter headers de sécurité dans `next.config.mjs`
  ```javascript
  headers: async () => [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
    ],
  }],
  ```
- [ ] Configurer CSP (Content Security Policy)
- [ ] Valider les uploads d'images (taille, type)
- [ ] Ajouter CSRF protection

**Livrables:** Sécurité renforcée + Rate limiting

---

## 📅 SEMAINE 2: FEATURES ESSENTIELLES (30 OCTOBRE - 2 NOVEMBRE)

### 🟠 JOUR 4 - Jeudi 30 Octobre (8h)
**Thème:** Pagination & Performance

#### Matin (4h)
- [ ] Créer `src/lib/utils/pagination.ts`
  ```typescript
  export const ITEMS_PER_PAGE = 20;
  export function getPaginationParams(page: number) {
    return { skip: (page - 1) * ITEMS_PER_PAGE, take: ITEMS_PER_PAGE };
  }
  ```
- [ ] Ajouter pagination à `getPosts()` dans `post.action.ts`
- [ ] Ajouter pagination à `getUserPosts()`
- [ ] Créer composant `<Pagination />` réutilisable

#### Après-midi (4h)
- [ ] Implémenter infinite scroll sur feed principal
  ```typescript
  import { useInView } from 'react-intersection-observer';
  ```
- [ ] Pagination des commentaires (load more)
- [ ] Pagination des notifications
- [ ] Pagination des conversations
- [ ] Tester performance avec données de test

**Livrables:** Pagination complète + Infinite scroll

---

### 🟠 JOUR 5 - Vendredi 31 Octobre (8h)
**Thème:** Édition de contenu

#### Matin (4h)
- [ ] Créer `editPost()` action dans `post.action.ts`
  ```typescript
  export async function editPost(postId: string, data: { content: string }) {
    // Vérifier ownership
    // Valider avec Zod
    // Update
  }
  ```
- [ ] Ajouter bouton "Éditer" sur PostCard (menu dropdown)
- [ ] Créer modal d'édition `<EditPostDialog />`
- [ ] Gérer l'état d'édition (isEditing)

#### Après-midi (4h)
- [ ] Créer `editComment()` action
- [ ] Créer `deleteComment()` action
- [ ] Ajouter boutons sur CommentCard
- [ ] Modal de confirmation pour suppression
- [ ] Tester édition/suppression

**Livrables:** Édition de posts et commentaires

---

### 🟠 JOUR 6 - Samedi 1er Novembre (10h - Weekend boost!)
**Thème:** Recherche globale

#### Matin (5h)
- [ ] Créer `src/actions/search.action.ts`
  ```typescript
  export async function searchUsers(query: string) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 10,
    });
  }

  export async function searchPosts(query: string) {
    return await prisma.post.findMany({
      where: { content: { contains: query, mode: 'insensitive' } },
      take: 20,
    });
  }
  ```
- [ ] Créer page `src/app/search/page.tsx`
- [ ] Créer composant `<SearchBar />` dans Navbar

#### Après-midi (5h)
- [ ] Créer `<SearchResults />` avec tabs (Users/Posts)
- [ ] Implémenter debounce sur recherche (500ms)
  ```typescript
  import { useDebouncedCallback } from 'use-debounce';
  ```
- [ ] Ajouter loading states
- [ ] Ajouter état vide (no results)
- [ ] Tester recherche

**Livrables:** Recherche fonctionnelle (users + posts)

---

### 🟠 JOUR 7 - Dimanche 2 Novembre (10h - Weekend boost!)
**Thème:** Features sociales avancées

#### Matin (5h)
- [ ] Créer système de bookmark (save posts)
  - Migration Prisma: `model Bookmark`
  - Action `toggleBookmark()`
  - Page `/bookmarks`
- [ ] Ajouter bouton bookmark sur PostCard
- [ ] Créer page "Posts sauvegardés"

#### Après-midi (5h)
- [ ] Implémenter blocage d'utilisateurs
  - Migration: `model Block`
  - Action `blockUser()` et `unblockUser()`
  - Filtrer posts/comments des bloqués
- [ ] Ajouter option "Bloquer" dans menu utilisateur
- [ ] Page "Utilisateurs bloqués" dans settings
- [ ] Créer `src/app/settings/blocked/page.tsx`

**Livrables:** Bookmarks + Blocage

---

---

## 📅 SEMAINE 3: FINITIONS (3-5 NOVEMBRE)

### 🟡 JOUR 8 - Lundi 3 Novembre (8h)
**Thème:** Tests unitaires (Base)

#### Matin (4h)
- [ ] Installer Vitest
  ```bash
  pnpm add -D vitest @testing-library/react @testing-library/jest-dom
  ```
- [ ] Configurer `vitest.config.ts`
- [ ] Créer `src/lib/__tests__/utils.test.ts`
- [ ] Tests pour validations Zod
  ```typescript
  describe('CreatePostSchema', () => {
    it('should validate correct post', () => {
      expect(CreatePostSchema.parse({
        content: 'Test post'
      })).toBeDefined();
    });
  });
  ```

#### Après-midi (4h)
- [ ] Tests pour `src/lib/utils.ts` (formatDate, etc.)
- [ ] Tests pour composants utilitaires
- [ ] Créer scripts npm test dans `package.json`
- [ ] Atteindre 30% de couverture minimum

**Livrables:** Infrastructure de tests + tests basiques

### 🟡 JOUR 9 - Mardi 4 Novembre (8h)
**Thème:** Admin & Modération

#### Matin (4h)
- [ ] Créer rôle admin dans Prisma
  ```prisma
  model User {
    role String @default("user") // "user" | "admin"
  }
  ```
- [ ] Migration + mise à jour du modèle
- [ ] Créer middleware `src/middleware/admin.ts`
- [ ] Page `src/app/admin/page.tsx` (dashboard basique)

#### Après-midi (4h)
- [ ] Système de signalement
  - Migration: `model Report`
  - Action `reportPost()`, `reportUser()`
  - Bouton "Signaler" dans menus
- [ ] Page admin: liste des signalements
- [ ] Actions admin: supprimer post, suspendre user
- [ ] Protéger routes admin avec middleware

**Livrables:** Panel admin basique + Signalements

---

### 🟡 JOUR 10 - Mercredi 5 Novembre (8h)
**Thème:** UX & Polish

#### Matin (4h)
- [ ] Améliorer loading states (skeletons partout)
- [ ] Créer `<PostSkeleton />`, `<UserSkeleton />`
- [ ] Optimiser images (next/image everywhere)
- [ ] Ajouter animations subtiles (framer-motion)
  ```bash
  pnpm add framer-motion
  ```
- [ ] Transitions entre pages

#### Après-midi (4h)
- [ ] Améliorer messages d'erreur utilisateur
- [ ] Ajouter confirmations pour actions critiques
- [ ] Optimiser mobile (touches finales)
- [ ] Améliorer accessibilité (aria-labels)
- [ ] Tester sur différents navigateurs

**Livrables:** UX polie et professionnelle

---

---

## 📅 FINAL WEEK: TESTS & DEPLOY (6-7 NOVEMBRE)

### 🟢 JOUR 11 - Jeudi 6 Novembre (8h)
**Thème:** Tests d'intégration & Performance

#### Matin (4h)
- [ ] Tests d'intégration pour auth flow
- [ ] Tests pour post creation flow
- [ ] Tests pour messaging flow
- [ ] Tests pour follow/unfollow

#### Après-midi (4h)
- [ ] Analyser bundle size & optimiser
  ```bash
  pnpm build && pnpm analyze
  ```
- [ ] Code splitting (dynamic imports)
- [ ] Optimiser requêtes Prisma (select only needed)
- [ ] Profiler performance avec Lighthouse
- [ ] Score Lighthouse > 85

**Livrables:** Tests d'intégration + Performance optimisée

---

### 🚀 JOUR 12 - Vendredi 7 Novembre (12h) - JOUR J
**Thème:** QA Final & LANCEMENT

#### Matin (6h - Setup & QA intensif)
- [ ] Tests manuels complets (checklist)
  - [ ] Signup/Login
  - [ ] Create/Edit/Delete posts
  - [ ] Like/Comment
  - [ ] Follow/Unfollow
  - [ ] Messages
  - [ ] Notifications
  - [ ] Search
  - [ ] Profile edit
  - [ ] Bookmarks
  - [ ] Block users
  - [ ] Admin panel
- [ ] Tester sur mobile (iOS + Android)
- [ ] Tester sur différents navigateurs
- [ ] Corriger bugs critiques

#### Après-midi (6h - DÉPLOIEMENT & LAUNCH)
- [ ] Configurer Vercel & database production (Neon/Supabase)
- [ ] Setup Redis production (Upstash)
- [ ] Setup Pusher & UploadThing production
- [ ] Déploiement production final
- [ ] Vérification post-déploiement complète:
  - [ ] Auth fonctionne
  - [ ] Uploads fonctionnent
  - [ ] Messages temps réel OK
  - [ ] Notifications OK
  - [ ] Performance acceptable
- [ ] Setup monitoring (Sentry) & analytics
- [ ] Documentation finale
- [ ] Célébrer ! 🎉

**Livrables:** 🎉 APPLICATION EN PRODUCTION AVANT MINUIT LE 7 NOVEMBRE ✅

---

## 📋 CHECKLIST PRÉ-LANCEMENT

### Fonctionnalités Core ✅
- [ ] Auth (Signup/Login/Logout)
- [ ] Posts (Create/Read/Edit/Delete)
- [ ] Comments (Create/Read/Edit/Delete)
- [ ] Likes
- [ ] Follow/Unfollow
- [ ] Messages privés + groupes
- [ ] Notifications
- [ ] Profil (View/Edit)
- [ ] Upload images
- [ ] Recherche (Users + Posts)
- [ ] Bookmarks
- [ ] Block users

### Sécurité ✅
- [ ] Validation Zod sur toutes inputs
- [ ] Rate limiting
- [ ] Sanitisation HTML
- [ ] Headers sécurité
- [ ] HTTPS
- [ ] Protection CSRF

### Performance ✅
- [ ] Pagination partout
- [ ] Code splitting
- [ ] Images optimisées
- [ ] Bundle size < 1MB
- [ ] Lighthouse score > 85

### Qualité ✅
- [ ] Tests unitaires (30%+ coverage)
- [ ] Tests d'intégration
- [ ] Error handling
- [ ] Loading states
- [ ] Error boundaries
- [ ] Responsive mobile

### Admin ✅
- [ ] Panel admin
- [ ] Système de signalement
- [ ] Modération posts
- [ ] Gestion users

### DevOps ✅
- [ ] Déployé sur Vercel/autre
- [ ] Database production
- [ ] Monitoring/Logging
- [ ] Backups configurés
- [ ] Documentation

---

## 🎯 SCOPE FLEXIBLE (Si pas le temps)

### Must Have (Priorité 1)
- Validation Zod ⭐⭐⭐
- Pagination ⭐⭐⭐
- Gestion erreurs ⭐⭐⭐
- Rate limiting ⭐⭐⭐
- Édition posts ⭐⭐⭐

### Should Have (Priorité 2)
- Recherche ⭐⭐
- Bookmarks ⭐⭐
- Tests basiques ⭐⭐
- Admin panel ⭐⭐

### Nice to Have (Priorité 3 - Coupable si manque de temps)
- Block users ⭐
- Tests intégration ⭐
- Animations ⭐
- Analytics ⭐

---

## 💡 CONSEILS POUR RÉUSSIR

### Organisation
1. **Commencer TÔT chaque jour** (8h00)
2. **Travailler par blocs de 2h** avec pauses
3. **Commiter souvent** (au moins 3x/jour)
4. **Tester en continu**, pas à la fin

### Productivité
- **Éliminer distractions** (mode avion pendant focus time)
- **Timer Pomodoro** (25min work / 5min break)
- **Weekend boost** (10h au lieu de 8h)
- **Pas de perfectionnisme** - Done > Perfect

### Priorités
- **Si en retard:** Couper les "Nice to Have"
- **Toujours privilégier:** Sécurité > Features
- **MVP mindset:** Shipping > Polish

### Collaboration (si équipe)
- **Daily standup** 10min chaque matin
- **Code review** rapide entre pairs
- **Pair programming** sur bugs difficiles

---

## 📊 MÉTRIQUES DE SUCCÈS

### Au 7 novembre, l'app doit avoir:
- ✅ 0 bugs critiques
- ✅ Toutes features core fonctionnelles
- ✅ Sécurité validée (rate limit + validation)
- ✅ Performance acceptable (Lighthouse > 80)
- ✅ Déployée et accessible publiquement
- ✅ Documentation basique

### Bonus si temps:
- ✅ Tests > 50% coverage
- ✅ Admin panel complet
- ✅ Analytics intégrés

---

## 🆘 PLAN B (Si grosse urgence)

### Si vous perdez 2-3 jours:
**COUPER:**
- Block users
- Bookmarks
- Admin panel (juste modération manuelle)
- Tests d'intégration
- Animations

**GARDER ABSOLUMENT:**
- Validation Zod
- Pagination
- Gestion erreurs
- Rate limiting
- Édition posts
- Recherche basique

---

## 📞 SUPPORT & RESSOURCES

### Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Zod: https://zod.dev
- Clerk: https://clerk.com/docs

### Aide rapide
- Stack Overflow
- GitHub Issues
- Discord de chaque lib
- ChatGPT/Claude pour debug

---

## 📆 CALENDRIER RÉCAPITULATIF

| Jour | Date | Type | Heures | Thème Principal |
|------|------|------|--------|-----------------|
| ✅ | Sam 25 Oct | Weekend | 10h | Messaging + Notifications |
| ✅ | Dim 26 Oct | Weekend | 10h | Responsive fixes |
| 1 | **Lun 27 Oct** | **Semaine** | **8h** | **Validation Zod** ⬅️ AUJOURD'HUI |
| 2 | Mar 28 Oct | Semaine | 8h | Gestion erreurs |
| 3 | Mer 29 Oct | Semaine | 8h | Rate limiting |
| 4 | Jeu 30 Oct | Semaine | 8h | Pagination |
| 5 | Ven 31 Oct | Semaine | 8h | Édition posts |
| 6 | Sam 1 Nov | Weekend | 10h | Recherche |
| 7 | Dim 2 Nov | Weekend | 10h | Bookmarks |
| 8 | Lun 3 Nov | Semaine | 8h | Tests unitaires |
| 9 | Mar 4 Nov | Semaine | 8h | Admin panel |
| 10 | Mer 5 Nov | Semaine | 8h | UX Polish |
| 11 | Jeu 6 Nov | Semaine | 8h | Tests & Performance |
| **12** | **Ven 7 Nov** | **LAUNCH** | **12h** | **QA & DÉPLOIEMENT** |

**TOTAL: 116 heures sur 12 jours (20h déjà réalisées!)**

---

**DÉBUT EFFECTIF: Lundi 27 octobre 2025**
**FIN: Vendredi 7 novembre 2025**
**DEADLINE FERME: 23h59 le 7 novembre**

**Excellente progression ! 20h de travail déjà effectué, 12 jours pour finaliser ! 💪🚀**
