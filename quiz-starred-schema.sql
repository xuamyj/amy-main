-- Add starred column to generated_quizzes table
ALTER TABLE generated_quizzes 
ADD COLUMN starred BOOLEAN DEFAULT FALSE;

-- Create index for better performance when filtering by starred status
CREATE INDEX idx_generated_quizzes_starred ON generated_quizzes(user_id, starred, created_at DESC);