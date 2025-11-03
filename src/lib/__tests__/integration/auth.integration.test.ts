import { describe, it, expect, beforeEach, vi } from 'vitest';
import prisma from '@/lib/prisma';

/**
 * ✅ TESTS D'INTÉGRATION: Auth Flow
 */

describe('Auth Flow Integration', () => {
  beforeEach(async () => {
    // Nettoyer les users de test avant chaque test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'another@example.com'],
        },
      },
    });
  });

  describe('User Creation Flow', () => {
    it('should create user successfully', async () => {
      const userData = {
        clerkId: 'clerk_test_1',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
      };

      const user = await prisma.user.create({
        data: userData,
      });

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    it('should reject duplicate username', async () => {
      const userData = {
        clerkId: 'clerk_test_2',
        email: 'test@example.com',
        username: 'existinguser',
        name: 'Test User',
      };

      // Créer le premier user
      await prisma.user.create({ data: userData });

      // Essayer de créer un user avec le même username
      expect(
        prisma.user.create({
          data: {
            clerkId: 'clerk_test_3',
            email: 'another@example.com',
            username: 'existinguser', // Duplicate!
            name: 'Another User',
          },
        })
      ).rejects.toThrow();
    });

    it('should fetch user by username', async () => {
      const userData = {
        clerkId: 'clerk_test_4',
        email: 'test@example.com',
        username: 'fetchuser',
        name: 'Fetch User',
      };

      await prisma.user.create({ data: userData });

      const user = await prisma.user.findUnique({
        where: { username: 'fetchuser' },
      });

      expect(user).toBeDefined();
      expect(user?.username).toBe('fetchuser');
    });
  });
});