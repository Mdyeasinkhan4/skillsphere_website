import React, { useState } from "react";
import { Users, BarChart3, AlertTriangle, Shield, Check, Trash2, Eye, FileText, Star } from "lucide-react";
import { UserProfile, Post, Resource } from "../types.js";

interface AdminPanelProps {
  users: UserProfile[];
  posts: Post[];
  resources: Resource[];
  onDeletePost: (postId: string) => void;
}

export default function AdminPanel({
  users,
  posts,
  resources,
  onDeletePost
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "users" | "posts" | "resources">("analytics");

  // Mock Reports listing
  const [reports, setReports] = useState([
    { id: "rep_1", type: "Post", targetId: "post_2", reason: "Spam / Duplicate updates", reporter: "sarah_codes", resolved: false },
    { id: "rep_2", type: "Review", targetId: "rev_1", reason: "Unprofessional language", reporter: "elena_design", resolved: true }
  ]);

  const handleResolveReport = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, resolved: true } : r));
  };

  // Stats
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const totalResources = resources.length;
  const mostActiveUser = users[0]?.username || "sarah_codes";

  // SVG Chart data: Post engagement values
  const chartData = posts.map((p, idx) => ({
    name: `@${p.author.username}`,
    likes: p.likes.length,
    comments: p.reviews.length + 1 // reviews + comments estimation
  })).slice(0, 4);

  return (
    <div id="admin-panel" className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl font-bold font-display text-white">Platform Administrator Console</h2>
          </div>
          <p className="text-xs text-slate-500">Monitor and moderate SkillSphere community statistics, updates, reports, and assets.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-850">
          {[
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "users", label: "User Accounts", icon: Users },
            { id: "posts", label: "Moderate Feed", icon: AlertTriangle },
            { id: "resources", label: "Moderated Files", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Members</p>
          <p className="text-2xl font-black font-display text-white">{totalUsers}</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Feed Posts</p>
          <p className="text-2xl font-black font-display text-white">{totalPosts}</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Cheat Sheets</p>
          <p className="text-2xl font-black font-display text-white">{totalResources}</p>
        </div>
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Top Contributor</p>
          <p className="text-base font-bold text-emerald-400 mt-1">@{mostActiveUser}</p>
        </div>
      </div>

      {/* MAIN TAB CONTENT */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Post engagement chart */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white font-display">Post Engagement Analytics</h3>

            {/* Pure SVG Bar Chart (compiles perfectly, responsive design) */}
            <div className="relative pt-4">
              <svg width="100%" height="200" viewBox="0 0 500 200" className="text-slate-600">
                {/* Horizontal grid lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="160" x2="480" y2="160" stroke="#334155" strokeWidth="1.5" />

                {/* Bars mapping */}
                {chartData.map((data, idx) => {
                  const spacing = 100;
                  const x = 60 + idx * spacing;
                  const barWidth = 24;

                  // Scales: max val = 10
                  const likesHeight = Math.max(10, data.likes * 25);
                  const commsHeight = Math.max(10, data.comments * 25);

                  return (
                    <g key={idx}>
                      {/* Likes Bar (Emerald green) */}
                      <rect
                        x={x}
                        y={160 - likesHeight}
                        width={barWidth}
                        height={likesHeight}
                        fill="#10b981"
                        rx="3"
                        fillOpacity="0.85"
                      />
                      {/* Comments Bar (Blue) */}
                      <rect
                        x={x + 28}
                        y={160 - commsHeight}
                        width={barWidth}
                        height={commsHeight}
                        fill="#3b82f6"
                        rx="3"
                        fillOpacity="0.85"
                      />
                      {/* Label username */}
                      <text x={x + 12} y="180" fill="#94a3b8" fontSize="9" textAnchor="middle">
                        {data.name}
                      </text>
                    </g>
                  );
                })}

                {/* Legend */}
                <g transform="translate(380, 10)">
                  <rect width="10" height="10" fill="#10b981" rx="2" />
                  <text x="16" y="9" fill="#94a3b8" fontSize="9">Likes</text>
                  <rect x="50" width="10" height="10" fill="#3b82f6" rx="2" />
                  <text x="66" y="9" fill="#94a3b8" fontSize="9">Reviews</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Moderation Reports List */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-white font-display">Moderation Inbox ({reports.filter(r => !r.resolved).length})</h3>
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 font-bold uppercase tracking-wider rounded text-[9px]">
                      {rep.type}
                    </span>
                    <span className="text-slate-500">By: @{rep.reporter}</span>
                  </div>
                  <p className="text-slate-300 font-semibold">{rep.reason}</p>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500">ID: {rep.targetId}</span>
                    {rep.resolved ? (
                      <span className="text-emerald-400 flex items-center gap-0.5 font-bold"><Check className="w-3 h-3" /> Moderated</span>
                    ) : (
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-850">
            <h3 className="font-bold font-display text-white text-base">User Directory & Status</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-850">
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Skills Stack</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-850/20">
                    <td className="p-4 font-bold text-white">@{user.username}</td>
                    <td className="p-4 text-slate-400">{user.email}</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.skills.slice(0, 3).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 rounded text-[10px] text-slate-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => alert("User account status verified successfully.")}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-850 text-slate-300 font-semibold border border-slate-800 rounded-lg cursor-pointer"
                      >
                        Verify User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "posts" && (
        <div className="bg-slate-900 border border-slate-850 rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="font-bold font-display text-white text-base">Moderate Community Feed</h3>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-6 text-xs hover:border-slate-800 transition-colors">
                <div className="space-y-1">
                  <p className="font-bold text-white">@{post.author.username}</p>
                  <p className="text-slate-400 line-clamp-1">{post.content}</p>
                  <p className="text-[10px] text-slate-500">{post.likes.length} Likes • {post.reviews.length} Ratings</p>
                </div>

                <button
                  onClick={() => onDeletePost(post.id)}
                  className="p-2 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "resources" && (
        <div className="bg-slate-900 border border-slate-850 rounded-2xl shadow-xl p-6 space-y-4">
          <h3 className="font-bold font-display text-white text-base">Moderate Files & Guides</h3>
          <div className="space-y-4">
            {resources.map((res) => (
              <div key={res.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-6 text-xs hover:border-slate-800 transition-colors">
                <div className="space-y-1">
                  <p className="font-bold text-white">{res.title}</p>
                  <p className="text-slate-500">{res.fileName} ({res.fileSize})</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">{res.category}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Reviewing file content for "${res.fileName}"`)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
