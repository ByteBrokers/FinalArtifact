import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import type { Company } from "@/types/game";

interface Question {
  question: string;
  type: "radio" | "checkbox";
  options: string[];
}

interface BusinessSurveyProps {
  company: Company;
  onComplete: (earnings: number) => void;
  onClose: () => void;
}

const companySurveys: Record<string, { questions: Question[]; reward: number }> = {
  TechCorp: {
    reward: 50,
    questions: [
      {
        question: "How often do you use location-based services?",
        type: "radio",
        options: ["Multiple times daily", "Once a day", "Few times a week", "Rarely", "Never"],
      },
      {
        question: "Which devices do you use most frequently? (Select all that apply)",
        type: "checkbox",
        options: ["Smartphone", "Tablet", "Laptop", "Desktop", "Smart Watch"],
      },
      {
        question: "How many apps do you typically use per day?",
        type: "radio",
        options: ["1-5", "6-10", "11-20", "21-30", "30+"],
      },
      {
        question: "What time of day are you most active on your devices?",
        type: "radio",
        options: ["Morning (6-12)", "Afternoon (12-18)", "Evening (18-24)", "Night (0-6)", "All day"],
      },
      {
        question: "How comfortable are you with location tracking?",
        type: "radio",
        options: ["Very comfortable", "Comfortable", "Neutral", "Uncomfortable", "Very uncomfortable"],
      },
    ],
  },
  AdVentures: {
    reward: 75,
    questions: [
      {
        question: "How often do you make online purchases?",
        type: "radio",
        options: ["Daily", "Multiple times a week", "Weekly", "Monthly", "Rarely"],
      },
      {
        question: "Which social media platforms do you use? (Select all that apply)",
        type: "checkbox",
        options: ["Instagram", "Facebook", "Twitter/X", "TikTok", "LinkedIn", "Snapchat"],
      },
      {
        question: "What influences your purchasing decisions most?",
        type: "radio",
        options: ["Social media ads", "Influencer recommendations", "Customer reviews", "Price comparisons", "Brand loyalty"],
      },
      {
        question: "How much do you typically spend on online shopping per month?",
        type: "radio",
        options: ["Under $50", "$50-$150", "$150-$300", "$300-$500", "Over $500"],
      },
      {
        question: "Which product categories interest you? (Select all that apply)",
        type: "checkbox",
        options: ["Electronics", "Fashion", "Home & Garden", "Beauty", "Sports & Fitness", "Food & Beverage"],
      },
    ],
  },
  HealthTech: {
    reward: 90,
    questions: [
      {
        question: "How often do you exercise per week?",
        type: "radio",
        options: ["Never", "1-2 times", "3-4 times", "5-6 times", "Daily"],
      },
      {
        question: "Do you use any fitness tracking devices or apps?",
        type: "radio",
        options: ["Yes, multiple", "Yes, one", "No, but interested", "No"],
      },
      {
        question: "What health metrics do you track? (Select all that apply)",
        type: "checkbox",
        options: ["Steps", "Heart rate", "Sleep", "Calories", "Weight", "Blood pressure"],
      },
      {
        question: "How would you rate your overall health awareness?",
        type: "radio",
        options: ["Very high", "High", "Moderate", "Low", "Very low"],
      },
      {
        question: "Are you interested in sharing health data to improve healthcare services?",
        type: "radio",
        options: ["Very interested", "Somewhat interested", "Neutral", "Not very interested", "Not at all interested"],
      },
    ],
  },
  DataMega: {
    reward: 60,
    questions: [
      {
        question: "How concerned are you about your online privacy?",
        type: "radio",
        options: ["Extremely concerned", "Very concerned", "Moderately concerned", "Slightly concerned", "Not concerned"],
      },
      {
        question: "Do you read privacy policies before accepting them?",
        type: "radio",
        options: ["Always", "Usually", "Sometimes", "Rarely", "Never"],
      },
      {
        question: "Which data types are you willing to share? (Select all that apply)",
        type: "checkbox",
        options: ["Browsing history", "Shopping habits", "Location data", "Social media activity", "Health data"],
      },
      {
        question: "How many hours per day do you spend online?",
        type: "radio",
        options: ["Less than 2", "2-4", "4-6", "6-8", "More than 8"],
      },
      {
        question: "Would you trade personal data for better services?",
        type: "radio",
        options: ["Definitely yes", "Probably yes", "Maybe", "Probably not", "Definitely not"],
      },
    ],
  },
};

const BusinessSurvey = ({ company, onComplete, onClose }: BusinessSurveyProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  
  const surveyData = companySurveys[company.name];
  const questions = surveyData.questions;
  const question = questions[currentQuestion];

  const handleRadioChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentAnswers = (answers[currentQuestion] as string[]) || [];
    if (checked) {
      setAnswers({ ...answers, [currentQuestion]: [...currentAnswers, option] });
    } else {
      setAnswers({ ...answers, [currentQuestion]: currentAnswers.filter((a) => a !== option) });
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(surveyData.reward);
  };

  const isAnswered = () => {
    const answer = answers[currentQuestion];
    if (question.type === "checkbox") {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="pr-8">
            {company.name} Survey
          </CardTitle>
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Question {currentQuestion + 1} of {questions.length} • Earn {surveyData.reward} coins
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-4 block">
              {question.question}
            </Label>
            
            {question.type === "radio" ? (
              <RadioGroup
                value={answers[currentQuestion] as string}
                onValueChange={handleRadioChange}
              >
                {question.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2 py-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={((answers[currentQuestion] as string[]) || []).includes(option)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(option, checked as boolean)
                      }
                    />
                    <Label htmlFor={option} className="cursor-pointer font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            {currentQuestion < questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isAnswered()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isAnswered()}
              >
                Complete Survey
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSurvey;
