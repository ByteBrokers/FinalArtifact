-- Create enum for question types
CREATE TYPE public.question_type AS ENUM ('short_answer', 'long_answer', 'multi_choice');

-- Create table for buyer surveys
CREATE TABLE public.buyer_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  payment_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for survey questions
CREATE TABLE public.survey_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.buyer_surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type public.question_type NOT NULL,
  options JSONB,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.buyer_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buyer_surveys
CREATE POLICY "Users can view their own surveys"
  ON public.buyer_surveys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own surveys"
  ON public.buyer_surveys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys"
  ON public.buyer_surveys
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own surveys"
  ON public.buyer_surveys
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for survey_questions
CREATE POLICY "Users can view questions for their surveys"
  ON public.survey_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.buyer_surveys
      WHERE id = survey_questions.survey_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert questions for their surveys"
  ON public.survey_questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.buyer_surveys
      WHERE id = survey_questions.survey_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions for their surveys"
  ON public.survey_questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.buyer_surveys
      WHERE id = survey_questions.survey_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions for their surveys"
  ON public.survey_questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.buyer_surveys
      WHERE id = survey_questions.survey_id
      AND user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_buyer_surveys_updated_at
  BEFORE UPDATE ON public.buyer_surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();