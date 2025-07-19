"use client";

interface InventorySelectionModalProps {
  inventory: { item_name: string; count: number; received_from: string }[];
  onSelectItem: (itemName: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function InventorySelectionModal({ 
  inventory, 
  onSelectItem, 
  onCancel,
  isLoading = false 
}: InventorySelectionModalProps) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleItemClick = (itemName: string) => {
    if (!isLoading) {
      onSelectItem(itemName);
    }
  };

  return (
    <div className="solstra-inventory-modal" onClick={handleOverlayClick}>
      <div className="solstra-inventory-modal-content">
        <h2 className="solstra-inventory-modal-title">
          What do you want to feed Solis?
        </h2>
        
        {inventory.length === 0 ? (
          <div className="text-center py-8">
            <p className="solstra-text mb-4">
              You don't have any items to feed Solis!
            </p>
            <p className="solstra-text-sm">
              Visit the Town to harvest items from villagers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            {inventory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item.item_name)}
                disabled={isLoading}
                className="solstra-inventory-item-button"
              >
                <div className="solstra-text-sm mb-1">
                  <strong>{item.item_name}</strong>
                  <span className="solstra-food-count">
                    {item.count > 1 && ` x ${item.count}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
        
        <div className="text-center">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="solstra-btn-small"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}