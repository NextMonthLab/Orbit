CREATE TABLE "alignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"mode" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alignments_orbit_id_user_id_unique" UNIQUE("orbit_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "api_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"base_url" text NOT NULL,
	"auth_secret_id" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"last_run_at" timestamp,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_curated_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"snapshot_id" integer NOT NULL,
	"connection_id" integer NOT NULL,
	"endpoint_id" integer NOT NULL,
	"snapshot_version" integer NOT NULL,
	"orbit_slug" text NOT NULL,
	"source_type" text NOT NULL,
	"external_id" text,
	"title" text,
	"summary" text,
	"content" jsonb,
	"metadata" jsonb,
	"indexed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_endpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"connection_id" integer NOT NULL,
	"path" text NOT NULL,
	"params" jsonb,
	"response_mapping" jsonb,
	"pagination_config" jsonb,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_secrets" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_slug" text NOT NULL,
	"name" text NOT NULL,
	"encrypted_value" text NOT NULL,
	"auth_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"rotated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "api_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"endpoint_id" integer NOT NULL,
	"connection_id" integer NOT NULL,
	"version" integer NOT NULL,
	"request_hash" text NOT NULL,
	"raw_payload_ref" text,
	"raw_payload_preview" jsonb,
	"record_count" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"error" text,
	CONSTRAINT "api_snapshots_endpoint_id_request_hash_unique" UNIQUE("endpoint_id","request_hash")
);
--> statement-breakpoint
CREATE TABLE "audio_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"artist" text,
	"source" text DEFAULT 'upload' NOT NULL,
	"licence" text DEFAULT 'Royalty Free',
	"licence_url" text,
	"attribution_required" boolean DEFAULT false NOT NULL,
	"attribution_text" text,
	"file_path" text,
	"file_url" text NOT NULL,
	"duration_seconds" integer,
	"mood_tags" jsonb DEFAULT '[]'::jsonb,
	"genre_tags" jsonb DEFAULT '[]'::jsonb,
	"created_by_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"user_id" integer,
	"user_ip" text,
	"user_agent" text,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"details" jsonb,
	"old_value" jsonb,
	"new_value" jsonb,
	"success" boolean DEFAULT true NOT NULL,
	"error_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"event_type" text NOT NULL,
	"stripe_event_id" text,
	"checkout_session_id" text,
	"payment_intent_id" text,
	"subscription_id" text,
	"price_id" text,
	"currency" text,
	"expected_amount_cents" integer,
	"stripe_amount_cents" integer,
	"discount_amount_cents" integer,
	"status_before" text,
	"status_after" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content_markdown" text NOT NULL,
	"content_html" text,
	"hero_image_url" text,
	"hero_alt" text,
	"hero_caption" text,
	"cta_primary_label" text,
	"cta_primary_url" text,
	"cta_secondary_label" text,
	"cta_secondary_url" text,
	"author" text,
	"tags" text[],
	"canonical_url" text,
	"internal_links" text[],
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "card_characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" integer NOT NULL,
	"character_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"media_type" text NOT NULL,
	"storage_key" text NOT NULL,
	"original_filename" text,
	"mime_type" text,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"duration" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"source" text DEFAULT 'uploaded' NOT NULL,
	"source_url" text,
	"attribution" text,
	"alt_text" text,
	"caption" text,
	"relevance_score" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_message_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"user_id" integer,
	"anon_fingerprint" text,
	"reaction_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" integer NOT NULL,
	"user_id" integer,
	"display_name" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"universe_id" integer NOT NULL,
	"season" integer DEFAULT 1 NOT NULL,
	"day_index" integer NOT NULL,
	"title" text NOT NULL,
	"image_path" text,
	"captions_json" jsonb NOT NULL,
	"scene_text" text NOT NULL,
	"recap_text" text NOT NULL,
	"effect_template" text DEFAULT 'ken-burns',
	"status" text DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp,
	"video_path" text,
	"scene_description" text,
	"image_generation" jsonb,
	"generated_image_url" text,
	"image_generated" boolean DEFAULT false,
	"generated_video_url" text,
	"video_generated" boolean DEFAULT false,
	"video_generation_task_id" text,
	"video_generation_mode" text,
	"video_generation_status" text DEFAULT 'none',
	"video_generation_error" text,
	"video_generation_model" text,
	"video_thumbnail_url" text,
	"video_duration_sec" real,
	"video_generated_at" timestamp,
	"preferred_media_type" text DEFAULT 'image',
	"primary_character_ids" jsonb,
	"location_id" integer,
	"chat_overrides" jsonb,
	"narration_enabled" boolean DEFAULT false,
	"narration_text" text,
	"narration_voice" text,
	"narration_speed" real DEFAULT 1,
	"narration_status" text DEFAULT 'none',
	"narration_audio_url" text,
	"narration_audio_duration_sec" real,
	"narration_updated_at" timestamp,
	"narration_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" serial PRIMARY KEY NOT NULL,
	"universe_id" integer NOT NULL,
	"character_slug" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"avatar" text,
	"description" text,
	"system_prompt" text,
	"secrets_json" jsonb,
	"visual_profile" jsonb,
	"chat_profile" jsonb,
	"is_public_figure_simulation" boolean DEFAULT false,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_custom_character" boolean DEFAULT false,
	"knowledge_source_url" text,
	"knowledge_documents" jsonb,
	"knowledge_content" text,
	"training_status" text DEFAULT 'ready',
	"guardrails" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"universe_id" integer NOT NULL,
	"character_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"idempotency_key" text NOT NULL,
	"user_id" integer NOT NULL,
	"preview_id" text,
	"stripe_payment_intent_id" text,
	"stripe_checkout_session_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"checkout_options" jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "checkout_transactions_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "community_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_id" integer NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"community_type" text NOT NULL,
	"notes" text,
	"region_tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_concepts" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_id" integer NOT NULL,
	"concept_id" text NOT NULL,
	"label" text NOT NULL,
	"why_it_matters" text,
	"starter_questions" jsonb DEFAULT '[]'::jsonb,
	"intent_tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"slug" text,
	"display_name" text NOT NULL,
	"headline" text,
	"bio" text,
	"avatar_url" text,
	"external_link" text,
	"plan_id" integer,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_status" text DEFAULT 'inactive',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "creator_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "credit_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"credit_type" text NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"video_credits" integer DEFAULT 0 NOT NULL,
	"voice_credits" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_wallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "device_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"orbit_slug" text NOT NULL,
	"event_type" text NOT NULL,
	"request_summary" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_rate_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"orbit_slug" text NOT NULL,
	"tokens" integer DEFAULT 10 NOT NULL,
	"last_refill_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "device_rate_limits_device_id_orbit_slug_unique" UNIQUE("device_id","orbit_slug")
);
--> statement-breakpoint
CREATE TABLE "device_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"orbit_slug" text NOT NULL,
	"device_label" text,
	"token_hash" text NOT NULL,
	"scopes" text[] DEFAULT '{"orbit:read","orbit:ask"}',
	"pairing_code" text,
	"pairing_expires_at" timestamp,
	"last_seen_at" timestamp,
	"last_seen_ip" text,
	"user_agent" text,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "device_sessions_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"can_use_cloud_llm" boolean DEFAULT false NOT NULL,
	"can_generate_images" boolean DEFAULT false NOT NULL,
	"can_export" boolean DEFAULT false NOT NULL,
	"can_use_character_chat" boolean DEFAULT false NOT NULL,
	"max_cards_per_story" integer DEFAULT 5 NOT NULL,
	"storage_days" integer DEFAULT 7 NOT NULL,
	"collaboration_roles" boolean DEFAULT false NOT NULL,
	"can_upload_media" boolean DEFAULT false NOT NULL,
	"storage_quota_bytes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entitlements_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" text NOT NULL,
	"metadata_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hero_post_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"summary" text,
	"top_themes" jsonb,
	"top_hooks" jsonb,
	"top_proof_types" jsonb,
	"suggestions" jsonb,
	"brand_voice_summary" text,
	"voice_traits" jsonb,
	"audience_notes" text,
	"tone_guidance" jsonb,
	"brand_voice_updated_at" timestamp,
	"post_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hero_post_insights_business_slug_unique" UNIQUE("business_slug")
);
--> statement-breakpoint
CREATE TABLE "hero_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"created_by_user_id" integer,
	"source_platform" text NOT NULL,
	"url" text NOT NULL,
	"author_name" text,
	"author_type" text DEFAULT 'unknown',
	"business_voice_id" integer,
	"title" text,
	"text" text,
	"outcome_note" text,
	"performed_because" jsonb,
	"tags" jsonb,
	"og_image_url" text,
	"og_description" text,
	"published_at" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"extracted" jsonb,
	"use_as_knowledge" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hero_posts_business_slug_url_unique" UNIQUE("business_slug","url")
);
--> statement-breakpoint
CREATE TABLE "ice_analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"ice_id" text,
	"draft_id" integer,
	"event_type" text NOT NULL,
	"orbit_slug" text,
	"creator_id" integer,
	"campaign_id" text,
	"ref" text,
	"visitor_ip" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ice_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"source" text DEFAULT 'launchpad' NOT NULL,
	"business_slug" text,
	"insight_id" text,
	"format" text,
	"tone" text,
	"output_type" text,
	"headline" text,
	"captions" text[],
	"cta_text" text,
	"preview_frame_url" text,
	"orbit_slug" text,
	"orbit_type" text,
	"source_message_id" text,
	"view_type" text,
	"view_data" jsonb,
	"summary_text" text,
	"sources" jsonb,
	"template_type" text,
	"generated_cards" jsonb,
	"deep_link" text,
	"orbit_view_state" jsonb,
	"cta_label" text DEFAULT 'Ask in Orbit',
	"cta_link" text,
	"campaign_id" text,
	"published_ice_id" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ice_moderation" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft_id" integer NOT NULL,
	"submitted_by" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ice_previews" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_ip" text,
	"owner_user_id" integer,
	"claim_token_hash" text,
	"claim_token_used_at" timestamp,
	"source_type" text NOT NULL,
	"source_value" text NOT NULL,
	"content_type" text DEFAULT 'unknown',
	"fidelity_mode" text DEFAULT 'interpretive',
	"scene_map" jsonb,
	"title" text NOT NULL,
	"cards" jsonb NOT NULL,
	"characters" jsonb DEFAULT '[]'::jsonb,
	"interactivity_nodes" jsonb DEFAULT '[]'::jsonb,
	"tier" text DEFAULT 'short' NOT NULL,
	"project_bible" jsonb,
	"music_track_url" text,
	"music_volume" integer DEFAULT 50,
	"narration_volume" integer DEFAULT 100,
	"music_enabled" boolean DEFAULT false,
	"title_pack_id" text DEFAULT 'cinematic-subtitles',
	"visibility" text DEFAULT 'unlisted' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"promoted_to_job_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"promoted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "industry_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_id" integer NOT NULL,
	"asset_type" text NOT NULL,
	"storage_url" text NOT NULL,
	"thumb_url" text,
	"source_url" text,
	"title" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"website_url" text,
	"region_tags" jsonb DEFAULT '[]'::jsonb,
	"trust_level" text DEFAULT 'independent' NOT NULL,
	"logo_asset_id" integer,
	"social_urls" jsonb DEFAULT '{}'::jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_id" integer NOT NULL,
	"manufacturer_entity_id" integer,
	"name" text NOT NULL,
	"category" text DEFAULT 'consumer' NOT NULL,
	"status" text DEFAULT 'announced' NOT NULL,
	"release_date" timestamp,
	"primary_url" text,
	"summary" text,
	"hero_asset_id" integer,
	"media_refs" jsonb DEFAULT '{}'::jsonb,
	"reference_urls" jsonb DEFAULT '[]'::jsonb,
	"intent_tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_id" integer NOT NULL,
	"product_id" integer,
	"reviewer_entity_id" integer,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"published_at" timestamp,
	"rating_value" real,
	"rating_scale" real,
	"summary" text,
	"sentiment" text DEFAULT 'unknown' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"universe_id" integer NOT NULL,
	"location_slug" text NOT NULL,
	"name" text NOT NULL,
	"continuity" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" integer NOT NULL,
	"orbit_id" integer NOT NULL,
	"purpose" text NOT NULL,
	"target_id" integer,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "magic_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"email_cadence" text DEFAULT 'daily_digest' NOT NULL,
	"lead_alerts_enabled" boolean DEFAULT true NOT NULL,
	"conversation_alerts_enabled" boolean DEFAULT false NOT NULL,
	"intelligence_alerts_enabled" boolean DEFAULT false NOT NULL,
	"ice_alerts_enabled" boolean DEFAULT false NOT NULL,
	"quiet_hours_enabled" boolean DEFAULT false NOT NULL,
	"quiet_start_hour" integer,
	"quiet_end_hour" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"orbit_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"action_url" text NOT NULL,
	"meta" jsonb,
	"severity" text DEFAULT 'info' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sent_email_at" timestamp,
	"dedupe_key" text
);
--> statement-breakpoint
CREATE TABLE "orbit_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"date" timestamp NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL,
	"interactions" integer DEFAULT 0 NOT NULL,
	"conversations" integer DEFAULT 0 NOT NULL,
	"ice_views" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"avg_session_duration" integer DEFAULT 0 NOT NULL,
	"top_questions" text[],
	"top_topics" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orbit_boxes" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"box_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"source_url" text,
	"content" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"ice_id" integer,
	"price" text,
	"currency" text DEFAULT 'GBP',
	"category" text,
	"subcategory" text,
	"tags" jsonb,
	"sku" text,
	"availability" text DEFAULT 'available',
	"popularity_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orbit_claim_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"domain_match" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orbit_claim_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "orbit_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"session_id" text,
	"visitor_id" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"engaged_box_ids" integer[],
	"engaged_ice_ids" integer[],
	"lead_generated" boolean DEFAULT false NOT NULL,
	"lead_id" integer,
	"extracted_questions" text[],
	"extracted_themes" text[],
	"proof_capture_triggered_at" timestamp,
	"proof_capture_social_proof_id" integer
);
--> statement-breakpoint
CREATE TABLE "orbit_cube_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_slug" text NOT NULL,
	"cube_id" integer,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"stripe_subscription_id" text,
	"hardware_price_gbp" integer DEFAULT 29900 NOT NULL,
	"monthly_price_gbp" integer DEFAULT 2900 NOT NULL,
	"status" text DEFAULT 'created' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orbit_cubes" (
	"id" serial PRIMARY KEY NOT NULL,
	"cube_uuid" text NOT NULL,
	"orbit_slug" text NOT NULL,
	"owner_user_id" integer,
	"name" text DEFAULT 'Orbit Cube' NOT NULL,
	"status" text DEFAULT 'pending_pairing' NOT NULL,
	"pairing_code" text,
	"pairing_code_expires_at" timestamp,
	"device_token_hash" text,
	"sleep_timeout_minutes" integer DEFAULT 30 NOT NULL,
	"last_seen_at" timestamp,
	"last_seen_ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "orbit_cubes_cube_uuid_unique" UNIQUE("cube_uuid")
);
--> statement-breakpoint
CREATE TABLE "orbit_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"uploaded_by_user_id" integer,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"storage_path" text NOT NULL,
	"title" text,
	"description" text,
	"category" text DEFAULT 'other',
	"extracted_text" text,
	"page_count" integer,
	"status" text DEFAULT 'uploading' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orbit_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"session_id" text NOT NULL,
	"event_type" text NOT NULL,
	"box_id" integer,
	"ice_id" integer,
	"conversation_id" integer,
	"metadata_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orbit_insights_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"conversation_count" integer DEFAULT 0 NOT NULL,
	"leads_count" integer DEFAULT 0 NOT NULL,
	"top_questions" text[],
	"top_themes" text[],
	"unanswered_questions" text[],
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orbit_knowledge_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"question" text NOT NULL,
	"rationale" text NOT NULL,
	"impact_score" integer DEFAULT 5,
	"gap_source" text NOT NULL,
	"gap_context" jsonb,
	"suggested_destination" text NOT NULL,
	"suggested_box_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"answer_text" text,
	"filed_destination" text,
	"filed_box_id" integer,
	"answered_at" timestamp,
	"filed_at" timestamp,
	"week_number" integer NOT NULL,
	"batch_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "orbit_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"message" text,
	"source" text DEFAULT 'orbit',
	"is_read" boolean DEFAULT false NOT NULL,
	"session_id" text,
	"box_id" integer,
	"conversation_id" integer,
	"last_question" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orbit_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orbit_meta" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"source_url" text NOT NULL,
	"orbit_type" text DEFAULT 'standard' NOT NULL,
	"preview_id" text,
	"current_pack_version" text,
	"current_pack_key" text,
	"owner_id" integer,
	"owner_email" text,
	"verified_at" timestamp,
	"visibility" text DEFAULT 'public' NOT NULL,
	"generation_status" text DEFAULT 'idle' NOT NULL,
	"generation_job_id" text,
	"requested_at" timestamp,
	"completed_at" timestamp,
	"last_error" text,
	"custom_logo" text,
	"custom_accent" text,
	"custom_tone" text,
	"custom_title" text,
	"custom_description" text,
	"plan_tier" text DEFAULT 'free' NOT NULL,
	"strength_score" integer DEFAULT 0 NOT NULL,
	"ice_allowance_monthly" integer DEFAULT 0 NOT NULL,
	"ice_used_this_period" integer DEFAULT 0 NOT NULL,
	"ice_period_start" timestamp,
	"proof_capture_enabled" boolean DEFAULT true NOT NULL,
	"ai_indexing_enabled" boolean DEFAULT true NOT NULL,
	"auto_update_knowledge" boolean DEFAULT true NOT NULL,
	"ai_accuracy_alerts_enabled" boolean DEFAULT true NOT NULL,
	"weekly_reports_enabled" boolean DEFAULT false NOT NULL,
	"total_pack_versions" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orbit_meta_business_slug_unique" UNIQUE("business_slug")
);
--> statement-breakpoint
CREATE TABLE "orbit_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"business_slug" text NOT NULL,
	"visitor_id" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"event_count" integer DEFAULT 0 NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"lead_generated" boolean DEFAULT false NOT NULL,
	CONSTRAINT "orbit_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "orbit_signal_access_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_slug" text NOT NULL,
	"accessed_at" timestamp DEFAULT now() NOT NULL,
	"user_agent" text,
	"user_agent_truncated" text,
	"request_method" text DEFAULT 'GET' NOT NULL,
	"response_status" integer DEFAULT 200 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orbit_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"label" text NOT NULL,
	"source_type" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orbit_sources_business_slug_label_unique" UNIQUE("business_slug","label")
);
--> statement-breakpoint
CREATE TABLE "orbit_video_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" integer NOT NULL,
	"business_slug" text NOT NULL,
	"session_id" text,
	"event_type" text NOT NULL,
	"ms_watched" integer DEFAULT 0,
	"follow_up_question" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orbit_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"created_by_user_id" integer,
	"youtube_video_id" text NOT NULL,
	"youtube_url" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"duration_seconds" integer,
	"tags" jsonb,
	"topics" jsonb,
	"transcript" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"serve_count" integer DEFAULT 0 NOT NULL,
	"play_count" integer DEFAULT 0 NOT NULL,
	"total_watch_time_ms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"monthly_price" integer DEFAULT 0 NOT NULL,
	"yearly_price" integer,
	"stripe_price_id_monthly" text,
	"stripe_price_id_yearly" text,
	"features" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "preview_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"preview_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preview_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" integer,
	"owner_ip" text,
	"source_url" text NOT NULL,
	"source_domain" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"site_identity" jsonb,
	"site_title" text,
	"site_summary" text,
	"key_services" text[],
	"contact_info" jsonb,
	"message_count" integer DEFAULT 0 NOT NULL,
	"max_messages" integer DEFAULT 25 NOT NULL,
	"ingested_pages_count" integer DEFAULT 0 NOT NULL,
	"max_pages" integer DEFAULT 4 NOT NULL,
	"total_chars_ingested" integer DEFAULT 0 NOT NULL,
	"cost_estimate_pence" integer DEFAULT 0,
	"llm_call_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp,
	"claimed_at" timestamp,
	"claimed_plan_id" integer,
	"stripe_checkout_session_id" text
);
--> statement-breakpoint
CREATE TABLE "product_specs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"spec_key" text NOT NULL,
	"spec_value" text NOT NULL,
	"spec_unit" text,
	"source_url" text,
	"last_verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pulse_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_id" integer NOT NULL,
	"pulse_source_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"importance" text DEFAULT 'medium' NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"detected_at" timestamp DEFAULT now() NOT NULL,
	"entity_refs" jsonb DEFAULT '{}'::jsonb,
	"summary" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pulse_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"pulse_source_id" integer NOT NULL,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"content_hash" text NOT NULL,
	"content_excerpt" text,
	"raw_storage_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pulse_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_id" integer NOT NULL,
	"name" text NOT NULL,
	"source_type" text NOT NULL,
	"url" text NOT NULL,
	"rss_url" text,
	"monitoring_method" text DEFAULT 'page_monitor' NOT NULL,
	"update_frequency" text DEFAULT 'weekly' NOT NULL,
	"trust_level" text DEFAULT 'independent' NOT NULL,
	"event_types" jsonb DEFAULT '[]'::jsonb,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"last_checked_at" timestamp,
	"keyword_triggers" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_proof_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_slug" text NOT NULL,
	"conversation_id" integer,
	"source_message_id" integer,
	"raw_quote_text" text NOT NULL,
	"clean_quote_text" text,
	"topic" text DEFAULT 'other' NOT NULL,
	"specificity_score" real,
	"sentiment_score" real,
	"consent_status" text DEFAULT 'pending' NOT NULL,
	"consent_type" text,
	"consent_timestamp" timestamp,
	"attribution_name" text,
	"attribution_town" text,
	"generated_variants" jsonb,
	"recommended_placements" text[],
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"last_credit_grant_period_end" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "title_packs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'custom',
	"tier" text DEFAULT 'free' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"user_id" integer,
	"definition" jsonb NOT NULL,
	"thumbnail_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "title_packs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topic_tiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"orbit_id" integer NOT NULL,
	"label" text NOT NULL,
	"sublabel" text,
	"intent_tags" jsonb DEFAULT '[]'::jsonb,
	"priority" integer DEFAULT 0 NOT NULL,
	"badge_state" jsonb DEFAULT '{}'::jsonb,
	"last_refreshed_at" timestamp,
	"evidence_refs" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transformation_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"source_type" text DEFAULT 'unknown',
	"source_file_name" text,
	"source_file_path" text,
	"source_url" text,
	"content_source_type" text,
	"content_industry" text,
	"content_category" text,
	"content_goal" text,
	"story_length" text DEFAULT 'medium',
	"status" text DEFAULT 'queued' NOT NULL,
	"current_stage" integer DEFAULT 0 NOT NULL,
	"stage_statuses" jsonb,
	"artifacts" jsonb,
	"output_universe_id" integer,
	"error_code" text,
	"error_message_user" text,
	"error_message_dev" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tts_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"universe_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"chars_count" integer NOT NULL,
	"voice_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "universe_audio_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"universe_id" integer NOT NULL,
	"audio_mode" text DEFAULT 'off' NOT NULL,
	"default_track_id" integer,
	"allowed_track_ids" jsonb DEFAULT '[]'::jsonb,
	"fade_in_ms" integer DEFAULT 500 NOT NULL,
	"fade_out_ms" integer DEFAULT 500 NOT NULL,
	"crossfade_ms" integer DEFAULT 800 NOT NULL,
	"ducking_during_voice_over" boolean DEFAULT true NOT NULL,
	"duck_db" integer DEFAULT 12 NOT NULL,
	CONSTRAINT "universe_audio_settings_universe_id_unique" UNIQUE("universe_id")
);
--> statement-breakpoint
CREATE TABLE "universe_creators" (
	"id" serial PRIMARY KEY NOT NULL,
	"universe_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "universe_reference_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"universe_id" integer NOT NULL,
	"asset_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_path" text NOT NULL,
	"thumbnail_path" text,
	"prompt_notes" text,
	"character_id" integer,
	"location_id" integer,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "universes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"style_notes" text,
	"ice_status" text DEFAULT 'draft' NOT NULL,
	"active_since" timestamp,
	"paused_at" timestamp,
	"owner_user_id" integer,
	"visibility" text DEFAULT 'private' NOT NULL,
	"visual_mode" text DEFAULT 'author_supplied',
	"visual_style" jsonb,
	"visual_continuity" jsonb,
	"design_guide" jsonb,
	"chat_policy" jsonb,
	"source_guardrails" jsonb,
	"release_mode" text DEFAULT 'daily',
	"intro_cards_count" integer DEFAULT 3,
	"daily_release_starts_at_day_index" integer,
	"timezone" text DEFAULT 'UTC',
	"default_narration_enabled" boolean DEFAULT false,
	"default_narration_voice" text,
	"default_narration_speed" real DEFAULT 1,
	"default_narration_mode" text DEFAULT 'manual',
	"narration_style_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "universes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_onboarding_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"persona" text NOT NULL,
	"industry" text,
	"company_name" text,
	"team_size" text,
	"goals" text[],
	"target_audience" text,
	"content_frequency" text,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"onboarding_dismissed" boolean DEFAULT false NOT NULL,
	"onboarding_path" text,
	"onboarding_completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_onboarding_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"universe_id" integer NOT NULL,
	"unlocked_day_index" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"last_seen_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_storage_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"total_bytes_used" integer DEFAULT 0 NOT NULL,
	"image_count" integer DEFAULT 0 NOT NULL,
	"video_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_storage_usage_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"username" text NOT NULL,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "video_export_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"business_slug" text,
	"ice_draft_id" integer,
	"quality" text DEFAULT 'standard' NOT NULL,
	"format" text DEFAULT 'mp4' NOT NULL,
	"include_narration" boolean DEFAULT true NOT NULL,
	"include_music" boolean DEFAULT true NOT NULL,
	"title_pack_id" integer,
	"status" text DEFAULT 'queued' NOT NULL,
	"progress" real DEFAULT 0 NOT NULL,
	"current_step" text,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"output_url" text,
	"output_size_bytes" integer,
	"output_duration_seconds" real,
	"started_at" timestamp,
	"completed_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_export_jobs_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alignments" ADD CONSTRAINT "alignments_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alignments" ADD CONSTRAINT "alignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_connections" ADD CONSTRAINT "api_connections_orbit_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("orbit_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_connections" ADD CONSTRAINT "api_connections_auth_secret_id_api_secrets_id_fk" FOREIGN KEY ("auth_secret_id") REFERENCES "public"."api_secrets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_curated_items" ADD CONSTRAINT "api_curated_items_snapshot_id_api_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."api_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_curated_items" ADD CONSTRAINT "api_curated_items_connection_id_api_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."api_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_curated_items" ADD CONSTRAINT "api_curated_items_endpoint_id_api_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."api_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_endpoints" ADD CONSTRAINT "api_endpoints_connection_id_api_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."api_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_secrets" ADD CONSTRAINT "api_secrets_orbit_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("orbit_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_snapshots" ADD CONSTRAINT "api_snapshots_endpoint_id_api_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."api_endpoints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_snapshots" ADD CONSTRAINT "api_snapshots_connection_id_api_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."api_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_tracks" ADD CONSTRAINT "audio_tracks_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_audit_logs" ADD CONSTRAINT "billing_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_characters" ADD CONSTRAINT "card_characters_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_characters" ADD CONSTRAINT "card_characters_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_media_assets" ADD CONSTRAINT "card_media_assets_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_media_assets" ADD CONSTRAINT "card_media_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_message_reactions" ADD CONSTRAINT "card_message_reactions_message_id_card_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."card_messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_message_reactions" ADD CONSTRAINT "card_message_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_messages" ADD CONSTRAINT "card_messages_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_messages" ADD CONSTRAINT "card_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_thread_id_chat_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_transactions" ADD CONSTRAINT "checkout_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_links" ADD CONSTRAINT "community_links_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_concepts" ADD CONSTRAINT "core_concepts_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_events" ADD CONSTRAINT "credit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_wallets" ADD CONSTRAINT "credit_wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hero_post_insights" ADD CONSTRAINT "hero_post_insights_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hero_posts" ADD CONSTRAINT "hero_posts_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hero_posts" ADD CONSTRAINT "hero_posts_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_analytics_events" ADD CONSTRAINT "ice_analytics_events_ice_id_ice_previews_id_fk" FOREIGN KEY ("ice_id") REFERENCES "public"."ice_previews"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_analytics_events" ADD CONSTRAINT "ice_analytics_events_draft_id_ice_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."ice_drafts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_analytics_events" ADD CONSTRAINT "ice_analytics_events_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_drafts" ADD CONSTRAINT "ice_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_drafts" ADD CONSTRAINT "ice_drafts_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_drafts" ADD CONSTRAINT "ice_drafts_published_ice_id_ice_previews_id_fk" FOREIGN KEY ("published_ice_id") REFERENCES "public"."ice_previews"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_moderation" ADD CONSTRAINT "ice_moderation_draft_id_ice_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."ice_drafts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_moderation" ADD CONSTRAINT "ice_moderation_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_moderation" ADD CONSTRAINT "ice_moderation_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_previews" ADD CONSTRAINT "ice_previews_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ice_previews" ADD CONSTRAINT "ice_previews_promoted_to_job_id_transformation_jobs_id_fk" FOREIGN KEY ("promoted_to_job_id") REFERENCES "public"."transformation_jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industry_assets" ADD CONSTRAINT "industry_assets_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industry_entities" ADD CONSTRAINT "industry_entities_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industry_products" ADD CONSTRAINT "industry_products_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industry_products" ADD CONSTRAINT "industry_products_manufacturer_entity_id_industry_entities_id_fk" FOREIGN KEY ("manufacturer_entity_id") REFERENCES "public"."industry_entities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industry_reviews" ADD CONSTRAINT "industry_reviews_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industry_reviews" ADD CONSTRAINT "industry_reviews_product_id_industry_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."industry_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industry_reviews" ADD CONSTRAINT "industry_reviews_reviewer_entity_id_industry_entities_id_fk" FOREIGN KEY ("reviewer_entity_id") REFERENCES "public"."industry_entities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_links" ADD CONSTRAINT "magic_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_links" ADD CONSTRAINT "magic_links_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_analytics" ADD CONSTRAINT "orbit_analytics_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_boxes" ADD CONSTRAINT "orbit_boxes_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_claim_tokens" ADD CONSTRAINT "orbit_claim_tokens_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_conversations" ADD CONSTRAINT "orbit_conversations_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_conversations" ADD CONSTRAINT "orbit_conversations_session_id_orbit_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."orbit_sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_cube_orders" ADD CONSTRAINT "orbit_cube_orders_orbit_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("orbit_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_cube_orders" ADD CONSTRAINT "orbit_cube_orders_cube_id_orbit_cubes_id_fk" FOREIGN KEY ("cube_id") REFERENCES "public"."orbit_cubes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_cubes" ADD CONSTRAINT "orbit_cubes_orbit_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("orbit_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_cubes" ADD CONSTRAINT "orbit_cubes_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_documents" ADD CONSTRAINT "orbit_documents_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_documents" ADD CONSTRAINT "orbit_documents_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_events" ADD CONSTRAINT "orbit_events_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_events" ADD CONSTRAINT "orbit_events_session_id_orbit_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."orbit_sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_events" ADD CONSTRAINT "orbit_events_box_id_orbit_boxes_id_fk" FOREIGN KEY ("box_id") REFERENCES "public"."orbit_boxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_insights_summary" ADD CONSTRAINT "orbit_insights_summary_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_knowledge_prompts" ADD CONSTRAINT "orbit_knowledge_prompts_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_knowledge_prompts" ADD CONSTRAINT "orbit_knowledge_prompts_suggested_box_id_orbit_boxes_id_fk" FOREIGN KEY ("suggested_box_id") REFERENCES "public"."orbit_boxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_knowledge_prompts" ADD CONSTRAINT "orbit_knowledge_prompts_filed_box_id_orbit_boxes_id_fk" FOREIGN KEY ("filed_box_id") REFERENCES "public"."orbit_boxes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_leads" ADD CONSTRAINT "orbit_leads_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_messages" ADD CONSTRAINT "orbit_messages_conversation_id_orbit_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."orbit_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_meta" ADD CONSTRAINT "orbit_meta_preview_id_preview_instances_id_fk" FOREIGN KEY ("preview_id") REFERENCES "public"."preview_instances"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_meta" ADD CONSTRAINT "orbit_meta_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_sessions" ADD CONSTRAINT "orbit_sessions_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_signal_access_log" ADD CONSTRAINT "orbit_signal_access_log_orbit_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("orbit_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_sources" ADD CONSTRAINT "orbit_sources_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_video_events" ADD CONSTRAINT "orbit_video_events_video_id_orbit_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."orbit_videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_video_events" ADD CONSTRAINT "orbit_video_events_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_videos" ADD CONSTRAINT "orbit_videos_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_videos" ADD CONSTRAINT "orbit_videos_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preview_chat_messages" ADD CONSTRAINT "preview_chat_messages_preview_id_preview_instances_id_fk" FOREIGN KEY ("preview_id") REFERENCES "public"."preview_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preview_instances" ADD CONSTRAINT "preview_instances_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preview_instances" ADD CONSTRAINT "preview_instances_claimed_plan_id_plans_id_fk" FOREIGN KEY ("claimed_plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_product_id_industry_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."industry_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_events" ADD CONSTRAINT "pulse_events_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_events" ADD CONSTRAINT "pulse_events_pulse_source_id_pulse_sources_id_fk" FOREIGN KEY ("pulse_source_id") REFERENCES "public"."pulse_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_snapshots" ADD CONSTRAINT "pulse_snapshots_pulse_source_id_pulse_sources_id_fk" FOREIGN KEY ("pulse_source_id") REFERENCES "public"."pulse_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_sources" ADD CONSTRAINT "pulse_sources_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_proof_items" ADD CONSTRAINT "social_proof_items_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_proof_items" ADD CONSTRAINT "social_proof_items_conversation_id_orbit_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."orbit_conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_proof_items" ADD CONSTRAINT "social_proof_items_source_message_id_orbit_messages_id_fk" FOREIGN KEY ("source_message_id") REFERENCES "public"."orbit_messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "title_packs" ADD CONSTRAINT "title_packs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_tiles" ADD CONSTRAINT "topic_tiles_orbit_id_orbit_meta_id_fk" FOREIGN KEY ("orbit_id") REFERENCES "public"."orbit_meta"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transformation_jobs" ADD CONSTRAINT "transformation_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transformation_jobs" ADD CONSTRAINT "transformation_jobs_output_universe_id_universes_id_fk" FOREIGN KEY ("output_universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tts_usage" ADD CONSTRAINT "tts_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tts_usage" ADD CONSTRAINT "tts_usage_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tts_usage" ADD CONSTRAINT "tts_usage_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "universe_audio_settings" ADD CONSTRAINT "universe_audio_settings_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "universe_audio_settings" ADD CONSTRAINT "universe_audio_settings_default_track_id_audio_tracks_id_fk" FOREIGN KEY ("default_track_id") REFERENCES "public"."audio_tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "universe_creators" ADD CONSTRAINT "universe_creators_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "universe_creators" ADD CONSTRAINT "universe_creators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "universe_reference_assets" ADD CONSTRAINT "universe_reference_assets_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "universe_reference_assets" ADD CONSTRAINT "universe_reference_assets_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "universe_reference_assets" ADD CONSTRAINT "universe_reference_assets_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "universes" ADD CONSTRAINT "universes_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_onboarding_profiles" ADD CONSTRAINT "user_onboarding_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_universe_id_universes_id_fk" FOREIGN KEY ("universe_id") REFERENCES "public"."universes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_storage_usage" ADD CONSTRAINT "user_storage_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_export_jobs" ADD CONSTRAINT "video_export_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_export_jobs" ADD CONSTRAINT "video_export_jobs_business_slug_orbit_meta_business_slug_fk" FOREIGN KEY ("business_slug") REFERENCES "public"."orbit_meta"("business_slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_export_jobs" ADD CONSTRAINT "video_export_jobs_ice_draft_id_ice_drafts_id_fk" FOREIGN KEY ("ice_draft_id") REFERENCES "public"."ice_drafts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_export_jobs" ADD CONSTRAINT "video_export_jobs_title_pack_id_title_packs_id_fk" FOREIGN KEY ("title_pack_id") REFERENCES "public"."title_packs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;