"use client";

import { useState } from "react";

export default function AddWordsPage() {
  const [formData, setFormData] = useState({
    english_word: "",
    greek_word: "",
    transliteration: "",
    word_type: "noun",
    knowledge_level: "Moderate know"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const wordTypes = ["noun", "verb", "adjective", "adverb", "number", "other"];
  const knowledgeLevels = ["Full know", "Almost full or with errors", "Moderate know", "Recent touch"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.english_word.trim() || !formData.greek_word.trim() || !formData.transliteration.trim()) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/greek-vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add word');
      }

      const newEntry = await response.json();
      console.log('Word added successfully:', newEntry);
      
      setMessage({ type: "success", text: "Greek word added successfully!" });
      setFormData({
        english_word: "",
        greek_word: "",
        transliteration: "",
        word_type: "noun",
        knowledge_level: "Moderate know"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add word. Please try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      english_word: "",
      greek_word: "",
      transliteration: "",
      word_type: "noun", 
      knowledge_level: "Moderate know"
    });
    setMessage(null);
  };

  return (
    <div className="greek-content w-full max-w-4xl mx-auto p-6">
      <div className="greek-header-main mb-8">
        <h1>Add Words</h1>
        <p className="greek-text mt-2">
          Add new Greek vocabulary words to your personal collection.
        </p>
      </div>

      <div className="greek-card">
        <h2 className="greek-header-section mb-6">New Vocabulary Entry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="greek-text font-medium block mb-1">
              English Word *
            </label>
            <input
              type="text"
              name="english_word"
              value={formData.english_word}
              onChange={handleInputChange}
              placeholder="e.g., I see"
              className="w-full py-0 border border-gray-300 rounded-lg greek-text"
              required
            />
          </div>

          <div>
            <label className="greek-text font-medium block mb-1">
              Greek Word *
            </label>
            <input
              type="text"
              name="greek_word"
              value={formData.greek_word}
              onChange={handleInputChange}
              placeholder="e.g., βλέπω / δω / έβλεπα / είδα"
              className="w-full py-0 border border-gray-300 rounded-lg greek-text"
              style={{ fontFamily: 'serif' }}
              required
            />
          </div>

          <div>
            <label className="greek-text font-medium block mb-1">
              Transliteration *
            </label>
            <input
              type="text"
              name="transliteration"
              value={formData.transliteration}
              onChange={handleInputChange}
              placeholder="e.g., vlépo / δo / évlepa / ída"
              className="w-full py-0 border border-gray-300 rounded-lg greek-text"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="greek-text font-medium block mb-2">
                Word Type
              </label>
              <div className="space-y-1">
                {wordTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="word_type"
                      value={type}
                      checked={formData.word_type === type}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="greek-text">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="greek-text font-medium block mb-2">
                Knowledge Level
              </label>
              <div className="space-y-1">
                {knowledgeLevels.map(level => (
                  <label key={level} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="knowledge_level"
                      value={level}
                      checked={formData.knowledge_level === level}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="greek-text">{level}</span>
                  </label>
                ))}
              </div>
              <p className="greek-text-sm text-gray-500 mt-1">
                How well do you know this word? From most to least confident.
              </p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === "success" 
                ? "text-white border" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
            style={message.type === "success" ? {
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              borderColor: "#047857"
            } : {}}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="greek-btn"
            >
              {isSubmitting ? "Adding..." : "Add Word"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="greek-btn-gray"
            >
              Clear Form
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="greek-text font-medium text-blue-800 mb-2">Tips for Adding Words:</h3>
          <ul className="greek-text-sm text-blue-700 space-y-1">
            <li>• For nouns, remember to include "the __"</li>
            <li>• For verbs, remember to include "I __" or "it __", and multiple forms separated by " / "</li>
            <li>• For adjectives, remember to include neuter, masculine, and feminine separated by " / "</li>
            <li>• Greek text will display in a serif font for better readability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}