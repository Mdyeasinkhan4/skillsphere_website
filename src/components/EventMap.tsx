import React, { useState } from "react";
import { Calendar, Clock, MapPin, Plus, Star, Users, Check } from "lucide-react";
import { LearningEvent } from "../types.js";

interface EventMapProps {
  events: LearningEvent[];
  onCreateEvent: (event: any) => void;
  onRegisterEvent: (eventId: string) => void;
  loggedInUser: any;
}

export default function EventMap({
  events,
  onCreateEvent,
  onRegisterEvent,
  loggedInUser
}: EventMapProps) {
  // SVG Map dimensions
  const MAP_WIDTH = 500;
  const MAP_HEIGHT = 280;

  // Selected coords on simulator
  const [selectedLat, setSelectedLat] = useState(37.7749);
  const [selectedLng, setSelectedLng] = useState(-122.4194);
  const [mapX, setMapX] = useState(MAP_WIDTH / 2);
  const [mapY, setMapY] = useState(MAP_HEIGHT / 2);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("2026-08-15");
  const [time, setTime] = useState("18:00");
  const [location, setLocation] = useState("");

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMapX(x);
    setMapY(y);

    // Convert screen coordinates back to mock Latitude and Longitude
    const lat = Number((34 + (38.5 - 34) * (1 - y / MAP_HEIGHT)).toFixed(4));
    const lng = Number((-123 + (-118 - -123) * (x / MAP_WIDTH)).toFixed(4));

    setSelectedLat(lat);
    setSelectedLng(lng);

    // Auto-fill venue address mock suggestion
    setLocation(`Co-working Venue (Lat: ${lat}, Lng: ${lng})`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    onCreateEvent({
      title,
      description,
      date,
      time,
      location,
      latitude: selectedLat,
      longitude: selectedLng
    });

    // Reset
    setTitle("");
    setDescription("");
    setLocation("");
  };

  return (
    <div id="event-map" className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-4">
        <h2 className="text-2xl md:text-3xl font-bold font-display text-white">Events Scheduler & Co-working Maps</h2>
        <p className="text-sm text-slate-400">
          Find and host local developer co-working sessions. Click anywhere on our Silicon Valley Co-working Map simulator to capture coordinates and register venues.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Silicon Valley Map Simulator & Form (Map on top, form below or columns) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="font-bold font-display text-white text-base">Co-working Region Selector</h3>

          {/* SVG Map Canvas */}
          <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden cursor-crosshair">
            <svg
              width="100%"
              height="280"
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              onClick={handleMapClick}
              className="text-slate-800 select-none"
            >
              {/* Grid Background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Silicon Valley Vector outlines */}
              <path
                d="M 50,50 Q 150,120 250,50 T 450,150 L 400,250 L 100,250 Z"
                fill="#10b981"
                fillOpacity="0.04"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Bay Area Water outline */}
              <path
                d="M 20,20 Q 120,80 200,40 T 380,100"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeOpacity="0.3"
              />

              {/* Tech Hub Venues circles */}
              <circle cx="120" cy="90" r="6" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="1" />
              <text x="132" y="93" fill="#64748b" fontSize="9" fontWeight="bold">SAN FRANCISCO HUB</text>

              <circle cx="280" cy="180" r="6" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1" />
              <text x="292" y="183" fill="#64748b" fontSize="9" fontWeight="bold">PALO ALTO SPACE</text>

              <circle cx="390" cy="130" r="6" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1" />
              <text x="402" y="133" fill="#64748b" fontSize="9" fontWeight="bold">SAN JOSE INNOVATION</text>

              {/* Existing active event markers */}
              {events.map((evt) => {
                // Map coordinates from standard SV coords
                const x = ((evt.longitude - -123) / (-118 - -123)) * MAP_WIDTH;
                const y = (1 - (evt.latitude - 34) / (38.5 - 34)) * MAP_HEIGHT;
                return (
                  <g key={evt.id} className="animate-bounce">
                    <circle cx={x} cy={y} r="5" fill="#f59e0b" />
                    <circle cx={x} cy={y} r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.5" className="animate-ping" />
                  </g>
                );
              })}

              {/* Selected marker Pinpoint */}
              <g transform={`translate(${mapX}, ${mapY})`}>
                <circle cx="0" cy="0" r="7" fill="#10b981" />
                <path d="M-4,-12 L4,-12 L0,0 Z" fill="#10b981" />
                <circle cx="0" cy="-12" r="3" fill="#ffffff" />
              </g>
            </svg>

            {/* Float values bar */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-slate-400 font-mono border border-slate-800">
              Latitude: {selectedLat} • Longitude: {selectedLng}
            </div>
          </div>

          {/* Form to submit events */}
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next.js Co-working Meetup"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Location Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Click the map above or enter venue details..."
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="sm:col-span-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] cursor-pointer"
            >
              Host Co-working Event
            </button>
          </form>
        </div>

        {/* Event Schedule (listings in right column) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold font-display text-white text-base mb-4">Upcoming Schedule</h3>
            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
              {events.map((evt) => {
                const isRegistered = loggedInUser ? evt.registeredUsers.includes(loggedInUser.id) : false;

                return (
                  <div key={evt.id} className="p-4 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl space-y-3 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{evt.title}</h4>
                      <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded text-[9px] uppercase font-bold tracking-wider">
                        Map Marker
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400">
                      <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" /> <span>{evt.date}</span></p>
                      <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> <span>{evt.time}</span></p>
                      <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> <span className="line-clamp-1">{evt.location}</span></p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-850/60 pt-3">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>{evt.registeredUsers.length} Registered</span>
                      </div>

                      <button
                        onClick={() => onRegisterEvent(evt.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                          isRegistered
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white"
                        }`}
                      >
                        {isRegistered ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Registered</span>
                          </>
                        ) : (
                          <span>Register</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
