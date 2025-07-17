"use client";

import { useState, useEffect } from "react";

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

interface SavedQuiz {
  id: number;
  scenario: string;
  outcome: string;
  quiz_data: QuizData;
  created_at: string;
}

export default function DataBackupPage() {
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<SavedQuiz | null>(null);
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

  const handleQuizClick = (quiz: SavedQuiz) => {
    setSelectedQuiz(quiz);
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
          <h1 className="text-2xl font-bold">Data Backup</h1>
          <p>Loading your saved quizzes...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-bold">Data Backup</h1>
          <p className="text-red-600">Error: {error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
      <main className="flex-1 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Data Backup</h1>
        
        {selectedQuiz ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedQuiz(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                ← Back to List
              </button>
              <div>
                <h2 className="text-xl font-semibold">
                  Live a day as {selectedQuiz.scenario} and we'll tell you {selectedQuiz.outcome}
                </h2>
                <p className="text-gray-600">Generated on {formatDate(selectedQuiz.created_at)}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold">Generated Quiz</h3>
              
              <div>
                <h4 className="text-lg font-semibold mb-2">Possible Results:</h4>
                {selectedQuiz.quiz_data.results.map((result) => (
                  <div key={result.id} className="mb-2">
                    <strong>{result.name}:</strong> {result.description}
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Questions:</h4>
                {selectedQuiz.quiz_data.questions.map((question) => (
                  <div key={question.id} className="mb-6 p-4 border border-gray-200 rounded">
                    <h5 className="font-medium mb-3">Q{question.id}: {question.question}</h5>
                    <div className="space-y-2">
                      {question.answers.map((answer) => (
                        <div key={answer.id} className="pl-4">
                          <div className="font-medium">{answer.text}</div>
                          <div className="text-sm text-gray-600">
                            Points: {Object.entries(answer.points).map(([resultId, points]) => {
                              const resultName = selectedQuiz.quiz_data.results.find(r => r.id === parseInt(resultId))?.name || `Result ${resultId}`;
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
          </div>
        ) : (
          <div className="space-y-4">
            {savedQuizzes.length === 0 ? (
              <p className="text-gray-600">No saved quizzes yet. Generate some quizzes first!</p>
            ) : (
              <>
                <p className="text-gray-600">Click on any quiz to view the generated data:</p>
                <div className="space-y-3">
                  {savedQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      onClick={() => handleQuizClick(quiz)}
                      className="p-4 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium">
                        Live a day as <span className="text-blue-600">{quiz.scenario}</span> and 
                        we'll tell you <span className="text-blue-600">{quiz.outcome}</span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Generated on {formatDate(quiz.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}