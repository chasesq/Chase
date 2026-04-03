-- Advanced Banking Features Schema
-- This script creates tables for notifications, spending analytics, transfer templates, bills, and reports

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('transaction', 'security', 'promotion', 'billing', 'general')),
  category VARCHAR(100),
  icon VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  action_label VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  transaction_alerts BOOLEAN DEFAULT TRUE,
  security_alerts BOOLEAN DEFAULT TRUE,
  promotional BOOLEAN DEFAULT TRUE,
  billing_reminders BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Spending Analytics Cache
CREATE TABLE IF NOT EXISTS spending_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  average_transaction DECIMAL(12, 2) DEFAULT 0,
  budget_limit DECIMAL(12, 2),
  percent_of_budget DECIMAL(5, 2),
  trend_change DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_month, period_year, category)
);

CREATE INDEX idx_spending_analytics_user_id ON spending_analytics(user_id);
CREATE INDEX idx_spending_analytics_period ON spending_analytics(user_id, period_year, period_month);

-- Money Transfer Templates
CREATE TABLE IF NOT EXISTS transfer_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_account VARCHAR(50) NOT NULL,
  recipient_routing_number VARCHAR(20),
  recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('internal', 'external', 'wire')),
  category VARCHAR(100),
  is_favorite BOOLEAN DEFAULT FALSE,
  default_amount DECIMAL(12, 2),
  memo_template VARCHAR(500),
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transfer_templates_user_id ON transfer_templates(user_id);
CREATE INDEX idx_transfer_templates_favorite ON transfer_templates(user_id, is_favorite);

-- Bill Payments
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payee_name VARCHAR(255) NOT NULL,
  payee_account VARCHAR(50),
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  frequency VARCHAR(50) CHECK (frequency IN ('once', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paid', 'overdue', 'canceled')),
  reminder_days_before INTEGER DEFAULT 3,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_bills_due_date ON bills(user_id, due_date);
CREATE INDEX idx_bills_status ON bills(user_id, status);

-- Bill Payment History
CREATE TABLE IF NOT EXISTS bill_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmation_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bill_payments_bill_id ON bill_payments(bill_id);
CREATE INDEX idx_bill_payments_user_id ON bill_payments(user_id);

-- Generated Reports
CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL CHECK (report_type IN ('transaction_history', 'spending_summary', 'tax_summary', 'annual_summary')),
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  file_url VARCHAR(500),
  file_format VARCHAR(20) CHECK (file_format IN ('pdf', 'csv')),
  file_size INTEGER,
  status VARCHAR(50) DEFAULT 'generated' CHECK (status IN ('pending', 'generated', 'failed')),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_generated_reports_user_id ON generated_reports(user_id);
CREATE INDEX idx_generated_reports_created_at ON generated_reports(user_id, created_at DESC);

-- Report Scheduling
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  frequency VARCHAR(50) CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  send_email BOOLEAN DEFAULT TRUE,
  email_address VARCHAR(255),
  enabled BOOLEAN DEFAULT TRUE,
  next_generation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_report_schedules_user_id ON report_schedules(user_id);

-- Transaction Category Mappings (for spending analytics)
CREATE TABLE IF NOT EXISTS transaction_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  confidence_score DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transaction_categories_user_id ON transaction_categories(user_id);

-- Enable Row-Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY notifications_user_policy ON notifications FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY notification_preferences_user_policy ON notification_preferences FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY spending_analytics_user_policy ON spending_analytics FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY transfer_templates_user_policy ON transfer_templates FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY bills_user_policy ON bills FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY bill_payments_user_policy ON bill_payments FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY generated_reports_user_policy ON generated_reports FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY report_schedules_user_policy ON report_schedules FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY transaction_categories_user_policy ON transaction_categories FOR ALL TO authenticated USING (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_bills_next_due ON bills(user_id, due_date) WHERE status != 'canceled';
CREATE INDEX idx_spending_analytics_latest ON spending_analytics(user_id, period_year DESC, period_month DESC);
