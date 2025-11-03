# 🧪 MODULE 11 - TESTS UNITAIRES (VITEST)

## 📋 Vue d'ensemble

Ce module couvre l'infrastructure de tests unitaires de HolbiHub, utilisant **Vitest** comme framework de test, avec **React Testing Library** pour les composants React et **happy-dom** comme environnement de tests.

---

## 🎯 Objectifs

- ✅ **Infrastructure de tests** : Configuration complète de Vitest
- ✅ **Tests de validations** : Tests des schémas Zod
- ✅ **Tests utilitaires** : Tests des fonctions helper
- ✅ **Couverture de code** : Atteindre minimum 30% de couverture
- ✅ **Scripts NPM** : Scripts pour exécuter les tests facilement

---

## 📦 Installation

### Dépendances installées

```json
{
  "devDependencies": {
    "vitest": "^4.0.6",
    "@vitest/ui": "^4.0.6",
    "@vitest/coverage-v8": "4.0.6",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@vitejs/plugin-react": "^5.1.0",
    "happy-dom": "^20.0.10"
  }
}
```

### Commande d'installation

```bash
pnpm add -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @vitejs/plugin-react happy-dom
```

---

## ⚙️ Configuration

### 1. `vitest.config.ts`

Configuration principale de Vitest avec support React et alias de chemin.

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Points clés :**
- `globals: true` - Active les API globales (describe, it, expect)
- `environment: 'happy-dom'` - Simule le DOM pour les tests React
- `setupFiles` - Fichier de configuration exécuté avant chaque test
- `coverage` - Configuration de la couverture de code
- `alias` - Support du chemin `@/` pour les imports

### 2. `vitest.setup.ts`

Fichier de configuration global pour les tests.

```typescript
import '@testing-library/jest-dom';
```

**Rôle :** Importe les matchers supplémentaires de jest-dom (toBeInTheDocument, toHaveClass, etc.)

---

## 📜 Scripts NPM

Dans `package.json` :

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Utilisation

```bash
# Lancer les tests en mode watch
pnpm test

# Interface graphique pour les tests
pnpm test:ui

# Générer le rapport de couverture
pnpm test:coverage
```

---

## 🧪 Structure des tests

```
src/lib/__tests__/
├── validations.test.ts    # Tests des schémas Zod
└── utils.test.ts          # Tests des fonctions utilitaires
```

---

## 📝 Types de tests implémentés

### 1. Tests de validations Zod

**Fichier :** [`src/lib/__tests__/validations.test.ts`](../../../src/lib/__tests__/validations.test.ts)

#### Schémas testés

##### `CreatePostSchema`
```typescript
const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'Le contenu ne peut pas être vide')
    .max(500, 'Le contenu ne peut pas dépasser 500 caractères')
    .trim(),
  image: z.string().url('URL invalide').optional(),
});
```

**Tests :**
- ✅ Post valide
- ✅ Post avec image
- ❌ Contenu vide
- ❌ Contenu dépassant 500 caractères
- ❌ URL d'image invalide
- ✅ Trim des espaces

##### `CreateCommentSchema`
```typescript
const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Le commentaire ne peut pas être vide')
    .max(300, 'Le commentaire ne peut pas dépasser 300 caractères'),
  postId: z.string().min(1, 'Post ID requis'),
});
```

**Tests :**
- ✅ Commentaire valide
- ❌ Commentaire vide
- ❌ PostId manquant
- ❌ Commentaire dépassant 300 caractères

##### `UpdateUserSchema`
```typescript
const UpdateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Le nom d\'utilisateur doit avoir au moins 3 caractères')
    .max(20, 'Le nom d\'utilisateur ne peut pas dépasser 20 caractères')
    .optional(),
  bio: z
    .string()
    .max(160, 'La bio ne peut pas dépasser 160 caractères')
    .optional(),
  image: z.string().url('URL invalide').optional(),
});
```

