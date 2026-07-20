import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Globe, Users, BookOpen, Terminal, Shield, Calendar, LogIn, LogOut, Sparkles, UserCheck } from "lucide-react";
import AuthModal from "./components/AuthModal.jsx";
import LandingPage from "./components/LandingPage.jsx";
import HomeFeed from "./components/HomeFeed.jsx";
import LearningResources from "./components/LearningResources.jsx";
import EventMap from "./components/EventMap.jsx";
import GraphQLConsole from "./components/GraphQLConsole.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import { Course, Resource, LearningEvent, UserProfile, Post } from "./types.js";

export default function App() {
  const [activeTab, setActiveTab] = useState<"landing" | "feed" | "resources" | "events" | "graphql" | "admin" | "profile">("landing");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");

  // Shared application datasets
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  // On mount check token & load global datasets
  useEffect(() => {
    checkTokenAuth();
    loadAllDatasets();
  }, []);

  const checkTokenAuth = async () => {
    const token = localStorage.getItem("skillsphere_token");
    if (!token) return;

    try {
      const resp = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        const user = await resp.json();
        setCurrentUser(user);
        setSelectedProfileId(user.id);
      } else {
        localStorage.removeItem("skillsphere_token");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllDatasets = async () => {
    try {
      const [coursesRes, resourcesRes, eventsRes, usersRes, postsRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/resources"),
        fetch("/api/events"),
        fetch("/api/users"),
        fetch("/api/posts?limit=50")
      ]);

      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (resourcesRes.ok) setResources(await resourcesRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (postsRes.ok) {
        const pData = await postsRes.json();
        setAllPosts(pData.posts);
      }
    } catch (err) {
      console.error("Failed to load catalog data", err);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const resp = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}` }
      });
      if (resp.ok) {
        const updatedCourse = await resp.json();
        setCourses(courses.map((c) => (c.id === courseId ? updatedCourse : c)));
        alert(`Successfully enrolled in "${updatedCourse.title}"!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateResource = async (resourceObj: any) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const resp = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}`
        },
        body: JSON.stringify(resourceObj)
      });

      if (resp.ok) {
        const newRes = await resp.json();
        setResources([newRes, ...resources]);
        alert("Your cheat sheet guide has been published to the directory!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (eventObj: any) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const resp = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}`
        },
        body: JSON.stringify(eventObj)
      });

      if (resp.ok) {
        const newEvt = await resp.json();
        setEvents([newEvt, ...events]);
        alert(`Successfully scheduled "${newEvt.title}" on the Google Map!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const resp = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}` }
      });
      if (resp.ok) {
        const updatedEvt = await resp.json();
        setEvents(events.map((e) => (e.id === eventId ? updatedEvt : e)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (user: UserProfile, token: string) => {
    localStorage.setItem("skillsphere_token", token);
    setCurrentUser(user);
    setSelectedProfileId(user.id);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("skillsphere_token");
    setCurrentUser(null);
    setActiveTab("landing");
  };

  const handleDeletePostAdmin = async (postId: string) => {
    if (!window.confirm("Admin moderation: Confirm deletion?")) return;
    try {
      const resp = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}` }
      });
      if (resp.ok) {
        setAllPosts(allPosts.filter(p => p.id !== postId));
        alert("Post removed successfully by Administrator.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-blue-600/20 selection:text-blue-600">
      {/* GLOBAL HEADER BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => setActiveTab("landing")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-[0_0_15px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-all">
              S
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              SkillSphere
            </span>
          </div>

          {/* MAIN NAV TABS */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { id: "landing", label: "Home", icon: Globe },
              { id: "feed", label: "Feed", icon: Users },
              { id: "resources", label: "Catalog & Files", icon: BookOpen },
              { id: "events", label: "Events Map", icon: Calendar },
              { id: "graphql", label: "GraphQL Sandbox", icon: Terminal },
              { id: "admin", label: "Moderation Console", icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-100/50"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* USER AUTH CONTROLS */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedProfileId(currentUser.id);
                    setActiveTab("profile");
                  }}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Profile (@{currentUser.username})</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:border-red-500/20 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Register / Log In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* RENDER CURRENT TAB VIEW */}
      <main className="min-h-[calc(100vh-4rem)]">
        {activeTab === "landing" && (
          <LandingPage
            onRegisterClick={() => setIsAuthOpen(true)}
            onExploreCourses={() => setActiveTab("resources")}
            onViewFeed={() => setActiveTab("feed")}
            courses={courses}
            onEnroll={handleEnrollCourse}
            loggedInUser={currentUser}
          />
        )}

        {activeTab === "feed" && (
          <HomeFeed
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === "resources" && (
          <LearningResources
            resources={resources}
            onCreateResource={handleCreateResource}
            loggedInUser={currentUser}
          />
        )}

        {activeTab === "events" && (
          <EventMap
            events={events}
            onCreateEvent={handleCreateEvent}
            onRegisterEvent={handleRegisterEvent}
            loggedInUser={currentUser}
          />
        )}

        {activeTab === "graphql" && <GraphQLConsole />}

        {activeTab === "profile" && (
          <ProfilePage
            profileId={selectedProfileId}
            currentUser={currentUser}
            onProfileUpdate={(updated) => {
              setCurrentUser(updated);
              setUsersList(usersList.map((u) => (u.id === updated.id ? updated : u)));
            }}
            courses={courses}
            onEnroll={handleEnrollCourse}
          />
        )}

        {activeTab === "admin" && (
          <AdminPanel
            users={usersList}
            posts={allPosts}
            resources={resources}
            onDeletePost={handleDeletePostAdmin}
          />
        )}
      </main>

      {/* REGISTRATION & LOGIN MODAL POPUP */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
