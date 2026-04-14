/**
 * Align with `supabase/migrations` and regenerate via Supabase CLI when schema stabilizes.
 */
export type Profile = {
  id: string;
  brightspace_ical_url_ciphertext: string | null;
  google_refresh_token_ciphertext: string | null;
  google_calendar_id: string | null;
  use_dedicated_calendar: boolean | null;
  calendar_color_id: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SyncedEvent = {
  id: string;
  user_id: string;
  brightspace_uid: string;
  google_event_id: string;
  last_modified_hash: string;
  created_at: string;
  updated_at: string;
};
