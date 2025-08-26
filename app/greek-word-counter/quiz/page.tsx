"use client";

import { useState, useEffect } from "react";

type VocabularyEntry = {
  id: number;
  english_word: string;
  greek_word: string;
  transliteration: string;
  word_type: string;
  knowledge_level: string;
};

type QuizQuestion = {
  entry: VocabularyEntry;
  options: string[];
  correctAnswer: string;
  type: 'greek-to-english' | 'english-to-greek';
};

export default function QuizPage() {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const fetchVocabulary = async () => {
    try {
      const response = await fetch('/api/greek-vocabulary');
      if (response.ok) {
        const data = await response.json();
        setVocabulary(data);
      }
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestion = (entries: VocabularyEntry[]): QuizQuestion => {
    // Pick a random entry
    const targetEntry = entries[Math.floor(Math.random() * entries.length)];
    
    // Decide question type (Greek to English or English to Greek)
    const isGreekToEnglish = Math.random() < 0.5;
    
    // Generate wrong answers from other entries
    const otherEntries = entries.filter(e => e.id !== targetEntry.id);
    const wrongAnswers: string[] = [];
    
    while (wrongAnswers.length < 3 && otherEntries.length > 0) {
      const wrongEntry = otherEntries[Math.floor(Math.random() * otherEntries.length)];
      const wrongAnswer = isGreekToEnglish ? wrongEntry.english_word : wrongEntry.greek_word;
      
      if (!wrongAnswers.includes(wrongAnswer)) {
        wrongAnswers.push(wrongAnswer);
      }
      
      // Remove used entry to avoid duplicates
      otherEntries.splice(otherEntries.findIndex(e => e.id === wrongEntry.id), 1);
    }
    
    // Create answer options
    const correctAnswer = isGreekToEnglish ? targetEntry.english_word : targetEntry.greek_word;
    const options = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
    
    return {
      entry: targetEntry,
      options,
      correctAnswer,
      type: isGreekToEnglish ? 'greek-to-english' : 'english-to-greek'
    };
  };

  const startQuiz = () => {
    if (vocabulary.length < 4) return; // Need at least 4 words for multiple choice
    
    setQuizStarted(true);
    setQuestionNumber(1);
    setScore(0);
    setGameComplete(false);
    setCurrentQuestion(generateQuestion(vocabulary));
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    setShowResult(true);
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer("");
    
    if (questionNumber >= totalQuestions) {
      setGameComplete(true);
      setQuizStarted(false);
    } else {
      setQuestionNumber(questionNumber + 1);
      setCurrentQuestion(generateQuestion(vocabulary));
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setGameComplete(false);
    setCurrentQuestion(null);
    setQuestionNumber(0);
    setScore(0);
    setSelectedAnswer("");
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="greek-content w-full max-w-4xl mx-auto p-6">
        <div className="greek-header-main mb-8">
          <h1>Random Word Quiz</h1>
          <p className="greek-text mt-2">Loading your vocabulary...</p>
        </div>
      </div>
    );
  }

  if (vocabulary.length < 4) {
    return (
      <div className="greek-content w-full max-w-4xl mx-auto p-6">
        <div className="greek-header-main mb-8">
          <h1>Random Word Quiz</h1>
          <p className="greek-text mt-2">Test your Greek vocabulary knowledge!</p>
        </div>
        <div className="greek-card">
          <div className="text-center py-16">
            <div className="greek-text-lg text-gray-500 mb-4">🤔</div>
            <h2 className="greek-header-section text-gray-600 mb-2">Not Enough Words</h2>
            <p className="greek-text text-gray-500">
              You need at least 4 vocabulary entries to take the quiz. Add more words first!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="greek-content w-full max-w-4xl mx-auto p-6">
      <div className="greek-header-main mb-8">
        <h1>Random Word Quiz</h1>
        <p className="greek-text mt-2">
          Test your Greek vocabulary knowledge with random questions!
        </p>
      </div>

      {!quizStarted && !gameComplete && (
        <div className="greek-card">
          <div className="text-center py-16">
            <div className="greek-text-lg text-blue-600 mb-4">🎯</div>
            <h2 className="greek-header-section mb-4">Ready to Start?</h2>
            <p className="greek-text mb-6">
              You have {vocabulary.length} words in your vocabulary. The quiz will ask you {totalQuestions} random questions.
            </p>
            <div className="space-y-4">
              <div>
                <label className="greek-text font-medium block mb-2">Number of Questions:</label>
                <select
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg greek-text"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>
              <button
                onClick={startQuiz}
                className="greek-btn"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {quizStarted && currentQuestion && (
        <div className="greek-card">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="greek-text font-medium">Question {questionNumber} of {totalQuestions}</span>
              <span className="greek-text font-medium">Score: {score}/{questionNumber - 1}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="greek-header-section mb-4">
              {currentQuestion.type === 'greek-to-english' ? 'What does this Greek word mean?' : 'How do you say this in Greek?'}
            </h3>
            <div className="text-2xl font-bold mb-6" style={{ 
              fontFamily: currentQuestion.type === 'greek-to-english' ? 'serif' : 'inherit' 
            }}>
              {currentQuestion.type === 'greek-to-english' 
                ? currentQuestion.entry.greek_word 
                : currentQuestion.entry.english_word}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && setSelectedAnswer(option)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  showResult
                    ? option === currentQuestion.correctAnswer
                      ? 'bg-green-100 border-green-500 text-green-800'
                      : option === selectedAnswer && option !== currentQuestion.correctAnswer
                      ? 'bg-red-100 border-red-500 text-red-800'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                    : selectedAnswer === option
                    ? 'bg-blue-100 border-blue-500 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-800 hover:border-blue-300 hover:bg-blue-50'
                }`}
                style={{ fontFamily: currentQuestion.type === 'english-to-greek' ? 'serif' : 'inherit' }}
              >
                {option}
              </button>
            ))}
          </div>

          {!showResult ? (
            <div className="text-center">
              <button
                onClick={submitAnswer}
                disabled={!selectedAnswer}
                className="greek-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className={`text-lg font-medium mb-2 ${
                selectedAnswer === currentQuestion.correctAnswer ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              <div className="greek-text-sm text-gray-600">
                <strong>Transliteration:</strong> {currentQuestion.entry.transliteration}
              </div>
            </div>
          )}
        </div>
      )}

      {gameComplete && (
        <div className="greek-card">
          <div className="text-center py-16">
            <div className="text-4xl mb-4">
              {score >= totalQuestions * 0.8 ? '🎉' : score >= totalQuestions * 0.6 ? '👏' : '📚'}
            </div>
            <h2 className="greek-header-section mb-4">Quiz Complete!</h2>
            <div className="text-2xl font-bold mb-4 text-blue-600">
              {score} / {totalQuestions}
            </div>
            <p className="greek-text mb-6">
              {score >= totalQuestions * 0.8 
                ? "Excellent work! You know your Greek vocabulary well!"
                : score >= totalQuestions * 0.6 
                ? "Good job! Keep practicing to improve further."
                : "Keep studying! Every step forward is progress."}
            </p>
            <div className="space-x-3">
              <button onClick={startQuiz} className="greek-btn">
                Take Another Quiz
              </button>
              <button onClick={resetQuiz} className="greek-btn-gray">
                Back to Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}