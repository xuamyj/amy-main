"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface QuizResult {
  id: number;
  name: string;
  description: string;
}

interface QuizAnswer {
  id: number;
  text: string;
  points: Record<string, number>;
}

interface QuizQuestion {
  id: number;
  question: string;
  answers: QuizAnswer[];
}

interface QuizData {
  results: QuizResult[];
  questions: QuizQuestion[];
}

export default function GenerateQuizPage() {
  const router = useRouter();
  const [scenario, setScenario] = useState("");
  const [outcome, setOutcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [generatedQuizId, setGeneratedQuizId] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading]);

  const handleSubmit = async () => {
    if (!scenario.trim() || !outcome.trim()) {
      setError("Please fill in both fields");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedQuizId(null);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: scenario.trim(),
          outcome: outcome.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      // Save the quiz data to Supabase
      try {
        const saveResponse = await fetch('/api/quiz-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scenario: scenario.trim(),
            outcome: outcome.trim(),
            quiz_data: data,
          }),
        });

        const savedQuiz = await saveResponse.json();
        
        if (saveResponse.ok && savedQuiz.id) {
          setGeneratedQuizId(savedQuiz.id);
          
          // Attempt to redirect after a short delay
          setTimeout(() => {
            router.push(`/quiz-maker/play/${savedQuiz.id}`);
          }, 2000);
        }
      } catch (saveErr) {
        console.warn('Failed to save quiz data:', saveErr);
        setError('Quiz generated but failed to save. Please try again.');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-4xl px-6 py-8">
      <main className="flex-1 flex flex-col gap-8">
        <div className="text-center">
          <h1>Generate Your Own Quiz!</h1>
          <p className="text-gray-600 mt-2 text-lg">Create a personalized quiz powered by AI</p>
        </div>
        
        <div className="quiz-card max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="whitespace-nowrap">Live a day as</h2>
                <input 
                  type="text" 
                  placeholder="ex. a bird"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="quiz-input flex-1 max-w-xs"
                  disabled={loading}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="whitespace-nowrap">and we'll tell you</h2>
                <input 
                  type="text" 
                  placeholder="ex. what your next hobby should be!"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="quiz-input flex-1 max-w-xs"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="quiz-btn quiz-btn-primary text-lg px-8"
              >
                {loading ? "Generating..." : "🚀 Generate Quiz"}
              </button>
              {loading && (
                <div className="flex items-center gap-2 quiz-timer">
                  <span>{timer} seconds</span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="quiz-info-box quiz-info-error">
                <p>{error}</p>
              </div>
            )}
            
            {generatedQuizId && (
              <div className="quiz-info-box quiz-info-success">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Quiz Generated Successfully!</h3>
                  <p className="mb-4">
                    Your quiz has been created and saved. You should be redirected automatically...
                  </p>
                  <Link 
                    href={`/quiz-maker/play/${generatedQuizId}`}
                    className="quiz-btn quiz-btn-success"
                  >
                    Play Your Quiz Now →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>✨ Powered by Claude AI • Unlimited quiz possibilities</p>
        </div>
      </main>
    </div>
  );
}