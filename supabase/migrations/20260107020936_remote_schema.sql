


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."check_and_increment_daily_vote"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    -- count를 조회할 변수입니다. 초기값은 0으로 설정하여 NOT FOUND 오류를 줄입니다.
    current_count integer := 0; 
    today date := CURRENT_DATE;
BEGIN
    -- 현재 사용자의 오늘 투표 횟수 조회 (LOCK 포함)
    -- count 컬럼만 INTO current_count 변수에 넣습니다.
    SELECT count
    INTO current_count
    FROM public.daily_vote_limits
    WHERE user_id = NEW.user_id AND date = today
    FOR UPDATE; -- 동시성 제어: 이 행을 잠급니다.

    IF NOT FOUND THEN
        -- **[CASE 1: 오늘 첫 투표]** 레코드가 없는 경우 (NOT FOUND)
        -- 카운트를 1로 설정하며 새로운 행을 삽입합니다.
        INSERT INTO public.daily_vote_limits (user_id, date, count)
        VALUES (NEW.user_id, today, 1);
        
    ELSIF current_count >= 100 THEN
        -- **[CASE 2: 제한 초과]** 100회 초과 시 에러 발생
        RAISE EXCEPTION 'Daily vote limit exceeded. User % has already voted 100 times today.', NEW.user_id
        USING HINT = 'Please wait until tomorrow to vote again.';
        
    ELSE
        -- **[CASE 3: 카운트 증가]** 100회 미만인 경우, 기존 레코드를 +1 증가시킵니다.
        UPDATE public.daily_vote_limits
        SET count = count + 1
        WHERE user_id = NEW.user_id AND date = today;
        
    END IF;

    -- ballots 테이블의 INSERT는 계속 진행
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_and_increment_daily_vote"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vote_comments"("p_vote_id" bigint) RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result json;
BEGIN
    SELECT json_agg(
        jsonb_build_object(
            'id', c.id,
            'content', c.body,
            'author', p.display_name,
            'badge', c.badge_label,
            'likes', c.likes_count,
            'createdAt', to_char(c.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
            'replies', (
                SELECT json_agg(
                    jsonb_build_object(
                        'id', r.id,
                        'content', r.body,
                        'author', rp.display_name,
                        'badge', r.badge_label,
                        'likes', r.likes_count,
                        'createdAt', to_char(r.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'
                    )
                ) ORDER BY r.created_at ASC)
                FROM comments r
                JOIN profiles rp ON r.user_id = rp.id
                WHERE r.parent_id = c.id AND r.visibility = 'active'
            )
        ) ORDER BY c.created_at DESC
    )
    INTO result
    FROM comments c
    JOIN profiles p ON c.user_id = p.id
    WHERE c.vote_id = p_vote_id AND c.parent_id IS NULL AND c.visibility = 'active';

    RETURN COALESCE(result, '[]'::json); -- Return empty JSON array if no comments found
END;
$$;


ALTER FUNCTION "public"."get_vote_comments"("p_vote_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vote_details"("p_vote_id" bigint) RETURNS TABLE("total_count" bigint, "options" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  total_count bigint;
  options jsonb;
BEGIN
  SELECT count(*) INTO total_count
  FROM public.ballots
  WHERE vote_id = p_vote_id;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', o.id,
      'name', o.candidate_name,
      'imageUrl', o.image_path,
      'descriptions', o.descriptions,
      'count', COALESCE(b.count, 0),
      'percent', ROUND(
        (
          COALESCE(b.count, 0)::numeric / NULLIF(total_count, 0)
        ) * 100,
        1
      )
    )
  ) INTO options
  FROM public.vote_options o
  LEFT JOIN (
    SELECT option_id, count(*) as count
    FROM public.ballots
    WHERE vote_id = p_vote_id
    GROUP BY option_id
  ) b ON o.id = b.option_id
  WHERE o.vote_id = p_vote_id;

  RETURN QUERY SELECT total_count, COALESCE(options, '[]'::jsonb);
END;$$;


ALTER FUNCTION "public"."get_vote_details"("p_vote_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vote_feed"() RETURNS TABLE("vote_id" bigint, "total_count" bigint, "title" "text", "status" "text", "ends_at" timestamp with time zone, "options" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH vote_counts AS (
        SELECT
            v.id AS vote_id,
            COUNT(b.id) AS total_votes
        FROM votes v
        LEFT JOIN ballots b ON v.id = b.vote_id
        GROUP BY v.id
    ),
    option_counts AS (
        SELECT
            vo.vote_id,
            vo.id AS option_id,
            COUNT(b.id) AS option_votes
        FROM vote_options vo
        LEFT JOIN ballots b ON vo.id = b.option_id
        GROUP BY vo.vote_id, vo.id
    )
    SELECT
        v.id AS vote_id,
        COALESCE(vc.total_votes, 0) AS total_count,
        v.title,
        v.status,
        v.ends_at,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', vo.id,
                    'name', vo.candidate_name,
                    'imageUrl', vo.image_path,
                    'count', COALESCE(oc.option_votes, 0),
                    'percent', ROUND(
                        CASE
                            WHEN COALESCE(vc.total_votes, 0) > 0 THEN
                                (COALESCE(oc.option_votes, 0)::numeric / vc.total_votes) * 100
                            ELSE 0
                        END,
                        1
                    )
                )
                ORDER BY vo.id ASC   
            )
            FROM vote_options vo
            LEFT JOIN option_counts oc ON vo.id = oc.option_id
            WHERE vo.vote_id = v.id
        ) AS options
    FROM votes v
    LEFT JOIN vote_counts vc ON v.id = vc.vote_id
    WHERE v.status = 'ongoing'
    ORDER BY total_count DESC;
