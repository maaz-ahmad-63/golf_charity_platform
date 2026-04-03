// Database schema setup for Supabase
// Run these migrations in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')) DEFAULT 'monthly',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  charity_id UUID REFERENCES charities(id),
  charity_percentage INT DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Golf Scores table
CREATE TABLE golf_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charities table
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  website_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Draws table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_month DATE NOT NULL UNIQUE,
  draw_type TEXT CHECK (draw_type IN ('5-number', '4-number', '3-number')),
  winning_numbers INT[] NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  draw_logic TEXT DEFAULT 'random' CHECK (draw_logic IN ('random', 'algorithmic')),
  pool_5_total DECIMAL(10, 2) DEFAULT 0,
  pool_4_total DECIMAL(10, 2) DEFAULT 0,
  pool_3_total DECIMAL(10, 2) DEFAULT 0,
  pool_5_rollover DECIMAL(10, 2) DEFAULT 0,
  active_subscribers INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Winners table
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('5-match', '4-match', '3-match')),
  prize_amount DECIMAL(10, 2) NOT NULL,
  proof_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  payout_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charity Contributions table (for tracking voluntary donations)
CREATE TABLE charity_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  contribution_type TEXT DEFAULT 'subscription' CHECK (contribution_type IN ('subscription', 'voluntary')),
  month DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_golf_scores_user_id ON golf_scores(user_id);
CREATE INDEX idx_golf_scores_user_date ON golf_scores(user_id, score_date DESC);
CREATE INDEX idx_winners_draw_id ON winners(draw_id);
CREATE INDEX idx_winners_user_id ON winners(user_id);
CREATE INDEX idx_winners_status ON winners(verification_status, payment_status);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_charity_contributions_user_id ON charity_contributions(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (users can see their own data)
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for golf_scores
CREATE POLICY "Users can view their own scores" ON golf_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores" ON golf_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores" ON golf_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for charity_contributions
CREATE POLICY "Users can view their own contributions" ON charity_contributions
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for winners (users can view their own wins)
CREATE POLICY "Users can view their own wins" ON winners
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for draws (everyone can view published draws)
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published draws" ON draws
  FOR SELECT USING (status = 'published');

-- RLS Policies for charities (everyone can view charities)
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view charities" ON charities
  FOR SELECT USING (TRUE);
