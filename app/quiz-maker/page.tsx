"use client";

import { useState, useEffect, useRef } from "react";

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

export default function QuizMakerPage() {
  const [scenario, setScenario] = useState("");
  const [outcome, setOutcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
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
    setQuizData(null);

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

      setQuizData(data);

      // Save the quiz data to Supabase
      try {
        await fetch('/api/quiz-data', {
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
        // Note: We don't need to handle the save response for UI purposes
        // The quiz data is already displayed. Save errors are logged server-side.
      } catch (saveErr) {
        // Silent failure for save - the generation still worked
        console.warn('Failed to save quiz data:', saveErr);
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
          
          {quizData && (
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-bold">Generated Quiz</h3>
              
              <div>
                <h4 className="text-lg font-semibold mb-2">Possible Results:</h4>
                {quizData.results.map((result) => (
                  <div key={result.id} className="mb-2">
                    <strong>{result.name}:</strong> {result.description}
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Questions:</h4>
                {quizData.questions.map((question) => (
                  <div key={question.id} className="mb-6 p-4 border border-gray-200 rounded">
                    <h5 className="font-medium mb-3">Q{question.id}: {question.question}</h5>
                    <div className="space-y-2">
                      {question.answers.map((answer) => (
                        <div key={answer.id} className="pl-4">
                          <div className="font-medium">{answer.text}</div>
                          <div className="text-sm text-gray-600">
                            Points: {Object.entries(answer.points).map(([resultId, points]) => {
                              const resultName = quizData.results.find(r => r.id === parseInt(resultId))?.name || `Result ${resultId}`;
                              return `${resultName}: ${points}`;
                            }).join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}