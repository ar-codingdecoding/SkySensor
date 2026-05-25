import React from "react";
import { SearchHistoryItem } from "../types/weather";
import { History, Trash2, MapPin } from "lucide-react";

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelect: (item: SearchHistoryItem) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onSelect,
  onRemove,
  onClearAll,
}) => {
  if (history.length === 0) {
    return (
      <div className="history-empty --flex-center">
        <History size={16} className="--mr" style={{ opacity: 0.6 }} />
        <span className="--text-sm">No search history yet. Try searching a city!</span>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header --flex-between --mb">
        <div className="history-title --flex-center">
          <History size={14} className="--mr" style={{ color: "var(--color-primary)" }} />
          <h4 className="--text-sm --fw-bold" style={{ margin: 0 }}>Recent Searches</h4>
        </div>
        <button
          className="clear-all-btn --text-sm"
          onClick={onClearAll}
          style={{
            background: "none",
            border: "none",
            color: "var(--clear-btn-color)",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Clear All
        </button>
      </div>
      <div className="history-list">
        {history.map((item) => (
          <div key={item.id} className="history-item --flex-between --my">
            <button
              className="history-select-btn --flex-center"
              onClick={() => onSelect(item)}
              title={`Search weather for ${item.name}`}
            >
              <MapPin size={12} className="--mr" />
              <span className="--text-sm">
                {item.name}, {item.country}
              </span>
            </button>
            <button
              className="history-remove-btn --flex-center"
              onClick={() => onRemove(item.id)}
              title="Remove from history"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
