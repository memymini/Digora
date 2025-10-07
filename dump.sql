


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






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
    AS $$
DECLARE
    v_total_count bigint;
    v_options jsonb;
BEGIN
    SELECT count(*) INTO v_total_count
    FROM public.ballots
    WHERE vote_id = p_vote_id;

    SELECT jsonb_agg(
        jsonb_build_object(
            'id', o.id,
            'name', o.candidate_name,
            'imageUrl', o.image_path,
            'count', COALESCE(b.count, 0),
            'percent', CASE WHEN v_total_count > 0 THEN (COALESCE(b.count, 0)::float / v_total_count) * 100 ELSE 0 END
        )
    ) INTO v_options
    FROM public.vote_options o
    LEFT JOIN (
        SELECT option_id, count(*) as count
        FROM public.ballots
        WHERE vote_id = p_vote_id
        GROUP BY option_id
    ) b ON o.id = b.option_id
    WHERE o.vote_id = p_vote_id;

    RETURN QUERY
    SELECT v_total_count, COALESCE(v_options, '[]'::jsonb);
END;
$$;


ALTER FUNCTION "public"."get_vote_details"("p_vote_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vote_feed"() RETURNS TABLE("voteId" bigint, "totalCount" bigint, "title" "text", "candidates" json)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH vote_counts AS (
        -- 각 투표별 총 투표수 계산
        SELECT
            v.id AS vote_id,
            COUNT(b.id) AS total_votes
        FROM votes v
        LEFT JOIN ballots b ON v.id = b.vote_id
        GROUP BY v.id
    ),
    option_counts AS (
        -- 각 후보별 득표수 계산
        SELECT
            vo.vote_id,
            vo.id AS option_id,
            COUNT(b.id) AS option_votes
        FROM vote_options vo
        LEFT JOIN ballots b ON vo.id = b.option_id
        GROUP BY vo.vote_id, vo.id
    )
    -- 최종 결과 조합
    SELECT
        v.id AS "voteId",
        COALESCE(vc.total_votes, 0) AS "totalCount",
        v.title,
        (
            -- 후보자 정보를 JSON 배열로 만듦
            SELECT json_agg(
                json_build_object(
                    'name', vo.candidate_name,
                    'imageUrl', vo.image_path,
                    'count', COALESCE(oc.option_votes, 0),
                    'percent', CASE
                                 WHEN vc.total_votes > 0 THEN (COALESCE(oc.option_votes, 0) * 100.0 / vc.total_votes)
                                 ELSE 0
                               END
                )
            )
            FROM vote_options vo
            LEFT JOIN option_counts oc ON vo.id = oc.option_id
            WHERE vo.vote_id = v.id
        ) AS candidates
    FROM votes v
    LEFT JOIN vote_counts vc ON v.id = vc.vote_id
    -- 'ongoing' 상태인 투표만 가져오도록 필터링 (필요에 따라 변경 가능)
    WHERE v.status = 'ongoing'
    ORDER BY "totalCount" DESC;
END;
$$;


ALTER FUNCTION "public"."get_vote_feed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role, gender, age_group)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Digora User'),
    'user',
    'unknown',
    'unknown'
  );
  RETURN new;
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



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "kakao_user_id" "text",
    "display_name" "text",
    "role" "text" NOT NULL,
    "gender" "text" NOT NULL,
    "age_group" "text" NOT NULL,
    "created_at" timestamp with time zone,
    CONSTRAINT "profiles_age_group_check" CHECK (("age_group" = ANY (ARRAY['10s'::"text", '20s'::"text", '30s'::"text", '40s'::"text", '50s'::"text", '60s_plus'::"text", 'unknown'::"text"]))),
    CONSTRAINT "profiles_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'other'::"text", 'unknown'::"text"]))),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vote_options" (
    "id" bigint NOT NULL,
    "vote_id" bigint NOT NULL,
    "candidate_name" "text" NOT NULL,
    "party" "text",
    "image_path" "text",
    "position" smallint
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



ALTER TABLE ONLY "public"."ballots"
    ADD CONSTRAINT "ballots_vote_id_user_id_key" UNIQUE ("vote_id", "user_id");



ALTER TABLE ONLY "public"."comment_reactions"
    ADD CONSTRAINT "comment_reactions_comment_id_user_id_key" UNIQUE ("comment_id", "user_id");



ALTER TABLE ONLY "public"."comment_reactions"
    ADD CONSTRAINT "comment_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comment_reports"
    ADD CONSTRAINT "comment_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_kakao_user_id_key" UNIQUE ("kakao_user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."vote_options"
    ADD CONSTRAINT "vote_options_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "public"."votes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote_participants"
    ADD CONSTRAINT "vote_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote_participants"
    ADD CONSTRAINT "vote_participants_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "public"."votes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



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



CREATE POLICY "Allow public read access" ON "public"."comment_reactions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow public read access to ballots" ON "public"."ballots" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to vote options" ON "public"."vote_options" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow public read access to votes" ON "public"."votes" FOR SELECT USING (true);



CREATE POLICY "Allow read access to active comments" ON "public"."comments" FOR SELECT USING (("visibility" = 'active'::"text"));



CREATE POLICY "Allow users to delete their own reaction" ON "public"."comment_reactions" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own ballot" ON "public"."ballots" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own comments" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Allow users to insert their own reaction" ON "public"."comment_reactions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own report" ON "public"."comment_reports" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "reporter_id"));



CREATE POLICY "Allow users to update their own comments" ON "public"."comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Allow users to view their own ballot" ON "public"."ballots" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."ballots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comment_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comment_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vote_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































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



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



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































RESET ALL;
