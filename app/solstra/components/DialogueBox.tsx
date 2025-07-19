"use client";

import CharacterName from "./CharacterName";

interface DialogueBoxProps {
  characterName: string;
  text: string;
  onDismiss: () => void;
}

export default function DialogueBox({ characterName, text, onDismiss }: DialogueBoxProps) {
  const handleOverlayClick = () => {
    onDismiss();
  };

  const handleContentClick = () => {
    onDismiss();
  };

  // Process text to italicize underscored sections
  const processText = (text: string) => {
    const parts = text.split(/(_[^_]+_)/g);
    return parts.map((part, index) => {
      if (part.startsWith('_') && part.endsWith('_')) {
        const content = part.slice(1, -1); // Remove the underscores
        return <em key={index}>{content}</em>;
      }
      return part;
    });
  };

  return (
    <div className="solstra-dialogue-overlay" onClick={handleOverlayClick}>
      <div className="solstra-dialogue-box" onClick={handleContentClick}>
        <div className="solstra-dialogue-character-name">
          <CharacterName name={characterName} />
        </div>
        <div className="solstra-dialogue-text">
          "{processText(text)}"
        </div>
        <div className="solstra-dialogue-hint">
          Tap anywhere to continue
        </div>
      </div>
    </div>
  );
}