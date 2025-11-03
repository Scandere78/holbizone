import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import prisma from '@/lib/prisma';

/**
 * ✅ TESTS D'INTÉGRATION: Post Creation Flow
 */

describe('Post Creation Flow Integration', () => {
  let userId: string;
  let postId: string;

  beforeEach(async () => {
    // Créer un user de test
    const user = await prisma.user.create({
      data: {
        clerkId: 'clerk_post_1',
        email: 'postuser@example.com',
        username: `postuser_${Date.now()}`,
        name: 'Post User',
      },
    });
    userId = user.id;
  });

  afterEach(async () => {
    // Nettoyer après les tests
    await prisma.post.deleteMany({ where: { authorId: userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  it('should create post successfully', async () => {
    const post = await prisma.post.create({
      data: {
        content: 'This is a test post',
        authorId: userId,
      },
    });

    expect(post).toBeDefined();
    expect(post.content).toBe('This is a test post');
    expect(post.authorId).toBe(userId);

    postId = post.id;
  });

  it('should edit post successfully', async () => {
    // Créer un post
    const post = await prisma.post.create({
      data: {
        content: 'Original content',
        authorId: userId,
      },
    });

    // Éditer le post
    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { content: 'Updated content' },
    });

    expect(updated.content).toBe('Updated content');
  });

  it('should delete post successfully', async () => {
    // Créer un post
    const post = await prisma.post.create({
      data: {
        content: 'Post to delete',
        authorId: userId,
      },
    });

    // Supprimer
    await prisma.post.delete({ where: { id: post.id } });

    // Vérifier qu'il n'existe plus
    const deleted = await prisma.post.findUnique({
      where: { id: post.id },
    });

    expect(deleted).toBeNull();
  });

  it('should like post', async () => {
    // Créer 2 users
    const liker = await prisma.user.create({
      data: {
        clerkId: 'clerk_liker_1',
        email: 'liker@example.com',
        username: `liker_${Date.now()}`,
        name: 'Liker',
      },
    });

    // Créer un post
    const post = await prisma.post.create({
      data: {
        content: 'Likeable post',
        authorId: userId,
      },
    });

    // Like le post
    await prisma.like.create({
      data: {
        userId: liker.id,
        postId: post.id,
      },
    });

    // Vérifier
    const likes = await prisma.like.findMany({
      where: { postId: post.id },
    });

    expect(likes.length).toBe(1);

    // Cleanup
    await prisma.user.delete({ where: { id: liker.id } });
  });
});