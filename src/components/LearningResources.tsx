import React, { useState, useEffect } from "react";
import { Play, Volume2, Download, FileText, Globe, Search, BookOpen, Music, Video, Plus, ExternalLink } from "lucide-react";
import { Resource } from "../types.js";

interface LearningResourcesProps {
  resources: Resource[];
  onCreateResource: (resource: any) => void;
  loggedInUser: any;
}

export default function LearningResources({
  resources,
  onCreateResource,
  loggedInUser
}: LearningResourcesProps) {
  // Video playlist
  const videos = [
    {
      id: "vid_1",
      title: "React Server Components Deep Dive with Dan",
      platform: "youtube",
      embedId: "TQQI9Sg0K9w", // React Doc video ID or standard
      duration: "45 mins",
      category: "Web Development"
    },
    {
      id: "vid_2",
      title: "Vite 6 Configuration & Production Bundler Performance",
      platform: "youtube",
      embedId: "K6K3mI7lG6E",
      duration: "25 mins",
      category: "Web Development"
    },
    {
      id: "vid_3",
      title: "TensorFlow.js: Client-side Image Classification Workshop",
      platform: "vimeo",
      embedId: "22439234",
      duration: "30 mins",
      category: "Artificial Intelligence"
    }
  ];

  // Podcasts
  const audios = [
    {
      id: "aud_1",
      title: "Syntax.fm: Modern CSS architectures & Tailwind v4",
      platform: "spotify",
      url: "https://open.spotify.com/embed/episode/7vD1h4N1m4a1o1p1S1t1u1",
      duration: "55 mins"
    },
    {
      id: "aud_2",
      title: "Changelog: The Rise of On-device AI Models",
      platform: "soundcloud",
      url: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/499310321",
      duration: "42 mins"
    }
  ];

  const [activeVideo, setActiveVideo] = useState(videos[0]);
  const [activeAudio, setActiveAudio] = useState(audios[0]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");

  // Create Resource fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState<"pdf" | "docx" | "zip">("pdf");
  const [category, setCategory] = useState("Web Development");

  const handlePublishResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onCreateResource({
      title,
      description,
      fileType,
      category,
      fileName: `Community_Guide_${title.replace(/\s+/g, "_")}.${fileType}`,
      fileSize: "1.4 MB"
    });

    // Reset
    setTitle("");
    setDescription("");
    setFileType("pdf");
  };

  const filteredResources = resources.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(search.toLowerCase()) || res.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "" || res.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="learning-resources" className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      {/* SECTION 1: VIDEO LEARNING MODULE */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-4">
          <Video className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold font-display text-white">Video Learning Hub</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              {activeVideo.platform === "youtube" ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideo.embedId}?rel=0`}
                  title={activeVideo.title}
                  allowFullScreen
                />
              ) : (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://player.vimeo.com/video/${activeVideo.embedId}`}
                  title={activeVideo.title}
                  allowFullScreen
                />
              )}
            </div>
            <div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                {activeVideo.category}
              </span>
              <h4 className="text-lg font-bold text-white mt-1.5">{activeVideo.title}</h4>
              <p className="text-xs text-slate-500 mt-1">Duration: {activeVideo.duration}</p>
            </div>
          </div>

          {/* Playlist Sidebar */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Related Learning Playlist</h5>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {videos.map((vid) => (
                <button
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className={`w-full p-3 text-left border rounded-xl flex items-start gap-3 transition-all cursor-pointer ${
                    activeVideo.id === vid.id
                      ? "bg-slate-850 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-950/60 border-slate-850 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <Play className={`w-4 h-4 shrink-0 mt-0.5 ${activeVideo.id === vid.id ? "text-emerald-400 fill-emerald-400/20" : "text-slate-500"}`} />
                  <div>
                    <p className="font-bold text-xs line-clamp-2">{vid.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{vid.duration} • {vid.platform.toUpperCase()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AUDIO PODCAST MODULE */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-4">
          <Music className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold font-display text-white">Audio Learning & Podcasts</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white">Tune into Developer Podcasts</h4>
            <p className="text-slate-400 text-sm">
              Listen to expert discussions and tech talk. Easily stream Spotify or SoundCloud embeds on the fly.
            </p>

            <div className="space-y-2">
              {audios.map((aud) => (
                <button
                  key={aud.id}
                  onClick={() => setActiveAudio(aud)}
                  className={`w-full p-3 text-left border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    activeAudio.id === aud.id
                      ? "bg-slate-850 border-emerald-500/40 text-emerald-400 font-semibold"
                      : "bg-slate-950/60 border-slate-850 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>{aud.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{aud.duration}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-850 h-40">
            {activeAudio.platform === "spotify" ? (
              <iframe
                src={activeAudio.url}
                className="w-full h-full"
                allow="encrypted-media"
                title="Spotify podcast"
              />
            ) : (
              <iframe
                width="100%"
                height="100%"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={activeAudio.url}
                title="Soundcloud podcast"
              />
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: ARTICLE & CHEAT SHEETS FILE DIRECTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resource directory list */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold font-display text-white">Resource Directories</h3>
            </div>

            <div className="flex gap-2">
              {["", "Web Development", "UI/UX Design", "Artificial Intelligence"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat === "" ? "All" : cat.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {filteredResources.map((res) => (
              <div key={res.id} className="p-4 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded-xl flex items-center justify-between gap-6 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded text-[9px] uppercase font-bold">
                      {res.fileType.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">{res.category}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{res.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{res.description}</p>
                  <p className="text-[10px] text-slate-500">Shared by: @{res.authorName} • {res.fileSize}</p>
                </div>

                <button
                  onClick={() => alert(`Downloading "${res.fileName}" successfully.`)}
                  className="p-2.5 bg-slate-900 hover:bg-emerald-500 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Resource Module */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold font-display text-white text-base">Publish Learning Notes</h3>
            <p className="text-slate-400 text-xs">
              Upload helpful articles, coding cheat sheets, PDF guides, or templates for community members.
            </p>

            <form onSubmit={handlePublishResource} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Resource Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Figma UI Cheat Sheet"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Brief Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Grids and spacing guides"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">File Type</label>
                  <select
                    value={fileType}
                    onChange={(e: any) => setFileType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                  >
                    <option value="pdf">PDF</option>
                    <option value="docx">Word (DOCX)</option>
                    <option value="zip">ZIP File</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                  >
                    <option value="Web Development">Web Dev</option>
                    <option value="UI/UX Design">UI Design</option>
                    <option value="Artificial Intelligence">AI / ML</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] cursor-pointer"
              >
                Publish Resource
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
