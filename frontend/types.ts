export type View = "landing" | "auth" | "coin" | "payment" | "admin" | "profile";

export interface User {
  id: number;
  username: string;
  email: string;
  token_balance: number;
  is_admin: number; // 🔥 FIX (0 | 1)
  full_name?: string;
  picture_url?: string;
  created_at?: string;
}

export interface PaymentPackage {
  id: number;
  name: string;
  tokens: number;
  amount_vnd: number;
}

export interface PaymentInvoice {
  payment_id: number;
  amount_vnd: number;
  qr_url: string;
  note: string;
}

export interface PaymentStatus {
  status: "pending" | "completed" | "failed";
  tokens: number;
}

export interface SiteSettings {
  rate_per_1000: number;
  logo_url: string;
  background_url: string;
  site_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_author: string;
  favicon_url: string;
  no_answer_fallback: string;
}
