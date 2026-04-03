
// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  charity_id?: string;
  charity_percentage: number;
  created_at: string;
  updated_at: string;
}

// Subscription types
export type SubscriptionPlan = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'pending' | 'lapsed';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  amount: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

// Score related types
export interface Score {
  id: string;
  user_id: string;
  score: number;
  date_played: string;
  created_at: string;
  updated_at: string;
}

export interface GolfScore {
  id: string;
  user_id: string;
  score: number;
  score_date: string;
  created_at: string;
  updated_at: string;
}

// Draw related types
export type DrawType = '5-match' | '4-match' | '3-match';
export type DrawLogic = 'random' | 'algorithmic';

export interface Draw {
  id: string;
  month: string;
  status: 'draft' | 'simulated' | 'published';
  logic_type: DrawLogic;
  numbers_5: number[];
  numbers_4: number[];
  numbers_3: number[];
  pool_amount: number;
  pool_5_match: number;
  pool_4_match: number;
  pool_3_match: number;
  rollover_amount: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Winner related types
export type WinnerStatus = 'pending' | 'verified' | 'approved' | 'rejected' | 'paid';

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: DrawType;
  prize_amount: number;
  status: WinnerStatus;
  proof_url?: string;
  admin_notes?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// Charity related types
export interface Charity {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  website_url?: string;
  featured: boolean;
  total_raised: number;
  created_at: string;
  updated_at: string;
}

// Charity contribution tracking
export interface CharityContribution {
  id: string;
  user_id: string;
  charity_id: string;
  subscription_id: string;
  percentage: number;
  amount: number;
  created_at: string;
}

// Dashboard types
export interface UserDashboard {
  subscription: Subscription;
  scores: Score[];
  charity: Charity & { percentage: number };
  participations: Draw[];
  winnings: Winner[];
}

export interface AdminDashboard {
  total_users: number;
  active_subscriptions: number;
  total_pool: number;
  total_charity_raised: number;
  recent_winners: Winner[];
  pending_verifications: Winner[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Draw simulation response
export interface DrawSimulation {
  logic_type: DrawLogic;
  numbers_5: number[];
  numbers_4: number[];
  numbers_3: number[];
  predicted_5_match_winners: number;
  predicted_4_match_winners: number;
  predicted_3_match_winners: number;
  pool_5_match: number;
  pool_4_match: number;
  pool_3_match: number;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Dashboard Data Types
export interface UserDashboardData {
  user: User;
  subscription: Subscription | null;
  scores: GolfScore[];
  upcomingDraws: Draw[];
  winnings: Winner[];
  totalWon: number;
  charity: Charity | null;
}

// Admin Types
export interface AdminDrawConfig {
  draw_type: 'random' | 'algorithmic';
  draw_date: string;
  simulation_results?: {
    winning_numbers: number[];
    total_winners: number;
    prize_breakdown: {
      five_match: number;
      four_match: number;
      three_match: number;
    };
  };
}
