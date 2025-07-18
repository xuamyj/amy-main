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
  const [showBreakdown, setShowBreakdown] = useState(false);

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
    const answerBreakdown: Array<{
      question: string;
      selectedAnswer: string;
      pointsAwarded: Record<string, number>;
    }> = [];
    
    // Initialize scores
    quiz.quiz_data.results.forEach(result => {
      scores[result.id] = 0;
    });

    // Calculate scores based on answers
    Object.entries(answers).forEach(([questionIndex, answerId]) => {
      const question = quiz.quiz_data.questions[parseInt(questionIndex)];
      const answer = question.answers.find(a => a.id === answerId);
      
      if (answer && question) {
        const pointsForThisAnswer: Record<string, number> = {};
        
        Object.entries(answer.points).forEach(([resultId, points]) => {
          scores[parseInt(resultId)] = (scores[parseInt(resultId)] || 0) + points;
          const resultName = quiz.quiz_data.results.find(r => r.id === parseInt(resultId))?.name || `Result ${resultId}`;
          pointsForThisAnswer[resultName] = points;
        });

        answerBreakdown.push({
          question: question.question,
          selectedAnswer: answer.text,
          pointsAwarded: pointsForThisAnswer
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
      answerBreakdown,
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
              onClick={() => router.push('/quiz-maker')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ← Back to Quiz List
            </button>
          </div>

          <div className="space-y-6">
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
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 text-lg"
              >
                {showBreakdown ? 'Hide score breakdown' : 'Show score breakdown?'}
              </button>
            </div>

            {showBreakdown && (
              <div className="space-y-6 mt-8">
                <h3 className="text-2xl font-bold">Score Breakdown</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">Final Scores:</h4>
                    {quiz.quiz_data.results.map(result => (
                      <div key={result.id} className="flex justify-between p-2 border rounded">
                        <span className={results.winningResult?.id === result.id ? 'font-bold text-blue-600' : ''}>
                          {result.name}
                        </span>
                        <span className={results.winningResult?.id === result.id ? 'font-bold text-blue-600' : ''}>
                          {results.scores[result.id] || 0} points
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Answer by Answer Breakdown:</h4>
                  {results.answerBreakdown.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded space-y-2">
                      <h5 className="font-medium">Q{index + 1}: {item.question}</h5>
                      <p className="text-blue-600">Your answer: {item.selectedAnswer}</p>
                      <div className="text-sm text-gray-600">
                        Points awarded: {Object.entries(item.pointsAwarded).map(([result, points]) => 
                          `${result}: +${points}`
                        ).join(', ')}
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