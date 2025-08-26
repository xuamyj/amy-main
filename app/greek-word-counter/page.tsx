"use client";

import { useState, useEffect } from "react";

type VocabularyEntry = {
  id: number;
  user_id: string;
  english_word: string;
  greek_word: string;
  transliteration: string;
  word_type: string;
  knowledge_level: string;
  created_at: string;
  updated_at: string;
};

export default function GreekWordsPage() {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchGreek, setSearchGreek] = useState("");
  const [searchEnglish, setSearchEnglish] = useState("");
  const [searchTransliteration, setSearchTransliteration] = useState("");
  const [filteredVocabulary, setFilteredVocabulary] = useState<VocabularyEntry[]>([]);

  // Fetch vocabulary from API
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const response = await fetch('/api/greek-vocabulary');
        if (!response.ok) {
          throw new Error('Failed to fetch vocabulary');
        }
        const data = await response.json();
        setVocabulary(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setVocabulary([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVocabulary();
  }, []);

  useEffect(() => {
    const filtered = vocabulary.filter(entry => 
      entry.greek_word.toLowerCase().includes(searchGreek.toLowerCase()) &&
      entry.english_word.toLowerCase().includes(searchEnglish.toLowerCase()) &&
      entry.transliteration.toLowerCase().includes(searchTransliteration.toLowerCase())
    );
    setFilteredVocabulary(filtered);
  }, [vocabulary, searchGreek, searchEnglish, searchTransliteration]);

  const getKnowledgeColor = (level: string) => {
    switch (level) {
      case "Full know": return "bg-green-100 text-green-800";
      case "Almost full or with errors": return "bg-yellow-100 text-yellow-800";
      case "Moderate know": return "bg-blue-100 text-blue-800";
      case "Recent touch": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getWordTypeColor = (type: string) => {
    switch (type) {
      case "noun": return "bg-purple-50 text-purple-700";
      case "verb": return "bg-green-50 text-green-700";
      case "adjective": return "bg-blue-50 text-blue-700";
      case "adverb": return "bg-orange-50 text-orange-700";
      case "number": return "bg-pink-50 text-pink-700";
      case "other": return "bg-gray-50 text-gray-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="greek-content w-full max-w-6xl mx-auto p-6">
        <div className="greek-header-main mb-8">
          <h1>Greek Words</h1>
          <p className="greek-text mt-2">Loading your vocabulary...</p>
        </div>
        <div className="greek-card">
          <div className="text-center py-16">
            <div className="greek-loading">
              <div className="greek-text-lg">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="greek-content w-full max-w-6xl mx-auto p-6">
        <div className="greek-header-main mb-8">
          <h1>Greek Words</h1>
          <p className="greek-text mt-2">Error loading vocabulary</p>
        </div>
        <div className="greek-card">
          <div className="text-center py-16">
            <div className="greek-text text-red-600 mb-4">Error: {error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="greek-btn"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="greek-content w-full max-w-6xl mx-auto p-6">
      <div className="greek-header-main mb-8">
        <h1>Greek Words</h1>
        <p className="greek-text mt-2">
          Your personal Greek vocabulary collection. You know {vocabulary.length} words so far!
        </p>
      </div>

      <div className="greek-card mb-6">
        <h2 className="greek-header-section mb-4">Search Your Vocabulary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="greek-text-sm font-medium block mb-1">Search Greek:</label>
            <input
              type="text"
              value={searchGreek}
              onChange={(e) => setSearchGreek(e.target.value)}
              placeholder="βλέπω, σπίτι..."
              className="w-full p-3 border border-gray-300 rounded-lg greek-text"
              style={{ fontFamily: 'serif' }}
            />
          </div>
          <div>
            <label className="greek-text-sm font-medium block mb-1">Search English:</label>
            <input
              type="text"
              value={searchEnglish}
              onChange={(e) => setSearchEnglish(e.target.value)}
              placeholder="I see, the house..."
              className="w-full p-3 border border-gray-300 rounded-lg greek-text"
            />
          </div>
          <div>
            <label className="greek-text-sm font-medium block mb-1">Search Transliteration:</label>
            <input
              type="text"
              value={searchTransliteration}
              onChange={(e) => setSearchTransliteration(e.target.value)}
              placeholder="vlépo, spíti..."
              className="w-full p-3 border border-gray-300 rounded-lg greek-text"
            />
          </div>
        </div>
      </div>

      <div className="greek-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="greek-header-section">Vocabulary ({filteredVocabulary.length} words)</h2>
          <div className="greek-text-sm text-gray-600">
            {searchGreek || searchEnglish || searchTransliteration ? 
              `Showing filtered results` : 
              `Showing all words`
            }
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {filteredVocabulary.length > 0 ? (
              filteredVocabulary.map((entry) => (
                <div key={entry.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <div className="greek-text-sm text-gray-500 mb-1">Greek</div>
                      <div className="greek-text font-medium" style={{ fontFamily: 'serif' }}>
                        {entry.greek_word}
                      </div>
                    </div>
                    <div>
                      <div className="greek-text-sm text-gray-500 mb-1">English</div>
                      <div className="greek-text font-medium">
                        {entry.english_word}
                      </div>
                    </div>
                    <div>
                      <div className="greek-text-sm text-gray-500 mb-1">Transliteration</div>
                      <div className="greek-text font-medium">
                        {entry.transliteration}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getWordTypeColor(entry.word_type)}`}>
                        {entry.word_type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getKnowledgeColor(entry.knowledge_level)}`}>
                        {entry.knowledge_level}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 greek-text text-gray-500">
                {vocabulary.length === 0 ? (
                  <div>
                    <p className="mb-2">No vocabulary entries yet!</p>
                    <p>Add your first Greek word using the "Add Words" tab.</p>
                  </div>
                ) : (
                  <p>No words match your search criteria.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}