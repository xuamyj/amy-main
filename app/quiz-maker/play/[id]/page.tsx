"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function PlayQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<SavedQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz-data/${quizId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quiz');
      }

      setQuiz(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerId: number) => {
    const newAnswers = {
      ...answers,
      [currentQuestionIndex]: answerId
    };
    setAnswers(newAnswers);
    
    // Save answers to sessionStorage so they persist to results page
    sessionStorage.setItem(`quiz-answers-${quizId}`, JSON.stringify(newAnswers));
  };

  const handleNext = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.quiz_data.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    if (!quiz) return null;

    const scores: Record<number, number> = {};
    
    // Initialize scores
    quiz.quiz_data.results.forEach(result => {
      scores[result.id] = 0;
    });

    // Calculate scores based on answers
    Object.entries(answers).forEach(([questionIndex, answerId]) => {
      const question = quiz.quiz_data.questions[parseInt(questionIndex)];
      const answer = question.answers.find(a => a.id === answerId);
      
      if (answer) {
        Object.entries(answer.points).forEach(([resultId, points]) => {
          scores[parseInt(resultId)] = (scores[parseInt(resultId)] || 0) + points;
        });
      }
    });

    // Find the result with the highest score
    const maxScore = Math.max(...Object.values(scores));
    const winningResultId = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
    const winningResult = quiz.quiz_data.results.find(r => r.id === parseInt(winningResultId || '0'));

    return {
      winningResult,
      scores,
      totalQuestions: quiz.quiz_data.questions.length,
      answeredQuestions: Object.keys(answers).length
    };
  };

  const results = showResults ? calculateResults() : null;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-bold">Loading Quiz...</h1>
        </main>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-bold">Quiz Not Found</h1>
          <p className="text-red-600">{error || 'Quiz could not be loaded'}</p>
          <button 
            onClick={() => router.push('/quiz-maker/play')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-fit"
          >
            ← Back to Quiz List
          </button>
        </main>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
        <main className="flex-1 flex flex-col gap-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => router.push('/quiz-maker/play')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ← Back to Quiz List
            </button>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Your Result!</h1>
            <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
              <h2 className="text-2xl font-semibold text-blue-800 mb-2">
                {results.winningResult?.name || 'Unknown Result'}
              </h2>
              <p className="text-lg text-blue-700">
                {results.winningResult?.description || 'No description available'}
              </p>
            </div>
            
            <button 
              onClick={() => router.push(`/quiz-maker/play/${quizId}/results`)}
              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 text-lg"
            >
              Show score breakdown?
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = quiz.quiz_data.questions[currentQuestionIndex];
  const selectedAnswerId = answers[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.quiz_data.questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col gap-20 max-w-4xl px-3">
      <main className="flex-1 flex flex-col gap-6">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => router.push('/quiz-maker/play')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            ← Back to Quiz List
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              Live a day as {quiz.scenario} and we'll tell you {quiz.outcome}
            </h1>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} of {quiz.quiz_data.questions.length}
        </p>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">{currentQuestion.question}</h2>
          
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <button
                key={answer.id}
                onClick={() => handleAnswerSelect(answer.id)}
                className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                  selectedAnswerId === answer.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {answer.text}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={selectedAnswerId === undefined}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              {currentQuestionIndex === quiz.quiz_data.questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}