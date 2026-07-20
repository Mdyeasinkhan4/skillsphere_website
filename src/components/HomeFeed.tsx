import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { MessageSquare, ThumbsUp, ThumbsDown, Share2, Star, Send, Trash2, Edit3, Image, FileText, UploadCloud, X, ArrowDown } from "lucide-react";
import { Post, Comment, UserProfile } from "../types.js";

interface HomeFeedProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export default function HomeFeed({ currentUser, onOpenAuth }: HomeFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeSkillFilter, setActiveSkillFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create post states
  const [newPostContent, setNewPostContent] = useState("");
  const [postType, setPostType] = useState<"text" | "image" | "video" | "file">("text");
  const [attachedUrl, setAttachedUrl] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");
  const [attachedFileSize, setAttachedFileSize] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Edit states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Expanded posts (for comments & reviews toggling)
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [newCommentText, setNewCommentText] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const socketRef = useRef<Socket | null>(null);

  // Load feed posts
  useEffect(() => {
    fetchPosts(true);
  }, [activeSkillFilter, searchQuery]);

  // Set up socket connections
  useEffect(() => {
    // Connect to local Node server
    const socket = io();
    socketRef.current = socket;

    socket.on("post_created", (newPost: Post) => {
      setPosts((prev) => [newPost, ...prev]);
    });

    socket.on("post_updated", (updatedPost: Post) => {
      setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    });

    socket.on("post_reaction_updated", (updatedPost: Post) => {
      setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    });

    socket.on("post_deleted", (deletedPostId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
    });

    socket.on("comment_added", (newComment: Comment) => {
      setCommentsMap((prev) => {
        const postComments = prev[newComment.postId] || [];
        return {
          ...prev,
          [newComment.postId]: [...postComments, newComment]
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPosts = async (reset = false) => {
    const nextPage = reset ? 1 : page + 1;
    try {
      const url = `/api/posts?page=${nextPage}&limit=5&skill=${activeSkillFilter}&search=${searchQuery}`;
      const resp = await fetch(url);
      const data = await resp.json();

      if (reset) {
        setPosts(data.posts);
        setPage(1);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
        setPage(nextPage);
      }
      setHasMore(posts.length + data.posts.length < data.total);
    } catch (err) {
      console.error("Failed to load posts", err);
    }
  };

  // Mock File upload drag & drop simulating cloud uploading progress
  const handleFileUploadMock = (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(async () => {
      setUploadProgress((prev) => {
        if (prev === null) return 10;
        if (prev >= 90) {
          clearInterval(interval);
          completeMockUpload(file);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const completeMockUpload = async (file: File) => {
    try {
      const resp = await fetch("/api/resources/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, type: file.type }),
      });
      const data = await resp.json();

      setAttachedUrl(data.cloudinaryUrl);
      setAttachedFileName(data.fileName);
      setAttachedFileSize(data.fileSize);

      // set postType
      if (file.name.endsWith(".pdf")) setPostType("file");
      else if (file.type.startsWith("image")) setPostType("image");
      else if (file.type.startsWith("video")) setPostType("video");
      else setPostType("file");

    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newPostContent.trim()) return;

    try {
      const resp = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}`
        },
        body: JSON.stringify({
          content: newPostContent,
          type: postType,
          mediaUrl: attachedUrl || undefined,
          fileName: attachedFileName || undefined,
          fileSize: attachedFileSize || undefined
        }),
      });

      if (resp.ok) {
        setNewPostContent("");
        setPostType("text");
        setAttachedUrl("");
        setAttachedFileName("");
        setAttachedFileSize("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPost = async (postId: string) => {
    try {
      const resp = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}`
        },
        body: JSON.stringify({ content: editingContent }),
      });
      if (resp.ok) {
        setEditingPostId(null);
        setEditingContent("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Reactions
  const handleReaction = async (postId: string, type: "like" | "dislike") => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      await fetch(`/api/posts/${postId}/${type}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Comments toggling and loading
  const handleToggleComments = async (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
      return;
    }

    setExpandedCommentsPostId(postId);
    setReplyToCommentId(null);

    // Join room for real-time comment triggers
    socketRef.current?.emit("join_post", postId);

    // Load initial comment list
    try {
      const resp = await fetch(`/api/posts/${postId}/comments`);
      const data = await resp.json();
      setCommentsMap((prev) => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}`
        },
        body: JSON.stringify({
          content: newCommentText,
          parentId: replyToCommentId || undefined
        }),
      });

      setNewCommentText("");
      setReplyToCommentId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Reviews System
  const handleAddReview = async (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!reviewText.trim()) return;

    try {
      const resp = await fetch(`/api/posts/${postId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}`
        },
        body: JSON.stringify({ rating: reviewRating, text: reviewText }),
      });
      if (resp.ok) {
        setReviewText("");
        // Reload comments/reviews list
        handleToggleComments(postId); // Refresh
        handleToggleComments(postId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const resp = await fetch(`/api/posts/${postId}/share`, {
        method: "POST"
      });
      if (resp.ok) {
        alert("Post shared successfully inside SkillSphere network!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="community-feed" className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-900 p-4 border border-slate-800 rounded-2xl shadow-xl">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search user updates, topics, or resources..."
          className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white"
        />

        <div className="flex gap-2 flex-wrap">
          {["", "React", "TypeScript", "TensorFlow", "UI/UX Design", "Node.js"].map((skill) => (
            <button
              key={skill}
              onClick={() => setActiveSkillFilter(skill)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                activeSkillFilter === skill
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {skill === "" ? "All Skills" : skill}
            </button>
          ))}
        </div>
      </div>

      {/* CREATE POST CARD */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl">
        <div className="flex gap-4">
          <img
            src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
            alt="My Avatar"
            className="w-10 h-10 rounded-full border border-slate-800 object-cover"
            referrerPolicy="no-referrer"
          />

          <form onSubmit={handleCreatePostSubmit} className="flex-1 space-y-4">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What are you learning today? Share an article, code update, or question..."
              rows={3}
              className="w-full bg-transparent text-white border-0 focus:ring-0 placeholder-slate-500 resize-none focus:outline-none"
            />

            {/* Attached resource file info */}
            {attachedFileName && (
              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-slate-300">{attachedFileName}</p>
                    <p className="text-[10px] text-slate-500">{attachedFileSize}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setAttachedUrl(""); setAttachedFileName(""); setAttachedFileSize(""); }}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Drag and Drop simulate / Upload Trigger */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-medium cursor-pointer transition-colors">
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  <span>Attach File (Drag & Drop)</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUploadMock(file);
                    }}
                  />
                </label>
              </div>

              {isUploading && (
                <div className="w-full sm:w-40 bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-xl text-xs text-white transition-all cursor-pointer"
              >
                Publish Update
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* POSTS LIST */}
      <div className="space-y-6">
        {posts.map((post) => {
          const isOwnPost = currentUser?.id === post.authorId;
          const userHasLiked = currentUser ? post.likes.includes(currentUser.id) : false;
          const userHasDisliked = currentUser ? post.dislikes.includes(currentUser.id) : false;

          return (
            <div key={post.id} className="bg-slate-900 border border-slate-850 rounded-2xl shadow-xl overflow-hidden">
              {/* Post Header */}
              <div className="p-6 flex items-center justify-between border-b border-slate-850/40">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full border border-slate-800 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">@{post.author.username}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.author.skills?.slice(0, 2).map((s, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 bg-slate-950 border border-slate-800 rounded text-[9px] uppercase font-semibold text-slate-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Edit/Delete Options */}
                {isOwnPost && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingPostId(post.id); setEditingContent(post.content); }}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Post Body */}
              <div className="p-6 space-y-4">
                {editingPostId === post.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-white focus:outline-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-3 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditPost(post.id)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg font-semibold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}

                {/* Media Attachment Display */}
                {post.mediaUrl && post.type === "image" && (
                  <div className="rounded-xl overflow-hidden border border-slate-850 bg-slate-950">
                    <img src={post.mediaUrl} alt="Attached Media" className="w-full max-h-[350px] object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}

                {post.fileName && (
                  <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="font-semibold text-slate-300">{post.fileName}</p>
                        <p className="text-[10px] text-slate-500">{post.fileSize || "1.2 MB"}</p>
                      </div>
                    </div>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert("File downloaded successfully!"); }}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Post Reactions & Actions bar */}
              <div className="px-6 py-4 border-t border-slate-850/40 bg-slate-900/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleReaction(post.id, "like")}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${
                      userHasLiked
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-transparent border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likes.length}</span>
                  </button>

                  <button
                    onClick={() => handleReaction(post.id, "dislike")}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${
                      userHasDisliked
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-transparent border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{post.dislikes.length}</span>
                  </button>

                  <button
                    onClick={() => handleToggleComments(post.id)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800/40 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Comments</span>
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Rating display */}
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 stroke-yellow-500" />
                    <span className="font-bold text-white">{post.averageRating || "N/A"}</span>
                    <span>({post.reviews.length} reviews)</span>
                  </div>

                  <button
                    onClick={() => handleShare(post.id)}
                    className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/40 transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* EXPANDED COMMENTS & RATINGS SECTION */}
              {expandedCommentsPostId === post.id && (
                <div className="border-t border-slate-850 p-6 bg-slate-950/40 space-y-6">
                  {/* Rating / Review Entry System */}
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Rate this post & share feedback
                    </h5>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${star <= reviewRating ? "fill-yellow-500 stroke-yellow-500" : "text-slate-500"}`} />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-slate-400">({reviewRating} / 5 stars)</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write a brief review on this update..."
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 text-white text-xs rounded-lg focus:outline-none"
                      />
                      <button
                        onClick={() => handleAddReview(post.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        Submit
                      </button>
                    </div>

                    {/* Post Reviews list if available */}
                    {post.reviews.length > 0 && (
                      <div className="pt-2 space-y-2 border-t border-slate-850/50">
                        {post.reviews.map((rev) => (
                          <div key={rev.id} className="text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-300">@{rev.authorName}</span>
                              <div className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-yellow-500 stroke-yellow-500" />
                                <span className="font-bold">{rev.rating}</span>
                              </div>
                            </div>
                            <p className="text-slate-400">{rev.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* COMMENTS LOGIC */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Discussion Comments</h5>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {(commentsMap[post.id] || []).map((comm) => (
                        <div key={comm.id} className={`p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1.5 ${comm.parentId ? "ml-8 bg-slate-950/60 border-l-2 border-l-emerald-500" : ""}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">@{comm.authorName}</span>
                              <span className="text-[10px] text-slate-500">{new Date(comm.createdAt).toLocaleTimeString()}</span>
                            </div>
                            {!comm.parentId && (
                              <button
                                onClick={() => { setReplyToCommentId(comm.id); }}
                                className="text-[10px] font-semibold text-emerald-400 hover:underline cursor-pointer"
                              >
                                Reply
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-300">{comm.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Comment Entry Form */}
                    <div className="space-y-2 pt-2 border-t border-slate-850/50">
                      {replyToCommentId && (
                        <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-md">
                          <span>Replying to comment...</span>
                          <button onClick={() => setReplyToCommentId(null)} className="text-slate-400 hover:text-white">Cancel</button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Add comment to conversation..."
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 text-white text-xs rounded-lg focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => fetchPosts()}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            Load More Posts
          </button>
        </div>
      )}
    </div>
  );
}
