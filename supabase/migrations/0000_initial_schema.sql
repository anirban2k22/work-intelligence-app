-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE project_status AS ENUM ('active', 'at_risk', 'on_hold', 'completed', 'archived');
CREATE TYPE relationship_type AS ENUM ('manager', 'peer', 'report', 'customer', 'vendor', 'executive', 'other');
CREATE TYPE session_status AS ENUM ('open', 'closed');
CREATE TYPE capture_source AS ENUM ('chat', 'paste', 'manual');
CREATE TYPE message_sender AS ENUM ('user', 'ai');
CREATE TYPE daily_log_status AS ENUM ('draft', 'confirmed');
CREATE TYPE entry_type AS ENUM ('meeting', 'deliverable', 'documentation', 'learning', 'bug', 'feature', 'other');
CREATE TYPE work_entry_status AS ENUM ('draft', 'confirmed', 'archived');
CREATE TYPE stakeholder_engagement AS ENUM ('led', 'participated', 'informed');
CREATE TYPE report_type AS ENUM ('daily', 'weekly', 'custom');
CREATE TYPE report_status AS ENUM ('generating', 'draft', 'ready', 'exported', 'failed');
CREATE TYPE export_format AS ENUM ('markdown', 'pdf');
CREATE TYPE template_tone AS ENUM ('formal', 'neutral', 'concise');
CREATE TYPE template_verbosity AS ENUM ('brief', 'standard', 'detailed');
CREATE TYPE notification_type AS ENUM ('insight', 'report_ready', 'reminder', 'system');
CREATE TYPE integration_provider AS ENUM ('slack', 'jira', 'google_calendar', 'outlook', 'email');
CREATE TYPE integration_status AS ENUM ('connected', 'disconnected', 'error');

-- 4.1 Users (Mirroring Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(320) NOT NULL UNIQUE,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Trigger to automatically create a public.users row when a new auth.user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4.2 Profiles
CREATE TABLE profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    display_name VARCHAR(120),
    role VARCHAR(80),
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    locale VARCHAR(10) NOT NULL DEFAULT 'en',
    avatar_url VARCHAR(2048),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to automatically create a profile when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_profile() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_public_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile();

-- 4.3 KRAs
CREATE TABLE kras (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    aliases TEXT[] NOT NULL DEFAULT '{}',
    priority SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (user_id, name)
);

-- 4.4 Projects
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    priority SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (user_id, name),
    CONSTRAINT end_date_after_start CHECK (end_date >= start_date)
);

-- 4.5 Project KRAs
CREATE TABLE project_kras (
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    kra_id BIGINT NOT NULL REFERENCES kras(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, kra_id)
);

-- 4.6 Stakeholders
CREATE TABLE stakeholders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    role VARCHAR(120),
    organization VARCHAR(160),
    relationship_type relationship_type,
    contact VARCHAR(320),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (user_id, name)
);

-- 4.7 Capture Sessions
CREATE TABLE capture_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    status session_status NOT NULL DEFAULT 'open',
    source capture_source NOT NULL DEFAULT 'chat',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ended_after_started CHECK (ended_at >= started_at)
);

-- 4.8 Capture Messages
CREATE TABLE capture_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES capture_sessions(id) ON DELETE CASCADE,
    sender message_sender NOT NULL,
    content TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (session_id, sequence)
);

-- 4.9 Daily Logs
CREATE TABLE daily_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    status daily_log_status NOT NULL DEFAULT 'draft',
    summary_ai TEXT,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, log_date)
);

-- 4.10 Work Entries
CREATE TABLE work_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_log_id BIGINT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    entry_type entry_type NOT NULL DEFAULT 'other',
    summary TEXT NOT NULL,
    details TEXT,
    kra_id BIGINT REFERENCES kras(id) ON DELETE SET NULL,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    hours NUMERIC(6,3),
    status work_entry_status NOT NULL DEFAULT 'draft',
    work_date DATE NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT false,
    config_snapshot_id UUID,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT hours_positive CHECK (hours >= 0)
);

-- 4.11 Work Entry Stakeholders
CREATE TABLE work_entry_stakeholders (
    work_entry_id BIGINT NOT NULL REFERENCES work_entries(id) ON DELETE CASCADE,
    stakeholder_id BIGINT NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
    engagement stakeholder_engagement NOT NULL DEFAULT 'participated',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (work_entry_id, stakeholder_id)
);

-- 4.12 Work Entry Sources
CREATE TABLE work_entry_sources (
    work_entry_id BIGINT NOT NULL REFERENCES work_entries(id) ON DELETE CASCADE,
    message_id BIGINT NOT NULL REFERENCES capture_messages(id) ON DELETE CASCADE,
    span_start INTEGER NOT NULL DEFAULT 0,
    span_end INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (work_entry_id, message_id),
    CONSTRAINT span_valid CHECK (span_start <= span_end)
);

