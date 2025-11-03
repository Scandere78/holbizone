import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import prisma from '@/lib/prisma';

/**
 * ✅ TESTS D'INTÉGRATION: Follow/Unfollow Flow
 */

describe('Follow/Unfollow Flow Integration', () => {
  let user1: any;
  let user2: any;

  beforeEach(async () => {
    user1 = await prisma.user.create({
      data: {
        clerkId: 'clerk_follow_1',
        email: 'user1@example.com',
        username: `user1_${Date.now()}`,
        name: 'User 1',
      },
    });

    user2 = await prisma.user.create({
      data: {
        clerkId: 'clerk_follow_2',
        email: 'user2@example.com',
        username: `user2_${Date.now()}`,
        name: 'User 2',
      },
    });
  });

  afterEach(async () => {
    await prisma.follows.deleteMany({
      where: {
        OR: [
          { followerId: user1.id },
          { followingId: user1.id },
          { followerId: user2.id },
          { followingId: user2.id },
        ],
      },
    });
    await prisma.user.delete({ where: { id: user1.id } });
    await prisma.user.delete({ where: { id: user2.id } });
  });

  it('should follow user successfully', async () => {
    // Follow
    await prisma.follows.create({
      data: {
        followerId: user1.id,
        followingId: user2.id,
      },
    });

    // Vérifier
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: user1.id,
          followingId: user2.id,
        },
      },
    });

    expect(follow).toBeDefined();
  });

  it('should unfollow user successfully', async () => {
    // Follow
    await prisma.follows.create({
      data: {
        followerId: user1.id,
        followingId: user2.id,
      },
    });

    // Unfollow
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: user1.id,
          followingId: user2.id,
        },
      },
    });

    // Vérifier
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: user1.id,
          followingId: user2.id,
        },
      },
    });

    expect(follow).toBeNull();
  });
});