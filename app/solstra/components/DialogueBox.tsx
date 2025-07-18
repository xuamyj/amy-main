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

  return (
    <div className="solstra-dialogue-overlay" onClick={handleOverlayClick}>
      <div className="solstra-dialogue-box" onClick={handleContentClick}>
        <div className="solstra-dialogue-character-name">
          <CharacterName name={characterName} />
        </div>
        <div className="solstra-dialogue-text">
          "{text}"
        </div>
        <div className="solstra-dialogue-hint">
          Tap anywhere to continue
        </div>
      </div>
    </div>
  );
}