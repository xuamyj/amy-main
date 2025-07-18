"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SavedQuiz {
  id: number;
  scenario: string;
  outcome: string;
  created_at: string;
}

export default function PlayPage() {
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedQuizzes();
  }, []);

  const fetchSavedQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz-data');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch saved quizzes');
      }

      setSavedQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-bold">Play Quiz</h1>
          <p>Loading available quizzes...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-bold">Play Quiz</h1>
          <p className="text-red-600">Error: {error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
      <main className="flex-1 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Play Quiz</h1>
        
        <div className="space-y-4">
          {savedQuizzes.length === 0 ? (
            <p className="text-gray-600">No quizzes available yet. Generate some quizzes first!</p>
          ) : (
            <>
              <p className="text-gray-600">Choose a quiz to play:</p>
              <div className="space-y-3">
                {savedQuizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/quiz-maker/play/${quiz.id}`}
                    className="block p-4 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium">
                      Live a day as <span className="text-blue-600">{quiz.scenario}</span> and 
                      we'll tell you <span className="text-blue-600">{quiz.outcome}</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Created on {formatDate(quiz.created_at)}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}