END;
$$;


ALTER FUNCTION "public"."get_vote_feed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- 자동 생성 비활성화 (아무 작업도 안 함)
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_report"("p_report_id" bigint, "p_new_status" "text", "p_admin_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_report"("p_report_id" bigint, "p_new_status" "text", "p_admin_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("uid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_current_user_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_current_user_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_like"("p_comment_id" bigint, "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_reaction_exists boolean;
  v_is_liked boolean;
BEGIN
  -- Check if the user has already liked the comment
  SELECT EXISTS (
    SELECT 1
    FROM public.comment_reactions
    WHERE comment_id = p_comment_id AND user_id = p_user_id AND type = 'like'
  ) INTO v_reaction_exists;

  IF v_reaction_exists THEN
    -- User has liked, so UNLIKE
    -- 1. Delete the reaction
    DELETE FROM public.comment_reactions
    WHERE comment_id = p_comment_id AND user_id = p_user_id AND type = 'like';

    -- 2. Decrement the likes_count
    UPDATE public.comments
    SET likes_count = likes_count - 1
    WHERE id = p_comment_id;

    v_is_liked := false;
  ELSE
    -- User has not liked, so LIKE
    -- 1. Insert the reaction
    INSERT INTO public.comment_reactions (comment_id, user_id, type, created_at)
    VALUES (p_comment_id, p_user_id, 'like', now());

    -- 2. Increment the likes_count
    UPDATE public.comments
    SET likes_count = likes_count + 1
    WHERE id = p_comment_id;

    v_is_liked := true;
  END IF;

  -- Return the new liked status
  RETURN v_is_liked;
END;
$$;


ALTER FUNCTION "public"."toggle_like"("p_comment_id" bigint, "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_daily_statistics"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
         yesterday_date DATE := (NOW() - INTERVAL '1 day')::DATE;
         yesterday_start TIMESTAMPTZ := yesterday_date;
         yesterday_end TIMESTAMPTZ := yesterday_date + INTERVAL '1 day';
     BEGIN
         -- 집계 데이터 삽입
         INSERT INTO public.daily_statistics (date, daily_visitors, total_users, daily_votes, daily_comments)
        SELECT
            yesterday_date,
            -- 1. 일일 방문자 수 (로그인 사용자 우선, 아니면 IP 기준)
            COUNT(DISTINCT COALESCE(user_id::TEXT, ip_address)),
            -- 2. 누적 사용자 수
            (SELECT COUNT(*) FROM auth.users),
            -- 3. 일일 투표 수
            (SELECT COUNT(*) FROM public.votes WHERE starts_at >= yesterday_start AND starts_at < yesterday_end),
            -- 4. 일일 댓글 수
            (SELECT COUNT(*) FROM public.comments WHERE created_at >= yesterday_start AND created_at < yesterday_end)
        FROM public.visitor_logs
        WHERE visited_at >= yesterday_start AND visited_at < yesterday_end
        ON CONFLICT (date) DO UPDATE
        SET
            daily_visitors = EXCLUDED.daily_visitors,
            total_users = EXCLUDED.total_users,
            daily_votes = EXCLUDED.daily_votes,
            daily_comments = EXCLUDED.daily_comments;
    END;$$;


ALTER FUNCTION "public"."update_daily_statistics"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ballots" (
    "id" bigint NOT NULL,
    "vote_id" bigint NOT NULL,
    "option_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone
);


ALTER TABLE "public"."ballots" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."ballots_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."ballots_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."ballots_id_seq" OWNED BY "public"."ballots"."id";



CREATE TABLE IF NOT EXISTS "public"."comment_reactions" (
    "id" bigint NOT NULL,
    "comment_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone,
    CONSTRAINT "comment_reactions_type_check" CHECK (("type" = 'like'::"text"))
);


ALTER TABLE "public"."comment_reactions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comment_reactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."comment_reactions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comment_reactions_id_seq" OWNED BY "public"."comment_reactions"."id";



CREATE TABLE IF NOT EXISTS "public"."comment_reports" (
    "id" bigint NOT NULL,
    "comment_id" bigint NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "status" "text" NOT NULL,
    "handled_by" "uuid",
    "handled_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    CONSTRAINT "comment_reports_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'hidden'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."comment_reports" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comment_reports_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."comment_reports_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comment_reports_id_seq" OWNED BY "public"."comment_reports"."id";



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" bigint NOT NULL,
    "vote_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_id" bigint,
    "body" "text" NOT NULL,
    "visibility" "text" NOT NULL,
    "badge_label" "text",
    "likes_count" integer DEFAULT 0,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    CONSTRAINT "comments_visibility_check" CHECK (("visibility" = ANY (ARRAY['active'::"text", 'hidden'::"text", 'deleted_by_user'::"text", 'deleted_by_admin'::"text"])))
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."comments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comments_id_seq" OWNED BY "public"."comments"."id";



CREATE TABLE IF NOT EXISTS "public"."daily_statistics" (
    "date" "date" NOT NULL,
    "daily_visitors" bigint NOT NULL,
    "total_users" bigint NOT NULL,
    "daily_votes" bigint NOT NULL,
    "daily_comments" bigint NOT NULL
);


ALTER TABLE "public"."daily_statistics" OWNER TO "postgres";


COMMENT ON TABLE "public"."daily_statistics" IS 'Stores aggregated daily statistics for the platform.';



CREATE TABLE IF NOT EXISTS "public"."daily_vote_limits" (
    "user_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."daily_vote_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "kakao_user_id" "text",
    "display_name" "text",
    "role" "text" NOT NULL,
    "gender" "text" NOT NULL,
    "age_group" "text" NOT NULL,
    "created_at" timestamp with time zone,
    "birth_year" bigint,
    "total_votes_count" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "profiles_age_group_check" CHECK (("age_group" = ANY (ARRAY['10s'::"text", '20s'::"text", '30s'::"text", '40s'::"text", '50s'::"text", '60s_plus'::"text", 'unknown'::"text"]))),
    CONSTRAINT "profiles_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'other'::"text", 'unknown'::"text"]))),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visitor_logs" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "ip_address" "text",
    "referrer" "text",
    "visited_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."visitor_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."visitor_logs" IS 'Logs each visit to track daily unique visitors and referrers.';



ALTER TABLE "public"."visitor_logs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."visitor_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."vote_options" (
    "id" bigint NOT NULL,
    "vote_id" bigint NOT NULL,
    "candidate_name" "text" NOT NULL,
    "party" "text",
    "image_path" "text",
    "position" smallint,
    "descriptions" "text"[],
    "vote_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."vote_options" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."vote_options_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."vote_options_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."vote_options_id_seq" OWNED BY "public"."vote_options"."id";



CREATE TABLE IF NOT EXISTS "public"."vote_participants" (
    "vote_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "alias_code" "text" NOT NULL,
    "created_at" timestamp with time zone
);


ALTER TABLE "public"."vote_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "details" "text",
    "status" "text" NOT NULL,
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone NOT NULL,
    "created_by" "uuid",
    "total_votes_count" integer DEFAULT 0 NOT NULL,
    "unique_participants_count" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "votes_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'ongoing'::"text", 'closed'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."votes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."votes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."votes_id_seq" OWNED BY "public"."votes"."id";



ALTER TABLE ONLY "public"."ballots" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."ballots_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."comment_reactions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."comment_reactions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."comment_reports" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."comment_reports_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."comments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."comments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."vote_options" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."vote_options_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."votes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."votes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ballots"
    ADD CONSTRAINT "ballots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comment_reactions"
    ADD CONSTRAINT "comment_reactions_comment_id_user_id_key" UNIQUE ("comment_id", "user_id");



ALTER TABLE ONLY "public"."comment_reactions"
    ADD CONSTRAINT "comment_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comment_reports"
    ADD CONSTRAINT "comment_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_statistics"
    ADD CONSTRAINT "daily_statistics_pkey" PRIMARY KEY ("date");



ALTER TABLE ONLY "public"."daily_vote_limits"
    ADD CONSTRAINT "daily_vote_limits_pkey" PRIMARY KEY ("user_id", "date");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_kakao_user_id_key" UNIQUE ("kakao_user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visitor_logs"
    ADD CONSTRAINT "visitor_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vote_options"
    ADD CONSTRAINT "vote_options_id_vote_id_key" UNIQUE ("id", "vote_id");



ALTER TABLE ONLY "public"."vote_options"
    ADD CONSTRAINT "vote_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vote_options"
    ADD CONSTRAINT "vote_options_vote_id_position_key" UNIQUE ("vote_id", "position");



ALTER TABLE ONLY "public"."vote_participants"
    ADD CONSTRAINT "vote_participants_pkey" PRIMARY KEY ("vote_id", "user_id");



ALTER TABLE ONLY "public"."vote_participants"
    ADD CONSTRAINT "vote_participants_vote_id_alias_code_key" UNIQUE ("vote_id", "alias_code");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



CREATE INDEX "visitor_logs_user_id_idx" ON "public"."visitor_logs" USING "btree" ("user_id");



CREATE INDEX "visitor_logs_visited_at_idx" ON "public"."visitor_logs" USING "btree" ("visited_at");



CREATE OR REPLACE TRIGGER "daily_vote_limit_check" BEFORE INSERT ON "public"."ballots" FOR EACH ROW EXECUTE FUNCTION "public"."check_and_increment_daily_vote"();



ALTER TABLE ONLY "public"."ballots"
    ADD CONSTRAINT "ballots_option_id_vote_id_fkey" FOREIGN KEY ("option_id", "vote_id") REFERENCES "public"."vote_options"("id", "vote_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ballots"
    ADD CONSTRAINT "ballots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ballots"
    ADD CONSTRAINT "ballots_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "public"."votes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_reactions"
    ADD CONSTRAINT "comment_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_reactions"
    ADD CONSTRAINT "comment_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_reports"
    ADD CONSTRAINT "comment_reports_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_reports"
    ADD CONSTRAINT "comment_reports_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comment_reports"
    ADD CONSTRAINT "comment_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "public"."votes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_vote_limits"
    ADD CONSTRAINT "daily_vote_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."visitor_logs"
    ADD CONSTRAINT "visitor_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."vote_options"
    ADD CONSTRAINT "vote_options_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "public"."votes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote_participants"
    ADD CONSTRAINT "vote_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote_participants"
    ADD CONSTRAINT "vote_participants_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "public"."votes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



CREATE POLICY "Allow admin read access to daily_statistics" ON "public"."daily_statistics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admin read access to visitor_logs" ON "public"."visitor_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admin to SELECT all comments" ON "public"."comments" FOR SELECT TO "authenticated" USING ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Allow admin to manage comments" ON "public"."comments" TO "authenticated" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "Allow admin to manage reports" ON "public"."comment_reports" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow admin to manage vote options" ON "public"."vote_options" USING ("public"."is_current_user_admin"()) WITH CHECK ("public"."is_current_user_admin"());



CREATE POLICY "Allow admin to manage votes" ON "public"."votes" USING ("public"."is_current_user_admin"()) WITH CHECK ("public"."is_current_user_admin"());



CREATE POLICY "Allow authenticated users to insert votes" ON "public"."votes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to report" ON "public"."comment_reports" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "reporter_id"));



CREATE POLICY "Allow public insert to visitor_logs" ON "public"."visitor_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public read access to ballots" ON "public"."ballots" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to comment_reactions" ON "public"."comment_reactions" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to vote options" ON "public"."vote_options" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to votes" ON "public"."votes" FOR SELECT USING (true);



CREATE POLICY "Allow read access to active comments" ON "public"."comments" FOR SELECT USING (("visibility" = 'active'::"text"));



CREATE POLICY "Allow users to delete their own reaction" ON "public"."comment_reactions" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own ballot" ON "public"."ballots" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own comments" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own participation" ON "public"."vote_participants" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Allow users to insert their own reaction" ON "public"."comment_reactions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own report" ON "public"."comment_reports" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "reporter_id"));



CREATE POLICY "Allow users to update their own comments" ON "public"."comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Allow users to view their own ballot" ON "public"."ballots" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to view their own limits" ON "public"."daily_vote_limits" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to view their own participation" ON "public"."vote_participants" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."ballots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comment_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comment_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_statistics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_vote_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visitor_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vote_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vote_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."check_and_increment_daily_vote"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_and_increment_daily_vote"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_and_increment_daily_vote"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vote_comments"("p_vote_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_vote_comments"("p_vote_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vote_comments"("p_vote_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vote_details"("p_vote_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_vote_details"("p_vote_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vote_details"("p_vote_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vote_feed"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_vote_feed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vote_feed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_report"("p_report_id" bigint, "p_new_status" "text", "p_admin_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."handle_report"("p_report_id" bigint, "p_new_status" "text", "p_admin_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_report"("p_report_id" bigint, "p_new_status" "text", "p_admin_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_current_user_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_like"("p_comment_id" bigint, "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_like"("p_comment_id" bigint, "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_like"("p_comment_id" bigint, "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_daily_statistics"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_daily_statistics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_daily_statistics"() TO "service_role";
























GRANT ALL ON TABLE "public"."ballots" TO "anon";
GRANT ALL ON TABLE "public"."ballots" TO "authenticated";
GRANT ALL ON TABLE "public"."ballots" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ballots_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ballots_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ballots_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comment_reactions" TO "anon";
GRANT ALL ON TABLE "public"."comment_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_reactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comment_reactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comment_reactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comment_reactions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comment_reports" TO "anon";
GRANT ALL ON TABLE "public"."comment_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_reports" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comment_reports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comment_reports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comment_reports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."daily_statistics" TO "anon";
GRANT ALL ON TABLE "public"."daily_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_statistics" TO "service_role";



GRANT ALL ON TABLE "public"."daily_vote_limits" TO "anon";
GRANT ALL ON TABLE "public"."daily_vote_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_vote_limits" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."visitor_logs" TO "anon";
GRANT ALL ON TABLE "public"."visitor_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."visitor_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."visitor_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."visitor_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."visitor_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."vote_options" TO "anon";
GRANT ALL ON TABLE "public"."vote_options" TO "authenticated";
GRANT ALL ON TABLE "public"."vote_options" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vote_options_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vote_options_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vote_options_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."vote_participants" TO "anon";
GRANT ALL ON TABLE "public"."vote_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."vote_participants" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































