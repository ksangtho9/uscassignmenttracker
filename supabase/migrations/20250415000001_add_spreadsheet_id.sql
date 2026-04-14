-- Add google_spreadsheet_id to profiles.
-- n8n writes this after creating the assignments spreadsheet via the Sheets API.

alter table public.profiles
  add column if not exists google_spreadsheet_id text;