**Tests :**
- ✅ Mise à jour complète valide
- ✅ Mise à jour partielle
- ❌ Username trop court (< 3 caractères)
- ❌ Username trop long (> 20 caractères)
- ❌ Bio dépassant 160 caractères
- ❌ URL d'image invalide
- ✅ Objet vide (tous les champs optionnels)

---

### 2. Tests de fonctions utilitaires

**Fichier :** [`src/lib/__tests__/utils.test.ts`](../../../src/lib/__tests__/utils.test.ts)

#### Fonctions testées

##### `formatDate(date: Date): string`
```typescript
function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

**Tests :**
- ✅ Format correct de date
- ✅ Gestion de différentes dates

##### `truncateText(text: string, length: number): string`
```typescript
function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
```

**Tests :**
- ✅ Texte court non tronqué
- ✅ Texte long tronqué avec "..."
- ✅ Texte de longueur exacte
- ✅ Chaîne vide

##### `slugify(text: string): string`
```typescript
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}
```

**Tests :**
- ✅ Conversion en minuscules
- ✅ Remplacement des espaces par des tirets
- ✅ Gestion des espaces multiples
- ✅ Suppression des caractères spéciaux
- ✅ Chaînes complexes

##### `isValidEmail(email: string): boolean`
```typescript
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**Tests :**
- ✅ Email valide
- ✅ Email avec sous-domaine
- ❌ Email sans @
- ❌ Email sans domaine
- ❌ Email sans extension
- ❌ Chaîne vide
- ❌ Email avec espaces

---

## 📊 Exemple de tests

### Test basique

```typescript
import { describe, it, expect } from 'vitest';

describe('CreatePostSchema', () => {
  it('should validate a correct post', () => {
    const validPost = {
      content: 'Ceci est un post valide',
    };

    expect(() => CreatePostSchema.parse(validPost)).not.toThrow();
  });
});
```

### Test avec assertion détaillée

```typescript
describe('truncateText', () => {
  it('should truncate long text', () => {
    const text = 'This is a very long text';
    const result = truncateText(text, 10);

    expect(result).toBe('This is a ...');
    expect(result.length).toBeLessThanOrEqual(13); // 10 + '...'
  });
});
```

### Test d'erreur

```typescript
describe('CreatePostSchema', () => {
  it('should reject empty content', () => {
    const invalidPost = {
      content: '',
    };

    expect(() => CreatePostSchema.parse(invalidPost)).toThrow();
  });
});
```

---

## 🎨 Matchers Vitest

### Matchers de base
```typescript
expect(value).toBe(expected)           // Égalité stricte (===)
expect(value).toEqual(expected)        // Égalité profonde
expect(value).toBeTruthy()             // Valeur truthy
expect(value).toBeFalsy()              // Valeur falsy
expect(value).toBeNull()               // null
expect(value).toBeUndefined()          // undefined
expect(value).toBeDefined()            // !== undefined
```

### Matchers numériques
```typescript
expect(value).toBeGreaterThan(3)
expect(value).toBeLessThan(5)
expect(value).toBeGreaterThanOrEqual(3)
expect(value).toBeLessThanOrEqual(5)
```

### Matchers de strings
```typescript
expect(str).toContain('substring')
expect(str).toMatch(/regex/)
expect(str).toHaveLength(10)
```

### Matchers d'arrays
```typescript
expect(arr).toContain(item)
expect(arr).toHaveLength(3)
expect(arr).toEqual(expect.arrayContaining([1, 2]))
```

### Matchers d'objets
```typescript
expect(obj).toHaveProperty('key')
expect(obj).toMatchObject({ key: 'value' })
```

### Matchers d'exceptions
```typescript
expect(() => fn()).toThrow()
expect(() => fn()).toThrow('Error message')
expect(() => fn()).toThrow(Error)
```

### Matchers de jest-dom
```typescript
expect(element).toBeInTheDocument()
expect(element).toHaveClass('active')
expect(element).toHaveTextContent('Hello')
expect(element).toBeVisible()
expect(input).toHaveValue('test')
```

