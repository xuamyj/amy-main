"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SavedQuiz {
  id: number;
  scenario: string;
  outcome: string;
  created_at: string;
  starred: boolean | null;
}

export default function QuizMakerHomePage() {
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

  const toggleStar = async (quizId: number, currentStarred: boolean | null) => {
    try {
      const response = await fetch(`/api/quiz-data/${quizId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ starred: currentStarred !== true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz');
      }

      // Optimistically update the UI
      setSavedQuizzes(prevQuizzes =>
        prevQuizzes.map(quiz =>
          quiz.id === quizId ? { ...quiz, starred: currentStarred !== true } : quiz
        )
      );
    } catch (err) {
      console.error('Error toggling star:', err);
      // You could add a toast notification here
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
      <div className="flex-1 flex flex-col gap-8 max-w-5xl px-6 py-8">
        <main className="flex-1 flex flex-col gap-8">
          <h1>Quiz Maker</h1>
          <div className="quiz-card quiz-loading">
            <p className="text-gray-600">Loading your quizzes...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col gap-8 max-w-5xl px-6 py-8">
        <main className="flex-1 flex flex-col gap-8">
          <h1>Quiz Maker</h1>
          <div className="quiz-info-box quiz-info-error">
            <p>Error: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-8 max-w-5xl px-6 py-8">
      <main className="flex-1 flex flex-col gap-8">
        <div className="text-center">
          <h1>Welcome to Quiz Maker!</h1>
          <p className="text-gray-600 mt-2 text-lg">Create, play, and share personality quizzes</p>
        </div>
        
        <div className="quiz-info-box quiz-info-primary">
          <p className="mb-4 text-lg">Want to generate your own quiz?</p>
          <Link href="/quiz-maker/generate" className="quiz-btn quiz-btn-primary">
            🚀 Go to Generate Quiz
          </Link>
        </div>
        
        <div className="space-y-6">
          {savedQuizzes.length === 0 ? (
            <div className="quiz-card text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No quizzes yet!</h3>
              <p className="text-gray-600 mb-6">Generate your first quiz to get started</p>
              <Link href="/quiz-maker/generate" className="quiz-btn quiz-btn-primary">
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <>
              {(() => {
                const starredQuizzes = savedQuizzes.filter(quiz => quiz.starred === true);
                const unstarredQuizzes = savedQuizzes.filter(quiz => quiz.starred !== true);

                return (
                  <>
                    {starredQuizzes.length > 0 && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">⭐ Starred Quizzes</h2>
                          <p className="text-gray-600">Your favorite quizzes:</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {starredQuizzes.map((quiz) => (
                            <div key={quiz.id} className="quiz-card quiz-card-interactive quiz-list-item group relative">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleStar(quiz.id, quiz.starred);
                                }}
                                className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform quiz-star-btn"
                                title="Unstar this quiz"
                              >
                                ⭐
                              </button>
                              <Link href={`/quiz-maker/play/${quiz.id}`} className="flex-1 min-w-0 block pr-10">
                                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                  Live a day as <span className="text-blue-600">{quiz.scenario}</span>
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                  and we'll tell you <span className="text-purple-600 font-medium">{quiz.outcome}</span>
                                </p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <span>{formatDate(quiz.created_at)}</span>
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {unstarredQuizzes.length > 0 && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Quizzes</h2>
                          <p className="text-gray-600">Choose a quiz to play:</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {unstarredQuizzes.map((quiz) => (
                            <div key={quiz.id} className="quiz-card quiz-card-interactive quiz-list-item group relative">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleStar(quiz.id, quiz.starred);
                                }}
                                className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform quiz-star-btn"
                                title="Star this quiz"
                              >
                                ☆
                              </button>
                              <Link href={`/quiz-maker/play/${quiz.id}`} className="flex-1 min-w-0 block pr-10">
                                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                  Live a day as <span className="text-blue-600">{quiz.scenario}</span>
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                  and we'll tell you <span className="text-purple-600 font-medium">{quiz.outcome}</span>
                                </p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <span>{formatDate(quiz.created_at)}</span>
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}