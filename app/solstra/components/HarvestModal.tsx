"use client";

interface HarvestModalProps {
  characterName: string;
  item: string;
  onDismiss: () => void;
}

export default function HarvestModal({ characterName, item, onDismiss }: HarvestModalProps) {
  const handleOverlayClick = () => {
    onDismiss();
  };

  const handleContentClick = () => {
    onDismiss();
  };

  return (
    <div className="solstra-harvest-modal" onClick={handleOverlayClick}>
      <div className="solstra-harvest-modal-content" onClick={handleContentClick}>
        <div className="solstra-harvest-title">
          ✨ You received a gift! ✨
        </div>
        <div className="solstra-harvest-item">
          {item}
        </div>
        <div className="text-sm text-gray-600 mb-4">
          From {characterName}
        </div>
        <div className="solstra-harvest-hint">
          Tap anywhere to continue
        </div>
      </div>
    </div>
  );
}