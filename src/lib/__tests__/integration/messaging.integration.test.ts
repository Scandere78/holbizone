import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import prisma from '@/lib/prisma';

/**
 * ✅ TESTS D'INTÉGRATION: Messaging Flow
 */

describe('Messaging Flow Integration', () => {
  let sender: any;
  let receiver: any;
  let conversation: any;

  beforeEach(async () => {
    // Créer 2 users
    sender = await prisma.user.create({
      data: {
        clerkId: `clerk_sender_${Date.now()}`,
        email: `sender${Date.now()}@example.com`,
        username: `sender_${Date.now()}`,
        name: 'Sender',
      },
    });

    receiver = await prisma.user.create({
      data: {
        clerkId: `clerk_receiver_${Date.now()}`,
        email: `receiver${Date.now()}@example.com`,
        username: `receiver_${Date.now()}`,
        name: 'Receiver',
      },
    });

    // Créer une conversation privée (isGroup: false)
    conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        creatorId: sender.id,
        members: {
          create: [
            { userId: sender.id, role: 'admin' },
            { userId: receiver.id, role: 'member' },
          ],
        },
      },
    });
  });

  afterEach(async () => {
    // Nettoyer les messages
    await prisma.message.deleteMany({
      where: { conversationId: conversation.id },
    });

    // Nettoyer les members
    await prisma.conversationMember.deleteMany({
      where: { conversationId: conversation.id },
    });

    // Nettoyer la conversation
    await prisma.conversation.delete({
      where: { id: conversation.id },
    });

    // Nettoyer les users
    await prisma.user.delete({ where: { id: sender.id } });
    await prisma.user.delete({ where: { id: receiver.id } });
  });

  it('should send direct message', async () => {
    const message = await prisma.message.create({
      data: {
        content: 'Hello!',
        senderId: sender.id,
        conversationId: conversation.id,
      },
      include: { sender: true },
    });

    expect(message).toBeDefined();
    expect(message.content).toBe('Hello!');
    expect(message.senderId).toBe(sender.id);
    expect(message.conversationId).toBe(conversation.id);
    expect(message.sender.username).toBe(sender.username);
  });

  it('should send message with image', async () => {
    const message = await prisma.message.create({
      data: {
        content: 'Check this out!',
        image: 'https://example.com/image.jpg',
        senderId: sender.id,
        conversationId: conversation.id,
      },
    });

    expect(message.image).toBe('https://example.com/image.jpg');
  });

  it('should fetch messages in conversation', async () => {
    // Créer plusieurs messages
    await prisma.message.create({
      data: {
        content: 'Message 1',
        senderId: sender.id,
        conversationId: conversation.id,
      },
    });

    await prisma.message.create({
      data: {
        content: 'Message 2',
        senderId: receiver.id,
        conversationId: conversation.id,
      },
    });

    await prisma.message.create({
      data: {
        content: 'Message 3',
        senderId: sender.id,
        conversationId: conversation.id,
      },
    });

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });

    expect(messages.length).toBe(3);
    expect(messages[0].content).toBe('Message 1');
    expect(messages[1].content).toBe('Message 2');
    expect(messages[2].content).toBe('Message 3');
  });

  it('should get conversation with all details', async () => {
    // Ajouter un message
    await prisma.message.create({
      data: {
        content: 'Test message',
        senderId: sender.id,
        conversationId: conversation.id,
      },
    });

    const conv = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        members: {
          include: { user: true },
        },
        messages: {
          include: { sender: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    expect(conv).toBeDefined();
    expect(conv?.isGroup).toBe(false);
    expect(conv?.members.length).toBe(2);
    expect(conv?.messages.length).toBe(1);
    expect(conv?.messages[0].content).toBe('Test message');
  });

  it('should find conversations for a user', async () => {
    const userConversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: { userId: sender.id },
        },
      },
      include: {
        members: { include: { user: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    expect(userConversations.length).toBeGreaterThan(0);
    const foundConv = userConversations.find(
      (c) => c.id === conversation.id
    );
    expect(foundConv).toBeDefined();
    expect(foundConv?.members.length).toBe(2);
  });

  it('should update lastReadAt for conversation member', async () => {
    const beforeRead = new Date();

    // Ajouter un petit délai
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Update lastReadAt
    const updated = await prisma.conversationMember.update({
      where: {
        userId_conversationId: {
          userId: receiver.id,
          conversationId: conversation.id,
        },
      },
      data: { lastReadAt: new Date() },
    });

    expect(updated.lastReadAt.getTime()).toBeGreaterThan(
      beforeRead.getTime()
    );
  });

  it('should count unread messages for a user', async () => {
    // Créer des messages
    await prisma.message.create({
      data: {
        content: 'Message 1',
        senderId: sender.id,
        conversationId: conversation.id,
      },
    });

    await prisma.message.create({
      data: {
        content: 'Message 2',
        senderId: sender.id,
        conversationId: conversation.id,
      },
    });

    // Récupérer le member et voir lastReadAt
    const member = await prisma.conversationMember.findUnique({
      where: {
        userId_conversationId: {
          userId: receiver.id,
          conversationId: conversation.id,
        },
      },
    });

    // Compter les messages après lastReadAt
    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
        createdAt: { gt: member!.lastReadAt },
      },
    });

    expect(unreadMessages.length).toBe(2);
  });
});