import React, { useState } from "react";
import { MapPin, X, Map } from "lucide-react";

// Uses OpenStreetMap static tiles via iframe — no npm package required
const TicketMapView = ({ tickets }) => {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const ticketsWithCoords = tickets.filter(
    (t) => t.coordinates?.lat && t.coordinates?.lng
  );

  if (ticketsWithCoords.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 text-center">
        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
          <Map size={28} className="text-indigo-300" />
        </div>
        <p className="text-gray-500 font-medium">No tickets have location coordinates yet.</p>
        <p className="text-xs text-gray-400 mt-1">Enable location when creating a ticket to see it here.</p>
      </div>
    );
  }

  // Center map on first ticket
  const center = ticketsWithCoords[0].coordinates;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.05}%2C${center.lat - 0.05}%2C${center.lng + 0.05}%2C${center.lat + 0.05}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-sm">
      {/* Map iframe */}
      <div className="relative h-72">
        <iframe
          title="Lost & Found Map"
          src={mapUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />
        {/* Ticket pins overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {ticketsWithCoords.map((ticket) => (
            <button
              key={ticket._id}
              onClick={() => setSelectedTicket(ticket._id === selectedTicket?._id ? null : ticket)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md transition-all ${
                ticket.status === "Resolved"
                  ? "bg-green-500/90 text-white"
                  : "bg-rose-500/90 text-white"
              }`}
            >
              <MapPin size={12} />
              {ticket.itemName}
            </button>
          ))}
        </div>
      </div>

      {/* Selected ticket detail */}
      {selectedTicket && (
        <div className="p-4 border-t border-gray-100 flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-gray-800">{selectedTicket.itemName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              <MapPin size={11} className="inline mr-1 text-indigo-400" />
              {selectedTicket.location}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(selectedTicket.tags || []).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketMapView;
