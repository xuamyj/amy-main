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
    <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
      <main className="flex-1 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Generate your own quiz!</h1>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl">Live a day as</h2>
            <input 
              type="text" 
              placeholder="ex. a bird"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 flex-1 max-w-xs"
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <h2 className="text-xl">and we'll tell you</h2>
            <input 
              type="text" 
              placeholder="ex. what your next hobby should be!"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 flex-1 max-w-xs"
              disabled={loading}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-fit disabled:bg-gray-400"
            >
              {loading ? "Generating..." : "Go"}
            </button>
            {loading && (
              <p className="text-gray-500 text-sm">{timer} seconds</p>
            )}
          </div>
          
          {error && (
            <p className="text-red-600">{error}</p>
          )}
          
          {generatedQuizId && (
            <div className="mt-6 p-4 border border-green-200 rounded bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Quiz Generated Successfully! 🎉</h3>
              <p className="text-green-700 mb-3">
                Your quiz has been created and saved. You should be redirected automatically...
              </p>
              <Link 
                href={`/quiz-maker/play/${generatedQuizId}`}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
              >
                Play Your Quiz Now →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}