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
  const [editingEntry, setEditingEntry] = useState<VocabularyEntry | null>(null);
  const [editForm, setEditForm] = useState({
    english_word: "",
    greek_word: "",
    transliteration: "",
    word_type: "",
    knowledge_level: ""
  });
  const [filterWordType, setFilterWordType] = useState<string>("all");
  const [filterKnowledgeLevel, setFilterKnowledgeLevel] = useState<string>("all");
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkKnowledgeLevel, setBulkKnowledgeLevel] = useState<string>("");

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
      entry.transliteration.toLowerCase().includes(searchTransliteration.toLowerCase()) &&
      (filterWordType === "all" || entry.word_type === filterWordType) &&
      (filterKnowledgeLevel === "all" || entry.knowledge_level === filterKnowledgeLevel)
    );
    setFilteredVocabulary(filtered);
  }, [vocabulary, searchGreek, searchEnglish, searchTransliteration, filterWordType, filterKnowledgeLevel]);

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

  const handleEditClick = (entry: VocabularyEntry) => {
    setEditingEntry(entry);
    setEditForm({
      english_word: entry.english_word,
      greek_word: entry.greek_word,
      transliteration: entry.transliteration,
      word_type: entry.word_type,
      knowledge_level: entry.knowledge_level
    });
  };

  const handleEditCancel = () => {
    setEditingEntry(null);
    setEditForm({
      english_word: "",
      greek_word: "",
      transliteration: "",
      word_type: "",
      knowledge_level: ""
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      const response = await fetch(`/api/greek-vocabulary/${editingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update word');
      }

      const updatedEntry = await response.json();
      
      // Update the vocabulary list
      setVocabulary(prev => prev.map(entry => 
        entry.id === editingEntry.id ? updatedEntry : entry
      ));
      
      handleEditCancel();
    } catch (error) {
      console.error('Error updating word:', error);
      // You could add error handling UI here
    }
  };

  const wordTypes = ["noun", "verb", "adjective", "adverb", "number", "other"];
  const knowledgeLevels = ["Full know", "Almost full or with errors", "Moderate know", "Recent touch"];

  const exportToCSV = () => {
    if (vocabulary.length === 0) return;

    // Map knowledge levels back to CSV format
    const knowledgeLevelMap: { [key: string]: string } = {
      'Full know': 'F',
      'Almost full or with errors': 'A', 
      'Moderate know': 'M',
      'Recent touch': 'R'
    };

    const headers = ['English', 'Greek', 'Transliteration', 'Word Type', 'Knowledge Level'];
    const csvContent = [
      headers.join(','),
      ...vocabulary.map(entry => [
        entry.english_word,
        entry.greek_word,
        entry.transliteration,
        entry.word_type,
        knowledgeLevelMap[entry.knowledge_level] || 'M'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `greek-vocabulary-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleBulkEditMode = () => {
    setBulkEditMode(!bulkEditMode);
    setSelectedEntries(new Set());
    setBulkKnowledgeLevel("");
  };

  const toggleEntrySelection = (entryId: number) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const selectAllVisible = () => {
    const allVisible = new Set(filteredVocabulary.map(entry => entry.id));
    setSelectedEntries(allVisible);
  };

  const deselectAll = () => {
    setSelectedEntries(new Set());
  };

  const bulkUpdateKnowledge = async () => {
    if (selectedEntries.size === 0 || !bulkKnowledgeLevel) return;

    try {
      const updatePromises = Array.from(selectedEntries).map(entryId =>
        fetch(`/api/greek-vocabulary/${entryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ knowledge_level: bulkKnowledgeLevel }),
        })
      );

      await Promise.all(updatePromises);

      // Update the vocabulary list
      setVocabulary(prev => prev.map(entry => 
        selectedEntries.has(entry.id) 
          ? { ...entry, knowledge_level: bulkKnowledgeLevel }
          : entry
      ));

      // Reset bulk edit state
      setBulkEditMode(false);
      setSelectedEntries(new Set());
      setBulkKnowledgeLevel("");
    } catch (error) {
      console.error('Error bulk updating knowledge levels:', error);
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
        <h2 className="greek-header-section mb-4">Search & Filter Your Vocabulary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="greek-text-sm font-medium block mb-1">Search Greek:</label>
            <input
              type="text"
              value={searchGreek}
              onChange={(e) => setSearchGreek(e.target.value)}
              placeholder="βλέπω, σπίτι..."
              className="w-full p-3 border border-gray-300 rounded-lg greek-text"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="greek-text-sm font-medium block mb-1">Filter by Word Type:</label>
            <select
              value={filterWordType}
              onChange={(e) => setFilterWordType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg greek-text"
            >
              <option value="all">All Word Types</option>
              {wordTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="greek-text-sm font-medium block mb-1">Filter by Knowledge Level:</label>
            <select
              value={filterKnowledgeLevel}
              onChange={(e) => setFilterKnowledgeLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg greek-text"
            >
              <option value="all">All Knowledge Levels</option>
              {knowledgeLevels.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="greek-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="greek-header-section">Vocabulary ({filteredVocabulary.length} words)</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={vocabulary.length === 0}
              className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            >
              Export CSV
            </button>
            <button
              onClick={toggleBulkEditMode}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                bulkEditMode 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {bulkEditMode ? 'Cancel Bulk Edit' : 'Bulk Edit'}
            </button>
          </div>
        </div>

        {bulkEditMode && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="greek-text font-medium">Selected: {selectedEntries.size} words</span>
              <button onClick={selectAllVisible} className="greek-text-sm text-blue-600 hover:text-blue-800">
                Select All Visible
              </button>
              <button onClick={deselectAll} className="greek-text-sm text-blue-600 hover:text-blue-800">
                Deselect All
              </button>
            </div>
            
            {selectedEntries.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="greek-text-sm">Change knowledge level to:</span>
                <select
                  value={bulkKnowledgeLevel}
                  onChange={(e) => setBulkKnowledgeLevel(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded greek-text-sm"
                >
                  <option value="">Select level...</option>
                  {knowledgeLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <button
                  onClick={bulkUpdateKnowledge}
                  disabled={!bulkKnowledgeLevel}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                >
                  Update {selectedEntries.size} Words
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {filteredVocabulary.length > 0 ? (
              filteredVocabulary.map((entry) => (
                <div key={entry.id} className={`p-4 rounded-lg border transition-all ${
                  bulkEditMode && selectedEntries.has(entry.id)
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`grid gap-3 ${bulkEditMode ? 'grid-cols-1 md:grid-cols-6' : 'grid-cols-1 md:grid-cols-5'}`}>
                    {bulkEditMode && (
                      <div className="flex justify-center items-center">
                        <input
                          type="checkbox"
                          checked={selectedEntries.has(entry.id)}
                          onChange={() => toggleEntrySelection(entry.id)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </div>
                    )}
                    <div>
                      <div className="greek-text-sm text-gray-500 mb-1">Greek</div>
                      <div className="greek-text font-medium">
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
                        {entry.word_type.charAt(0).toUpperCase() + entry.word_type.slice(1)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getKnowledgeColor(entry.knowledge_level)}`}>
                        {entry.knowledge_level}
                      </span>
                    </div>
                    {!bulkEditMode && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleEditClick(entry)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    )}
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

      {/* Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 overflow-y-auto flex-1">
            <h3 className="greek-header-section mb-4">Edit Word</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="greek-text font-medium block mb-1">English Word *</label>
                <input
                  type="text"
                  value={editForm.english_word}
                  onChange={(e) => setEditForm(prev => ({ ...prev, english_word: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg greek-text"
                  required
                />
              </div>
              
              <div>
                <label className="greek-text font-medium block mb-1">Greek Word *</label>
                <input
                  type="text"
                  value={editForm.greek_word}
                  onChange={(e) => setEditForm(prev => ({ ...prev, greek_word: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg greek-text"
                  required
                />
              </div>
              
              <div>
                <label className="greek-text font-medium block mb-1">Transliteration *</label>
                <input
                  type="text"
                  value={editForm.transliteration}
                  onChange={(e) => setEditForm(prev => ({ ...prev, transliteration: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg greek-text"
                  required
                />
              </div>
              
              <div>
                <label className="greek-text font-medium block mb-2">Word Type</label>
                <div className="space-y-1">
                  {wordTypes.map(type => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="edit_word_type"
                        value={type}
                        checked={editForm.word_type === type}
                        onChange={(e) => setEditForm(prev => ({ ...prev, word_type: e.target.value }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="greek-text">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="greek-text font-medium block mb-2">Knowledge Level</label>
                <div className="space-y-1">
                  {knowledgeLevels.map(level => (
                    <label key={level} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="edit_knowledge_level"
                        value={level}
                        checked={editForm.knowledge_level === level}
                        onChange={(e) => setEditForm(prev => ({ ...prev, knowledge_level: e.target.value }))}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="greek-text">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="greek-btn flex-1"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="greek-btn-gray flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}