---

## 📈 Couverture de code

### Lancer la couverture

```bash
pnpm test:coverage
```

### Rapport de couverture

La couverture génère 3 types de rapports :
- **text** : Affichage dans le terminal
- **json** : Fichier JSON pour CI/CD
- **html** : Rapport HTML interactif dans `coverage/`

### Métriques de couverture

- **Statements** : % de déclarations exécutées
- **Branches** : % de branches conditionnelles testées
- **Functions** : % de fonctions appelées
- **Lines** : % de lignes exécutées

**Objectif initial :** ≥ 30% de couverture

---

## 🚀 Bonnes pratiques

### 1. Organisation des tests

```typescript
describe('ComponentName', () => {
  describe('feature1', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = setupInput();

      // Act
      const result = performAction(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### 2. Nommage des tests

- ✅ `should validate correct post`
- ✅ `should reject empty content`
- ❌ `test1`
- ❌ `works`

### 3. Tests indépendants

Chaque test doit être isolé et ne pas dépendre d'autres tests.

```typescript
// ❌ MAUVAIS
let sharedState;

it('test 1', () => {
  sharedState = 'value';
});

it('test 2', () => {
  expect(sharedState).toBe('value'); // Dépend du test 1
});

// ✅ BON
it('test 1', () => {
  const localState = 'value';
  expect(localState).toBe('value');
});

it('test 2', () => {
  const localState = 'value';
  expect(localState).toBe('value');
});
```

### 4. Tests exhaustifs

Tester les cas :
- ✅ Cas nominal (happy path)
- ✅ Cas limites (edge cases)
- ✅ Cas d'erreur
- ✅ Valeurs nulles/undefined

---

## 🔍 Debugging des tests

### Mode watch

```bash
pnpm test
```

Vitest re-lance automatiquement les tests modifiés.

### Interface UI

```bash
pnpm test:ui
```

Interface graphique pour visualiser et débugger les tests.

### Mode debug Node.js

```json
{
  "scripts": {
    "test:debug": "vitest --inspect-brk --no-file-parallelization"
  }
}
```

Puis dans Chrome : `chrome://inspect`

---

## 📚 Ressources

### Documentation officielle
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [jest-dom matchers](https://github.com/testing-library/jest-dom)

### Guides
- [Guide des tests React](https://react.dev/learn/testing)
- [Best practices Vitest](https://vitest.dev/guide/best-practices.html)

---

## ✅ Checklist d'implémentation

- [x] Installer Vitest et dépendances
- [x] Configurer `vitest.config.ts`
- [x] Créer `vitest.setup.ts`
- [x] Créer `src/lib/__tests__/validations.test.ts`
- [x] Tests pour CreatePostSchema
- [x] Tests pour CreateCommentSchema
- [x] Tests pour UpdateUserSchema
- [x] Créer `src/lib/__tests__/utils.test.ts`
- [x] Tests pour formatDate
- [x] Tests pour truncateText
- [x] Tests pour slugify
- [x] Tests pour isValidEmail
- [x] Ajouter scripts npm test dans `package.json`
- [x] Atteindre ≥ 30% de couverture

---

## 🎯 Prochaines étapes

### Phase 2 : Tests avancés
- [ ] Tests de composants React
- [ ] Tests d'API routes
- [ ] Tests d'intégration
- [ ] Mock de Prisma
- [ ] Mock de Clerk

### Phase 3 : CI/CD
- [ ] Intégration GitHub Actions
- [ ] Badges de couverture
- [ ] Tests automatiques sur PR
- [ ] Seuils de couverture minimaux

---

## 📞 Support

Pour toute question sur les tests :
1. Consulter la [documentation Vitest](https://vitest.dev/)
2. Vérifier les exemples dans `src/lib/__tests__/`
3. Contacter l'équipe de développement

---

**Date de création :** 3 Novembre 2025
**Dernière mise à jour :** 3 Novembre 2025
**Version :** 1.0.0
