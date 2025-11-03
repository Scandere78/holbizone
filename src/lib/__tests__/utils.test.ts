import { describe, it, expect } from 'vitest';

/**
 * ✅ TESTS POUR LES UTILITAIRES
 */

// Fonctions utilitaires à tester
function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ✅ TESTS: formatDate
 */
describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-11-03');
    const result = formatDate(date);
    expect(result).toContain('3');
    expect(result).toContain('novembre');
    expect(result).toContain('2025');
  });

  it('should handle different dates', () => {
    const date = new Date('2025-01-01');
    const result = formatDate(date);
    expect(result).toContain('1');
    expect(result).toContain('janvier');
  });
});

/**
 * ✅ TESTS: truncateText
 */
describe('truncateText', () => {
  it('should not truncate short text', () => {
    const text = 'Hello';
    expect(truncateText(text, 10)).toBe('Hello');
  });

  it('should truncate long text', () => {
    const text = 'This is a very long text';
    expect(truncateText(text, 10)).toBe('This is a ...');
  });

  it('should work with exact length', () => {
    const text = 'Hello World';
    expect(truncateText(text, 11)).toBe('Hello World');
  });

  it('should handle empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

/**
 * ✅ TESTS: slugify
 */
describe('slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('HELLO')).toBe('hello');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('should work with complex strings', () => {
    expect(slugify('My Awesome Post!')).toBe('my-awesome-post');
  });
});

/**
 * ✅ TESTS: isValidEmail
 */
describe('isValidEmail', () => {
  it('should accept valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('should accept valid email with subdomain', () => {
    expect(isValidEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('should reject email without @', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  it('should reject email without domain', () => {
    expect(isValidEmail('test@')).toBe(false);
  });

  it('should reject email without extension', () => {
    expect(isValidEmail('test@example')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('should reject email with spaces', () => {
    expect(isValidEmail('test @example.com')).toBe(false);
  });
});