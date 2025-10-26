-- Create table to track business surveys completed by users
CREATE TABLE public.business_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  earnings INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, company_name)
);

-- Enable Row Level Security
ALTER TABLE public.business_surveys ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own completed surveys" 
ON public.business_surveys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own survey completions" 
ON public.business_surveys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own survey completions" 
ON public.business_surveys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own survey completions" 
ON public.business_surveys 
FOR DELETE 
USING (auth.uid() = user_id);