-- Check if RLS is enabled on generated_quizzes table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'generated_quizzes';

-- Enable RLS if not already enabled
ALTER TABLE generated_quizzes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own quizzes" ON generated_quizzes;
DROP POLICY IF EXISTS "Users can insert their own quizzes" ON generated_quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON generated_quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON generated_quizzes;

-- Create comprehensive RLS policies for generated_quizzes
CREATE POLICY "Users can view their own quizzes" 
ON generated_quizzes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quizzes" 
ON generated_quizzes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quizzes" 
ON generated_quizzes FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quizzes" 
ON generated_quizzes FOR DELETE 
USING (auth.uid() = user_id);

-- Verify policies are created
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'generated_quizzes';