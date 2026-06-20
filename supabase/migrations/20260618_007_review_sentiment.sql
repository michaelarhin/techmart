-- Let reviewers explicitly mark feedback as positive (recommend) or
-- negative (don't recommend), shown alongside the star rating.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS recommend BOOLEAN;
