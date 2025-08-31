"use client";

import { useState } from "react";

export default function AnalyzeTextPage() {
  const [greekText, setGreekText] = useState("");
  const [wordCount, setWordCount] = useState<{ [key: string]: number }>({});
  const [totalWords, setTotalWords] = useState(0);
  const [uniqueWords, setUniqueWords] = useState(0);

  const analyzeText = () => {
    if (!greekText.trim()) {
      setWordCount({});
      setTotalWords(0);
      setUniqueWords(0);
      return;
    }

    // Split text into words, removing punctuation and converting to lowercase
    const words = greekText
      .toLowerCase()
      .replace(/[.,;:!?·""''"()[\]{}]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const wordFrequency: { [key: string]: number } = {};
    
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    setWordCount(wordFrequency);
    setTotalWords(words.length);
    setUniqueWords(Object.keys(wordFrequency).length);
  };

  const sortedWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);

  return (
    <div className="greek-content w-full max-w-4xl mx-auto p-6">
      <div className="greek-header-main mb-8">
        <h1>Analyze Text</h1>
        <p className="greek-text mt-2">
          Paste Greek text below to analyze word frequency and vocabulary usage.
        </p>
      </div>

      <div className="greek-card mb-6">
        <h2 className="greek-header-section mb-4">Text Input</h2>
        <textarea
          value={greekText}
          onChange={(e) => setGreekText(e.target.value)}
          placeholder="Paste your Greek text here..."
          className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-vertical greek-text"
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={analyzeText}
            className="greek-btn"
          >
            Analyze Text
          </button>
          <button
            onClick={() => {
              setGreekText("");
              setWordCount({});
              setTotalWords(0);
              setUniqueWords(0);
            }}
            className="greek-btn-gray"
          >
            Clear
          </button>
        </div>
      </div>

      {totalWords > 0 && (
        <>
          <div className="greek-card mb-6">
            <h2 className="greek-header-section mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="greek-stat-box">
                <div className="greek-text-lg font-bold">{totalWords}</div>
                <div className="greek-text-sm">Total Words</div>
              </div>
              <div className="greek-stat-box">
                <div className="greek-text-lg font-bold">{uniqueWords}</div>
                <div className="greek-text-sm">Unique Words</div>
              </div>
              <div className="greek-stat-box">
                <div className="greek-text-lg font-bold">
                  {totalWords > 0 ? Math.round((uniqueWords / totalWords) * 100) : 0}%
                </div>
                <div className="greek-text-sm">Vocabulary Density</div>
              </div>
            </div>
          </div>

          <div className="greek-card">
            <h2 className="greek-header-section mb-4">Word Frequency</h2>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {sortedWords.map(([word, count], index) => (
                  <div key={word} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="greek-text-sm text-gray-500 w-8">#{index + 1}</span>
                      <span className="greek-text font-medium">
                        {word}
                      </span>
                    </div>
                    <span className="greek-text-sm font-bold text-blue-600">
                      {count} {count === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}