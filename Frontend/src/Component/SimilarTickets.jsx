import React, { useMemo } from "react";
import { Sparkles, MapPin, Calendar, User, MessageCircle } from "lucide-react";

// Compute similarity score between a source ticket and candidate tickets
const getSimilarTickets = (source, allTickets, limit = 3) => {
  if (!source) return [];

  return allTickets
    .filter((t) => t._id !== source._id && t.status !== "Resolved")
    .map((candidate) => {
      let score = 0;

      // Category match = high weight
      if (candidate.category === source.category) score += 5;

      // Tags overlap
      const sourceTags = new Set(source.tags || []);
      (candidate.tags || []).forEach((tag) => {
        if (sourceTags.has(tag)) score += 2;
      });

      // Description keyword overlap
      const sourceWords = new Set(
        (source.description || "").toLowerCase().split(/\s+/).filter((w) => w.length > 3)
      );
      (candidate.description || "").toLowerCase().split(/\s+/).forEach((w) => {
        if (w.length > 3 && sourceWords.has(w)) score += 1;
      });

      // Item name word overlap
      const sourceNameWords = new Set(
        (source.itemName || "").toLowerCase().split(/\s+/).filter((w) => w.length > 2)
      );
      (candidate.itemName || "").toLowerCase().split(/\s+/).forEach((w) => {
        if (w.length > 2 && sourceNameWords.has(w)) score += 3;
      });

      return { ...candidate, _score: score };
    })
    .filter((t) => t._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
};

const SimilarTickets = ({ sourceTicket, allTickets, onContactOwner }) => {
  const similar = useMemo(
    () => getSimilarTickets(sourceTicket, allTickets),
    [sourceTicket, allTickets]
  );

  if (!sourceTicket || similar.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={13} className="text-purple-500" />
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">
          Similar Items
        </span>
      </div>
      <div className="space-y-2">
        {similar.map((t) => (
          <div
            key={t._id}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/60"
          >
            {t.image ? (
              <img
                src={t.image}
                alt={t.itemName}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 text-lg">?</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{t.itemName}</p>
              <p className="text-xs text-gray-500 truncate">
                <MapPin size={10} className="inline mr-0.5 text-indigo-400" />
                {t.location}
              </p>
            </div>
            <button
              onClick={() => onContactOwner(t)}
              className="flex-shrink-0 p-1.5 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
              title="Contact owner"
            >
              <MessageCircle size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarTickets;
