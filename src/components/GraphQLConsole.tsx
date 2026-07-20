import React, { useState } from "react";
import { Terminal, Play, RotateCcw, Copy, HelpCircle } from "lucide-react";

export default function GraphQLConsole() {
  const presets = [
    {
      label: "Query: Get All Users",
      query: `query {
  users {
    id
    username
    email
    skills
  }
}`,
      variables: {}
    },
    {
      label: "Query: Get All Posts",
      query: `query {
  posts {
    id
    content
    author {
      username
    }
    likes
    averageRating
  }
}`,
      variables: {}
    },
    {
      label: "Mutation: Create Post",
      query: `mutation ($content: String!, $type: String!, $authorId: String!) {
  createPost(content: $content, type: $type, authorId: $authorId) {
    id
    content
    createdAt
  }
}`,
      variables: {
        content: "Learning GraphQL mutations in Node.js Express server!",
        type: "text",
        authorId: "usr_sarah"
      }
    },
    {
      label: "Mutation: Add Star Review",
      query: `mutation ($postId: String!, $rating: Int!, $text: String!) {
  addReview(postId: $postId, rating: $rating, text: $text) {
    id
    rating
    text
    createdAt
  }
}`,
      variables: {
        postId: "post_1",
        rating: 5,
        text: "Incredible guidance!"
      }
    }
  ];

  const [activeQuery, setActiveQuery] = useState(presets[0].query);
  const [activeVariables, setActiveVariables] = useState(JSON.stringify(presets[0].variables, null, 2));
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setActiveQuery(preset.query);
    setActiveVariables(JSON.stringify(preset.variables, null, 2));
  };

  const handleRunQuery = async () => {
    setLoading(true);
    setResults(null);
    try {
      let parsedVars = {};
      try {
        parsedVars = JSON.parse(activeVariables);
      } catch (e) {
        // Fallback or ignore
      }

      const resp = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: activeQuery, variables: parsedVars })
      });
      const data = await resp.json();
      setResults(data);
    } catch (err: any) {
      setResults({ errors: [{ message: err.message || "Failed to execute GraphQL query" }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="graphql-console" className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <Terminal className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-bold font-display text-white">Interactive GraphQL Playground</h2>
      </div>

      <p className="text-xs text-slate-500 max-w-3xl">
        Execute active Queries and Mutations directly against our backend Express GraphQL compiler. Select a preset below, edit variables if needed, and run queries in real-time.
      </p>

      {/* Preset select */}
      <div className="flex gap-2 flex-wrap pb-2">
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleApplyPreset(p)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Pane */}
        <div className="flex flex-col gap-4 bg-slate-900 border border-slate-850 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">GraphQL Request Document</h4>
            <div className="flex gap-2">
              <button
                onClick={handleRunQuery}
                disabled={loading}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{loading ? "Running..." : "Run Query"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Query / Mutation String</label>
              <textarea
                value={activeQuery}
                onChange={(e) => setActiveQuery(e.target.value)}
                rows={9}
                className="w-full bg-slate-950 font-mono text-xs text-emerald-400 p-4 rounded-xl border border-slate-850 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Query Variables (JSON)</label>
              <textarea
                value={activeVariables}
                onChange={(e) => setActiveVariables(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 font-mono text-xs text-blue-400 p-4 rounded-xl border border-slate-850 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Results Pane */}
        <div className="flex flex-col gap-4 bg-slate-900 border border-slate-850 p-5 rounded-2xl shadow-xl min-h-[300px]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Response Console</h4>

          <div className="flex-1 bg-slate-950 font-mono text-xs text-slate-300 p-5 rounded-xl border border-slate-850 overflow-auto max-h-[360px]">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">
                Fetching response payload...
              </div>
            ) : results ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600 text-center">
                Query has not run yet.<br />Click "Run Query" above to execute API mutations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
