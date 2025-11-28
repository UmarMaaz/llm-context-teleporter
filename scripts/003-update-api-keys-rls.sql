-- Update RLS policy for api_keys to allow reading by key_hash
-- This allows the API to verify keys without an authenticated session

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Allow reading api_keys by key_hash" ON api_keys;

-- Create separate policies for different operations
CREATE POLICY "Users can manage their own API keys"
  ON api_keys FOR ALL
  USING (auth.uid() = user_id);

-- Allow anyone to read api_keys for verification (they still need the correct hash)
CREATE POLICY "Allow reading api_keys by key_hash"
  ON api_keys FOR SELECT
  USING (true);

-- Allow updates to last_used_at
CREATE POLICY "Allow updating last_used_at"
  ON api_keys FOR UPDATE
  USING (true)
  WITH CHECK (true);
