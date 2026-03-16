-- Run this SQL in your Supabase SQL Editor to set up the database for Testing Maps

-- Create the testing_maps table
CREATE TABLE IF NOT EXISTS public.testing_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Map',
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    edges JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_map_name UNIQUE (user_id, name)
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_testing_maps_updated_at
    BEFORE UPDATE ON public.testing_maps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.testing_maps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own maps
CREATE POLICY "Users can view their own maps"
ON public.testing_maps FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own maps
CREATE POLICY "Users can insert their own maps"
ON public.testing_maps FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own maps
CREATE POLICY "Users can update their own maps"
ON public.testing_maps FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can only delete their own maps
CREATE POLICY "Users can delete their own maps"
ON public.testing_maps FOR DELETE
USING (auth.uid() = user_id);

-- Grant only required permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testing_maps TO authenticated;
GRANT ALL ON public.testing_maps TO service_role;
