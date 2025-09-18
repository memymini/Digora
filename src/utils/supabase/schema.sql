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
  id         uuid PRIMARY KEY,
  title      text NOT NULL,
  details    text,
  status     text NOT NULL CHECK (status IN ('scheduled','ongoing','closed','archived')),
  starts_at  timestamptz NOT NULL,
  ends_at    timestamptz NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- ========== VOTE_OPTIONS ==========
CREATE TABLE vote_options (
  id             uuid PRIMARY KEY,
  vote_id        uuid NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  candidate_name text NOT NULL,
  party          text,
  image_path     text,
  position       smallint,
  UNIQUE (vote_id, position),
  UNIQUE (id, vote_id)  -- 복합 FK 타겟용
);

-- ========== VOTE_PARTICIPANTS ==========
CREATE TABLE vote_participants (
  vote_id    uuid NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alias_code text NOT NULL,
  created_at timestamptz,
  PRIMARY KEY (vote_id, user_id),
  UNIQUE (vote_id, alias_code)
);

-- ========== BALLOTS ==========
CREATE TABLE ballots (
  id         uuid PRIMARY KEY,
  vote_id    uuid NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  option_id  uuid NOT NULL,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz,
  UNIQUE (vote_id, user_id),
  -- option_id가 해당 vote의 옵션인지 강제(교차투표 방지)
  FOREIGN KEY (option_id, vote_id) REFERENCES vote_options (id, vote_id) ON DELETE CASCADE
);

-- ========== COMMENTS ==========
CREATE TABLE comments (
  id          uuid PRIMARY KEY,
  vote_id     uuid NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES comments(id) ON DELETE CASCADE,
  body        text NOT NULL,
  visibility  text NOT NULL CHECK (visibility IN ('active','hidden','deleted_by_user','deleted_by_admin')),
  badge_label text,
  likes_count integer DEFAULT 0,
  created_at  timestamptz,
  updated_at  timestamptz
);

-- ========== COMMENT_REACTIONS ==========
CREATE TABLE comment_reactions (
  id         uuid PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('like')),
  created_at timestamptz,
  UNIQUE (comment_id, user_id) -- 1인 1공감
);

-- ========== COMMENT_REPORTS ==========
CREATE TABLE comment_reports (
  id          uuid PRIMARY KEY,
  comment_id  uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason      text NOT NULL,
  status      text NOT NULL CHECK (status IN ('pending','hidden','rejected')),
  handled_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  handled_at  timestamptz,
  notes       text,
  created_at  timestamptz,
  updated_at  timestamptz
);