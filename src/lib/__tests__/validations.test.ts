import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * ✅ TESTS POUR LES SCHÉMAS ZOD
 */

// Schémas de test
const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'Le contenu ne peut pas être vide')
    .max(500, 'Le contenu ne peut pas dépasser 500 caractères')
    .trim(),
  image: z.string().url('URL invalide').optional(),
});

const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Le commentaire ne peut pas être vide')
    .max(300, 'Le commentaire ne peut pas dépasser 300 caractères'),
  postId: z.string().min(1, 'Post ID requis'),
});

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

/**
 * ✅ TESTS: CreatePostSchema
 */
describe('CreatePostSchema', () => {
  it('should validate a correct post', () => {
    const validPost = {
      content: 'Ceci est un post valide',
    };

    expect(() => CreatePostSchema.parse(validPost)).not.toThrow();
  });

  it('should validate a post with image', () => {
    const validPost = {
      content: 'Post avec image',
      image: 'https://example.com/image.jpg',
    };

    expect(() => CreatePostSchema.parse(validPost)).not.toThrow();
  });

  it('should reject empty content', () => {
    const invalidPost = {
      content: '',
    };

    expect(() => CreatePostSchema.parse(invalidPost)).toThrow();
  });

  it('should reject content exceeding max length', () => {
    const invalidPost = {
      content: 'a'.repeat(501),
    };

    expect(() => CreatePostSchema.parse(invalidPost)).toThrow();
  });

  it('should reject invalid image URL', () => {
    const invalidPost = {
      content: 'Post valide',
      image: 'not-a-url',
    };

    expect(() => CreatePostSchema.parse(invalidPost)).toThrow();
  });

  it('should trim whitespace', () => {
    const postWithWhitespace = {
      content: '  Texte avec espaces  ',
    };

    const result = CreatePostSchema.parse(postWithWhitespace);
    expect(result.content).toBe('Texte avec espaces');
  });
});

/**
 * ✅ TESTS: CreateCommentSchema
 */
describe('CreateCommentSchema', () => {
  it('should validate a correct comment', () => {
    const validComment = {
      content: 'Bon commentaire!',
      postId: 'post123',
    };

    expect(() => CreateCommentSchema.parse(validComment)).not.toThrow();
  });

  it('should reject empty comment', () => {
    const invalidComment = {
      content: '',
      postId: 'post123',
    };

    expect(() => CreateCommentSchema.parse(invalidComment)).toThrow();
  });

  it('should reject missing postId', () => {
    const invalidComment = {
      content: 'Commentaire',
      postId: '',
    };

    expect(() => CreateCommentSchema.parse(invalidComment)).toThrow();
  });

  it('should reject comment exceeding max length', () => {
    const invalidComment = {
      content: 'a'.repeat(301),
      postId: 'post123',
    };

    expect(() => CreateCommentSchema.parse(invalidComment)).toThrow();
  });
});

/**
 * ✅ TESTS: UpdateUserSchema
 */
describe('UpdateUserSchema', () => {
  it('should validate a correct user update', () => {
    const validUpdate = {
      username: 'newusername',
      bio: 'Ma bio',
      image: 'https://example.com/avatar.jpg',
    };

    expect(() => UpdateUserSchema.parse(validUpdate)).not.toThrow();
  });

  it('should allow partial updates', () => {
    const partialUpdate = {
      username: 'newusername',
    };

    expect(() => UpdateUserSchema.parse(partialUpdate)).not.toThrow();
  });

  it('should reject short username', () => {
    const invalidUpdate = {
      username: 'ab',
    };

    expect(() => UpdateUserSchema.parse(invalidUpdate)).toThrow();
  });

  it('should reject long username', () => {
    const invalidUpdate = {
      username: 'a'.repeat(21),
    };

    expect(() => UpdateUserSchema.parse(invalidUpdate)).toThrow();
  });

  it('should reject bio exceeding max length', () => {
    const invalidUpdate = {
      bio: 'a'.repeat(161),
    };

    expect(() => UpdateUserSchema.parse(invalidUpdate)).toThrow();
  });

  it('should reject invalid image URL', () => {
    const invalidUpdate = {
      image: 'invalid-url',
    };

    expect(() => UpdateUserSchema.parse(invalidUpdate)).toThrow();
  });

  it('should allow empty update object', () => {
    const emptyUpdate = {};

    expect(() => UpdateUserSchema.parse(emptyUpdate)).not.toThrow();
  });
});