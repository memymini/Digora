-- ========== PROFILES ==========
DROP TABLE IF EXISTS comment_reports, comment_reactions, comments, ballots, vote_participants, vote_options, votes, profiles CASCADE;

CREATE TABLE profiles (
  id           uuid PRIMARY KEY,
  kakao_user_id text UNIQUE,
  display_name  text,
  role          text NOT NULL CHECK (role IN ('user','admin')),
  gender        text NOT NULL CHECK (gender IN ('male','female','other','unknown')),
  age_group     text NOT NULL CHECK (age_group IN ('10s','20s','30s','40s','50s','60s_plus','unknown')),
  created_at    timestamptz
);

-- ========== VOTES ==========
CREATE TABLE votes (
  id         bigserial PRIMARY KEY,
  title      text NOT NULL,
  details    text,
  status     text NOT NULL CHECK (status IN ('scheduled','ongoing','closed','archived')),
  starts_at  timestamptz NOT NULL,
  ends_at    timestamptz NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- ========== VOTE_OPTIONS ==========
CREATE TABLE vote_options (
  id             bigserial PRIMARY KEY,
  vote_id        bigint NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  candidate_name text NOT NULL,
  party          text,
  image_path     text,
  position       smallint,
  UNIQUE (vote_id, position),
  UNIQUE (id, vote_id)  -- 복합 FK 타겟용
);

-- ========== VOTE_PARTICIPANTS ==========
CREATE TABLE vote_participants (
  vote_id    bigint NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alias_code text NOT NULL,
  created_at timestamptz,
  PRIMARY KEY (vote_id, user_id),
  UNIQUE (vote_id, alias_code)
);

-- ========== BALLOTS ==========
CREATE TABLE ballots (
  id         bigserial PRIMARY KEY,
  vote_id    bigint NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  option_id  bigint NOT NULL,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz,
  UNIQUE (vote_id, user_id),
  -- option_id가 해당 vote의 옵션인지 강제(교차투표 방지)
  FOREIGN KEY (option_id, vote_id) REFERENCES vote_options (id, vote_id) ON DELETE CASCADE
);

-- ========== COMMENTS ==========
CREATE TABLE comments (
  id          bigserial PRIMARY KEY,
  vote_id     bigint NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id   bigint REFERENCES comments(id) ON DELETE CASCADE,
  body        text NOT NULL,
  visibility  text NOT NULL CHECK (visibility IN ('active','hidden','deleted_by_user','deleted_by_admin')),
  badge_label text,
  likes_count integer DEFAULT 0,
  created_at  timestamptz,
  updated_at  timestamptz
);

-- ========== COMMENT_REACTIONS ==========
CREATE TABLE comment_reactions (
  id         bigserial PRIMARY KEY,
  comment_id bigint NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('like')),
  created_at timestamptz,
  UNIQUE (comment_id, user_id) -- 1인 1공감
);

-- ========== COMMENT_REPORTS ==========
CREATE TABLE comment_reports (
  id          bigserial PRIMARY KEY,
  comment_id  bigint NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason      text NOT NULL,
  status      text NOT NULL CHECK (status IN ('pending','hidden','rejected')),
  handled_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  handled_at  timestamptz,
  notes       text,
  created_at  timestamptz,
  updated_at  timestamptz
);

-- ========== RLS POLICIES ==========

-- --- Profiles ---
-- 1. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- 2. Policies
CREATE POLICY "Allow public read access to profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- --- Votes ---
-- 1. Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
-- 2. Policies
CREATE POLICY "Allow public read access to votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow admin to manage votes" ON votes FOR ALL USING (exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')) WITH CHECK (exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));


-- --- Vote Options ---
-- 1. Enable RLS
ALTER TABLE vote_options ENABLE ROW LEVEL SECURITY;
-- 2. Policies
CREATE POLICY "Allow public read access to vote options" ON vote_options FOR SELECT USING (true);
CREATE POLICY "Allow admin to manage vote options" ON vote_options FOR ALL USING (exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')) WITH CHECK (exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));


-- --- Ballots ---
-- 1. Enable RLS
ALTER TABLE ballots ENABLE ROW LEVEL SECURITY;
-- 2. Policies
CREATE POLICY "Allow users to insert their own ballot" ON ballots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to view their own ballot" ON ballots FOR SELECT USING (auth.uid() = user_id);

-- --- Comments ---
-- 1. Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- 2. Policies
CREATE POLICY "Allow read access to active comments" ON comments FOR SELECT USING (visibility = 'active');
CREATE POLICY "Allow users to insert their own comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow admin to manage comments" ON comments FOR ALL USING (exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')) WITH CHECK (exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- --- Comment Reactions ---
-- 1. Enable RLS
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
-- 2. Policies
CREATE POLICY "Allow users to insert their own reaction" ON comment_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own reaction" ON comment_reactions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Allow public read access" ON comment_reactions FOR SELECT USING (true);


-- --- Comment Reports ---
-- 1. Enable RLS
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;
-- 2. Policies
CREATE POLICY "Allow users to insert their own report" ON comment_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Allow admin to manage reports" ON comment_reports FOR ALL USING (exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')) WITH CHECK (exists(select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));


-- ========== DB FUNCTIONS ==========

CREATE OR REPLACE FUNCTION handle_report(
  p_report_id bigint,
  p_new_status text,
  p_admin_id uuid
)
RETURNS void AS $$
DECLARE
  v_comment_id bigint;
BEGIN
  -- Get the comment_id from the report
  SELECT comment_id INTO v_comment_id
  FROM public.comment_reports
  WHERE id = p_report_id;

  -- Update the report status
  UPDATE public.comment_reports
  SET
    status = p_new_status,
    handled_by = p_admin_id,
    handled_at = now()
  WHERE id = p_report_id;

  -- If the report is approved ('hidden'), hide the comment
  IF p_new_status = 'hidden' THEN
    UPDATE public.comments
    SET visibility = 'hidden'
    WHERE id = v_comment_id;
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;