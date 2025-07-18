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
      <div className="flex-1 flex flex-col gap-8 max-w-4xl px-6 py-8">
        <main className="flex-1 flex flex-col gap-8">
          <div className="quiz-card quiz-loading text-center py-12">
            <h1>Loading Quiz...</h1>
          </div>
        </main>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex-1 flex flex-col gap-8 max-w-4xl px-6 py-8">
        <main className="flex-1 flex flex-col gap-8">
          <div className="text-center">
            <h1>Quiz Not Found</h1>
          </div>
          <div className="quiz-info-box quiz-info-error text-center">
            <p className="mb-4">{error || 'Quiz could not be loaded'}</p>
            <button 
              onClick={() => router.push('/quiz-maker')}
              className="quiz-btn quiz-btn-secondary"
            >
              ← Back to Quiz List
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="flex-1 flex flex-col gap-8 max-w-5xl px-6 py-8">
        <main className="flex-1 flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/quiz-maker')}
              className="quiz-btn quiz-btn-secondary"
            >
              ← Back to Quiz List
            </button>
          </div>

          <div className="space-y-8">
            <div className="text-center space-y-6">
              <h1>Your Result!</h1>
              <div className="quiz-result-card max-w-2xl mx-auto">
                <h2 className="quiz-result-title mb-4">
                  {results.winningResult?.name || 'Unknown Result'}
                </h2>
                <p className="quiz-result-description">
                  {results.winningResult?.description || 'No description available'}
                </p>
              </div>
              
              <button 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="quiz-btn quiz-btn-secondary text-lg"
              >
                {showBreakdown ? 'Hide score breakdown' : 'Show score breakdown?'}
              </button>
            </div>

            {showBreakdown && (
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800">Score Breakdown</h3>
                </div>
                
                <div className="quiz-card">
                  <h4 className="text-lg font-semibold mb-4">Final Scores:</h4>
                  <div className="space-y-3">
                    {quiz.quiz_data.results.map(result => (
                      <div 
                        key={result.id} 
                        className={`quiz-score-item ${results.winningResult?.id === result.id ? 'winner' : ''}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{result.name}</span>
                          <span className="text-lg font-bold">
                            {results.scores[result.id] || 0} points
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="quiz-card">
                  <h4 className="text-lg font-semibold mb-6">Answer by Answer Breakdown:</h4>
                  <div className="space-y-4">
                    {results.answerBreakdown.map((item, index) => (
                      <div key={index} className="quiz-card bg-white/50 border border-gray-100">
                        <h5 className="font-semibold text-gray-800 mb-2">
                          Q{index + 1}: {item.question}
                        </h5>
                        <p className="text-blue-600 font-medium mb-2">
                          Your answer: {item.selectedAnswer}
                        </p>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Points awarded: </span>
                          {Object.entries(item.pointsAwarded).map(([result, points]) => 
                            `${result}: +${points}`
                          ).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
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
    <div className="flex-1 flex flex-col gap-8 max-w-4xl px-6 py-8">
      <main className="flex-1 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button 
            onClick={() => router.push('/quiz-maker')}
            className="quiz-btn quiz-btn-secondary"
          >
            ← Back to Quiz List
          </button>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-lg font-semibold text-gray-700">
              Live a day as <span className="text-blue-600">{quiz.scenario}</span> and 
              we'll tell you <span className="text-purple-600">{quiz.outcome}</span>
            </h1>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="quiz-progress-container">
            <div 
              className="quiz-progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-gray-600 font-medium">
            Question {currentQuestionIndex + 1} of {quiz.quiz_data.questions.length}
          </p>
        </div>

        <div className="quiz-question-card">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentQuestion.question}</h2>
            </div>
            
            <div className="space-y-4">
              {currentQuestion.answers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  className={`quiz-answer-option w-full ${
                    selectedAnswerId === answer.id ? 'selected' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      selectedAnswerId === answer.id 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswerId === answer.id && (
                        <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="text-left font-medium">{answer.text}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="quiz-btn quiz-btn-secondary"
              >
                ← Previous
              </button>
              
              <button
                onClick={handleNext}
                disabled={selectedAnswerId === undefined}
                className="quiz-btn quiz-btn-primary"
              >
                {currentQuestionIndex === quiz.quiz_data.questions.length - 1 ? 'Finish Quiz' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}