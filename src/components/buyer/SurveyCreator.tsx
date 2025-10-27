import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  text: string;
  type: "short_answer" | "long_answer" | "multi_choice";
  options?: string[];
}

interface SurveyCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSurveyCreated: () => void;
}

export const SurveyCreator = ({ open, onOpenChange, onSurveyCreated }: SurveyCreatorProps) => {
  const [title, setTitle] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: "",
      type: "short_answer",
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...(q.options || []), ""],
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: q.options.filter((_, i) => i !== optionIndex),
        };
      }
      return q;
    }));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a survey title");
      return;
    }

    const payment = parseInt(paymentAmount);
    if (isNaN(payment) || payment <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    for (const q of questions) {
      if (!q.text.trim()) {
        toast.error("All questions must have text");
        return;
      }
      if (q.type === "multi_choice" && (!q.options || q.options.length < 2)) {
        toast.error("Multiple choice questions must have at least 2 options");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create surveys");
        return;
      }

      // Create the survey
      const { data: survey, error: surveyError } = await supabase
        .from("buyer_surveys")
        .insert({
          user_id: user.id,
          title,
          payment_amount: payment,
        })
        .select()
        .single();

      if (surveyError) throw surveyError;

      // Create the questions
      const questionsData = questions.map((q, index) => ({
        survey_id: survey.id,
        question_text: q.text,
        question_type: q.type,
        options: q.type === "multi_choice" ? q.options : null,
        order_index: index,
      }));

      const { error: questionsError } = await supabase
        .from("survey_questions")
        .insert(questionsData);

      if (questionsError) throw questionsError;

      toast.success("Survey created successfully!");
      
      // Reset form
      setTitle("");
      setPaymentAmount("");
      setQuestions([]);
      onSurveyCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating survey:", error);
      toast.error("Failed to create survey");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Survey</DialogTitle>
          <DialogDescription>
            Create a custom survey for sellers to complete and earn rewards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Survey Title</Label>
            <Input
              id="title"
              placeholder="e.g., Shopping Preferences Survey"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment">Payment Amount (coins)</Label>
            <Input
              id="payment"
              type="number"
              placeholder="e.g., 50"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Questions</Label>
              <Button onClick={addQuestion} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id} className="border-border">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">Question {index + 1}</Label>
                          <Button
                            onClick={() => removeQuestion(question.id)}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 ml-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <Input
                          placeholder="Enter your question"
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                        />

                        <Select
                          value={question.type}
                          onValueChange={(value: Question["type"]) => {
                            updateQuestion(question.id, { 
                              type: value,
                              options: value === "multi_choice" ? ["", ""] : undefined
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short_answer">Short Answer</SelectItem>
                            <SelectItem value="long_answer">Long Answer</SelectItem>
                            <SelectItem value="multi_choice">Multiple Choice</SelectItem>
                          </SelectContent>
                        </Select>

                        {question.type === "multi_choice" && (
                          <div className="space-y-2 pl-4">
                            <Label className="text-sm">Options</Label>
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <Input
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                />
                                <Button
                                  onClick={() => removeOption(question.id, optIndex)}
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              onClick={() => addOption(question.id)}
                              size="sm"
                              variant="outline"
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Survey"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};