-- 4.13 AI Analysis
CREATE TABLE ai_analysis (
    id BIGSERIAL PRIMARY KEY,
    work_entry_id BIGINT NOT NULL REFERENCES work_entries(id) ON DELETE CASCADE UNIQUE,
    overall_confidence NUMERIC(4,3) NOT NULL,
    field_confidence JSONB NOT NULL DEFAULT '{}',
    inferred_fields TEXT[] NOT NULL DEFAULT '{}',
    clarification_asked BOOLEAN NOT NULL DEFAULT false,
    clarification_resolution TEXT,
    model_name VARCHAR(120) NOT NULL,
    prompt_version VARCHAR(40) NOT NULL,
    config_snapshot JSONB NOT NULL DEFAULT '{}',
    latency_ms INTEGER NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT confidence_range CHECK (overall_confidence BETWEEN 0 AND 1)
);

-- 4.15 Report Templates
CREATE TABLE report_templates (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    sections JSONB NOT NULL,
    tone template_tone NOT NULL DEFAULT 'neutral',
    verbosity template_verbosity NOT NULL DEFAULT 'standard',
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (user_id, name)
);

-- 4.14 Reports
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id BIGINT REFERENCES report_templates(id) ON DELETE SET NULL,
    report_type report_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    status report_status NOT NULL DEFAULT 'generating',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    content_markdown TEXT,
    export_format export_format,
    export_url VARCHAR(2048),
    generated_by_ai BOOLEAN NOT NULL DEFAULT true,
    config_snapshot_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT report_end_after_start CHECK (end_date >= start_date)
);

-- 4.16 Notifications
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.17 Integrations
CREATE TABLE integrations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider integration_provider NOT NULL,
    external_account_id VARCHAR(255),
    credentials_ref VARCHAR(255),
    status integration_status NOT NULL DEFAULT 'connected',
    last_synced_at TIMESTAMPTZ,
    sync_config JSONB NOT NULL DEFAULT '{}',
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, provider)
);

-- 4.18 Settings
CREATE TABLE settings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    ai_preferences JSONB NOT NULL DEFAULT '{}',
    working_hours_per_week NUMERIC(5,2) NOT NULL DEFAULT 40.00,
    default_timezone_override VARCHAR(64),
    data_export_consent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT hours_positive CHECK (working_hours_per_week > 0)
);

-- Trigger to automatically create settings when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_settings() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_public_user_created_settings
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_settings();

-- 4.19 Settings Categories
CREATE TABLE settings_categories (
    id BIGSERIAL PRIMARY KEY,
    settings_id BIGINT NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    target_pct NUMERIC(5,2),
    color VARCHAR(9) NOT NULL DEFAULT '#94a3b8',
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (settings_id, name),
    CONSTRAINT target_pct_range CHECK (target_pct BETWEEN 0 AND 100)
);

-- 4.20 Insight Preferences
CREATE TABLE insight_preferences (
    id BIGSERIAL PRIMARY KEY,
    settings_id BIGINT NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
    rule_key VARCHAR(120) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    threshold JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (settings_id, rule_key)
);

-- Updated_at Trigger setup for all tables with updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_kras_updated_at BEFORE UPDATE ON kras FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON stakeholders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_capture_sessions_updated_at BEFORE UPDATE ON capture_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_work_entries_updated_at BEFORE UPDATE ON work_entries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_settings_categories_updated_at BEFORE UPDATE ON settings_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_insight_preferences_updated_at BEFORE UPDATE ON insight_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kras ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_kras ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE capture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE capture_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_entry_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_entry_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can only see/modify their own data)
CREATE POLICY "Users can manage their own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Profiles are owned by user" ON profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "KRAs are owned by user" ON kras FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Projects are owned by user" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Project KRAs inherit project ownership" ON project_kras FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = project_kras.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Stakeholders are owned by user" ON stakeholders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Sessions are owned by user" ON capture_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Messages inherit session ownership" ON capture_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM capture_sessions WHERE capture_sessions.id = capture_messages.session_id AND capture_sessions.user_id = auth.uid())
);
CREATE POLICY "Daily logs are owned by user" ON daily_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Work entries are owned by user" ON work_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Work entry stakeholders inherit entry ownership" ON work_entry_stakeholders FOR ALL USING (
  EXISTS (SELECT 1 FROM work_entries WHERE work_entries.id = work_entry_stakeholders.work_entry_id AND work_entries.user_id = auth.uid())
);
CREATE POLICY "Work entry sources inherit entry ownership" ON work_entry_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM work_entries WHERE work_entries.id = work_entry_sources.work_entry_id AND work_entries.user_id = auth.uid())
);
CREATE POLICY "AI analysis inherit entry ownership" ON ai_analysis FOR ALL USING (
  EXISTS (SELECT 1 FROM work_entries WHERE work_entries.id = ai_analysis.work_entry_id AND work_entries.user_id = auth.uid())
);
CREATE POLICY "Report templates are owned by user" ON report_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Reports are owned by user" ON reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Notifications are owned by user" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Integrations are owned by user" ON integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Settings are owned by user" ON settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Settings categories inherit settings ownership" ON settings_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM settings WHERE settings.id = settings_categories.settings_id AND settings.user_id = auth.uid())
);
CREATE POLICY "Insight preferences inherit settings ownership" ON insight_preferences FOR ALL USING (
  EXISTS (SELECT 1 FROM settings WHERE settings.id = insight_preferences.settings_id AND settings.user_id = auth.uid())
);
