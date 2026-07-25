/**
 * Shared Type Definitions for the AI Agency Platform
 */

export interface BusinessConfig {
  id: string;
  name: string;
  type: 'clinic' | 'restaurant' | 'cafe' | 'service' | 'pharmacy';
  iconName: string;
  systemPrompt: string;
  welcomeMessage: string;
  welcomeMessageEnabled?: boolean;
  services: string[];
  inventoryUrl?: string;
  inventoryType?: 'google_sheets' | 'excel';
  inventoryData?: any[];
  workingHours: string;
  phonePlaceholder: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionExpiry?: string;
  aiResponseCount?: number;
  aiResponseLimit?: number;
  quickReplies?: QuickReply[];
  googleSheetsId?: string;
  googleSheetsAccessToken?: string;
  googleSheetsLinked?: boolean;
  whatsappSenderNumber?: string;
  instagramAccountId?: string;
  instagramAccessToken?: string;
  facebookPageId?: string;
  facebookAccessToken?: string;
  telegramBotToken?: string;
  telegramLinked?: boolean;
  autoPilotEnabled?: boolean;
  generateInvoiceEnabled?: boolean;
}

export interface QuickReply {
  id: string;
  question: string;
  answer: string;
}

export interface Booking {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  notes?: string;
  reminderSent?: boolean;
}

export interface Complaint {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  category: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'open' | 'reviewing' | 'resolved';
  createdAt: string;
  aiResponseDraft: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing' | 'system';
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'webhook_verification' | 'billing';
  event: string;
  payload: any;
  businessId?: string;
  status?: 'success' | 'failed';
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  text: string;
  timestamp: string;
  isActionTriggered?: boolean;
  actionDetails?: string;
  actionType?: string;
}

export interface Plan {
  id: 'trial' | 'growth' | 'enterprise';
  name: string;
  priceMonthly: number | string;
  priceYearly: number | string;
  period: string;
  desc: string;
  features: string[];
  limits: {
    messages: number;
    channels: number;
    hasComplaints: boolean;
    hasAutomation: boolean;
  };
}

export interface ActivationCode {
  id: string;
  code: string;
  planId: string;
  isUsed: boolean;
  createdAt: string;
  usedAt?: string;
  usedBy?: string;
}
