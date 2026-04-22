-- Cloud Agents Schema
-- This migration creates tables for managing cloud agents, their executions, and logs

-- Agents table: Stores agent definitions and configuration
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  agent_type TEXT NOT NULL, -- 'financial_transaction', 'admin_task', 'code_execution', 'data_analysis'
  code TEXT NOT NULL, -- The JavaScript/code logic for the agent
  trigger_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'scheduled', 'event'
  trigger_config JSONB, -- Configuration for triggers (cron schedule, event filters, etc)
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'archived'
  is_public BOOLEAN DEFAULT FALSE,
  max_retries INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent executions table: Tracks each agent execution
CREATE TABLE IF NOT EXISTS public.agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'success', 'failed', 'timeout'
  input JSONB, -- Input parameters passed to the agent
  output JSONB, -- Output/result from the agent
  error_message TEXT,
  error_stack TEXT,
  execution_time_ms INTEGER, -- How long the execution took in milliseconds
  retry_count INTEGER DEFAULT 0,
  queue_job_id TEXT, -- Upstash job ID for tracking
  triggered_by TEXT DEFAULT 'manual', -- 'manual', 'schedule', 'event'
  triggered_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent logs table: Detailed logs from agent execution
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES public.agent_executions(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  log_level TEXT NOT NULL, -- 'info', 'warn', 'error', 'debug'
  message TEXT NOT NULL,
  data JSONB, -- Additional structured data
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agent triggers table: Schedule configurations for agents
CREATE TABLE IF NOT EXISTS public.agent_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL, -- 'scheduled', 'event'
  cron_schedule TEXT, -- Cron expression for scheduled triggers (e.g., '0 9 * * *' for daily at 9am)
  event_type TEXT, -- Type of event to trigger on (e.g., 'transaction', 'account_created')
  event_filters JSONB, -- Filters for events
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMP,
  next_trigger_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_id ON public.agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_user_id ON public.agent_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON public.agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_created_at ON public.agent_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_execution_id ON public.agent_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id ON public.agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_triggers_agent_id ON public.agent_triggers(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_triggers_active ON public.agent_triggers(is_active);
