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
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setImportMessage(null);
    } else {
      setCsvFile(null);
      setImportMessage({ type: "error", text: "Please select a valid CSV file." });
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const entries = [];
    
    // Map CSV knowledge levels to our format
    const knowledgeLevelMap: { [key: string]: string } = {
      'M': 'Moderate know',
      'F': 'Full know', 
      'A': 'Almost full or with errors',
      'R': 'Recent touch'
    };
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      if (values.length >= 5) {
        const wordType = values[3].toLowerCase();
        const knowledgeLevel = knowledgeLevelMap[values[4]] || 'Moderate know';
        
        entries.push({
          english_word: values[0],
          greek_word: values[1],
          transliteration: values[2],
          word_type: wordTypes.includes(wordType) ? wordType : 'other',
          knowledge_level: knowledgeLevel
        });
      }
    }
    return entries;
  };

  const handleImportCSV = async () => {
    if (!csvFile) return;
    
    setIsImporting(true);
    setImportMessage(null);
    
    try {
      const csvText = await csvFile.text();
      const entries = parseCSV(csvText);
      
      if (entries.length === 0) {
        setImportMessage({ type: "error", text: "No valid entries found in CSV file." });
        setIsImporting(false);
        return;
      }
      
      // Import entries one by one
      let successCount = 0;
      let errorCount = 0;
      
      for (const entry of entries) {
        try {
          const response = await fetch('/api/greek-vocabulary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(entry),
          });
          
          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }
      
      setImportMessage({ 
        type: successCount > 0 ? "success" : "error", 
        text: `Import complete! ${successCount} words added successfully. ${errorCount > 0 ? `${errorCount} errors.` : ''}` 
      });
      
      if (successCount > 0) {
        setCsvFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      setImportMessage({ type: "error", text: "Error reading CSV file." });
    } finally {
      setIsImporting(false);
    }
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
            <li>• Greek text will display in a regular font for better readability</li>
          </ul>
        </div>
      </div>

      {/* CSV Import Section */}
      <div className="greek-card">
        <h2 className="greek-header-section mb-6">Import from CSV</h2>
        <p className="greek-text text-gray-600 mb-4">
          Upload a CSV file to import multiple words at once. Your CSV should have columns: English, Greek, Transliteration, Word Type, Knowledge Level.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="greek-text font-medium block mb-2">Select CSV File</label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg greek-text"
            />
            {csvFile && (
              <p className="greek-text-sm text-green-600 mt-1">
                Selected: {csvFile.name}
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleImportCSV}
              disabled={!csvFile || isImporting}
              className="greek-btn"
            >
              {isImporting ? "Importing..." : "Import CSV"}
            </button>
            <button
              onClick={() => {
                setCsvFile(null);
                setImportMessage(null);
                const fileInput = document.getElementById('csv-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }}
              className="greek-btn-gray"
            >
              Clear
            </button>
          </div>
          
          {importMessage && (
            <div className={`p-4 rounded-lg ${
              importMessage.type === "success" 
                ? "text-white border" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
            style={importMessage.type === "success" ? {
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              borderColor: "#047857"
            } : {}}
            >
              {importMessage.text}
            </div>
          )}
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="greek-text font-medium mb-2">CSV Format Requirements:</h4>
            <ul className="greek-text-sm text-gray-600 space-y-1">
              <li>• <strong>Header row:</strong> English,Greek,Transliteration,Word Type,Knowledge Level</li>
              <li>• <strong>Word Type:</strong> noun, verb, adjective, adverb, number, or other</li>
              <li>• <strong>Knowledge Level:</strong> M (Moderate), F (Full), A (Almost full), R (Recent)</li>
              <li>• <strong>Example row:</strong> I see,βλέπω,vlépo,verb,M</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}