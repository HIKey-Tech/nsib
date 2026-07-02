-- Optional cover photo for reports; NULL means the UI falls back to the NSIB logo.
ALTER TABLE reports ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
