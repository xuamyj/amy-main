"use client";

interface FeedingModalProps {
  feedingLine: string;
  onDismiss: () => void;
}

export default function FeedingModal({ feedingLine, onDismiss }: FeedingModalProps) {
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
          ✨ You fed Solis! ✨
        </div>
        <div className="solstra-harvest-item">
          {feedingLine}
        </div>
        <div className="solstra-dialogue-hint">
          Tap anywhere to continue
        </div>
      </div>
    </div>
  );
}