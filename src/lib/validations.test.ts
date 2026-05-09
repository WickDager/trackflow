import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  shipmentSchema,
  profileSchema,
} from './validations';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      name: 'Jane',
      email: 'jane@example.com',
      password: '1234567',
      confirmPassword: '1234567',
    });
    expect(result.success).toBe(false);
  });
});

describe('shipmentSchema', () => {
  it('accepts valid shipment', () => {
    const result = shipmentSchema.safeParse({
      tracking_number: 'SADC-001',
      origin: 'Johannesburg, South Africa',
      destination: 'Harare, Zimbabwe',
      status: 'pending',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid tracking number format', () => {
    const result = shipmentSchema.safeParse({
      tracking_number: 'invalid!!!',
      origin: 'Test',
      destination: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = shipmentSchema.safeParse({
      tracking_number: 'SADC-001',
      origin: 'A',
      destination: 'B',
      status: 'nonexistent',
    });
    expect(result.success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('accepts valid profile update', () => {
    const result = profileSchema.safeParse({
      full_name: 'Jane Smith',
      company: 'Acme Corp',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty full name', () => {
    const result = profileSchema.safeParse({ full_name: '' });
    expect(result.success).toBe(false);
  });
});
