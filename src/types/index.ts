export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'failed';
export type Role = 'admin' | 'user';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// === From panel (canonical, DB-backed) ===

export interface Shipment {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  avatar_url: string | null;
  company: string | null;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[] | null;
  count: number;
  error: string | null;
}

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  full_name: string | null;
  avatar_url: string | null;
}

export interface ExtendedSession {
  user: SessionUser;
  expires: string;
}

// === From integrations ===

export interface ShipmentSummary {
  trackingNumber: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
}

export interface ShipmentNotification {
  trackingNumber: string;
  origin: string;
  destination: string;
  oldStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  updatedBy: string;
}

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string; title?: string };
    date: number;
    text?: string;
  };
  channel_post?: {
    message_id: number;
    chat: { id: number; type: string; title?: string };
    date: number;
    text?: string;
  };
}

export type PaymentProvider = 'stripe' | 'yookassa' | 'cryptomus';
export type Plan = 'starter' | 'pro' | 'enterprise';

export interface CheckoutParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  description?: string;
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
}

export interface WebhookEvent {
  type: string;
  id: string;
  data: Record<string, unknown>;
  raw: unknown;
}

export interface PlanConfig {
  name: string;
  price: string;
  features: string[];
  isCurrentPlan?: boolean;
  priceIds: Record<PaymentProvider, string>;
}
