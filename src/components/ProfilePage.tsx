import React, { useState, useEffect } from "react";
import { Plus, Trash, Globe, Github, Linkedin, Twitter, Sparkles, BookOpen, User, BookOpenCheck } from "lucide-react";
import { UserProfile, Course } from "../types.js";

interface ProfilePageProps {
  profileId: string;
  currentUser: UserProfile | null;
  onProfileUpdate: (updated: UserProfile) => void;
  courses: Course[];
  onEnroll: (courseId: string) => void;
}

export default function ProfilePage({
  profileId,
  currentUser,
  onProfileUpdate,
  courses,
  onEnroll
}: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [bio, setBio] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [educationList, setEducationList] = useState<{ school: string; degree: string; year: string; }[]>([]);
  const [experienceList, setExperienceList] = useState<{ company: string; role: string; duration: string; }[]>([]);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");

  // AI Recommendations
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  // Load recommendations whenever skills or bio change
  useEffect(() => {
    if (profile) {
      loadAiRecommendations(profile.skills, profile.bio || "");
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const resp = await fetch(`/api/users/${profileId}`);
      if (resp.ok) {
        const data = (await resp.json()) as UserProfile;
        setProfile(data);

        // Prep edit state
        setBio(data.bio || "");
        setSkillsList(data.skills || []);
        setEducationList(data.education || []);
        setExperienceList(data.experience || []);
        setGithub(data.socialLinks?.github || "");
        setLinkedin(data.socialLinks?.linkedin || "");
        setTwitter(data.socialLinks?.twitter || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAiRecommendations = async (skills: string[], bioText: string) => {
    setAiLoading(true);
    try {
      const resp = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, bio: bioText })
      });
      if (resp.ok) {
        const data = await resp.json();
        setAiRecommendations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const resp = await fetch(`/api/users/${profileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("skillsphere_token")}`
        },
        body: JSON.stringify({
          bio,
          skills: skillsList,
          education: educationList,
          experience: experienceList,
          socialLinks: { github, linkedin, twitter }
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setProfile(data);
        onProfileUpdate(data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic Skill Manipulators
  const handleAddSkill = () => {
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      setSkillsList([...skillsList, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  // Dynamic Ed/Exp manipulators
  const handleAddEducation = () => {
    setEducationList([...educationList, { school: "", degree: "", year: "" }]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducationList(educationList.filter((_, idx) => idx !== index));
  };

  const handleEducationChange = (index: number, field: string, val: string) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], [field]: val };
    setEducationList(updated);
  };

  const handleAddExperience = () => {
    setExperienceList([...experienceList, { company: "", role: "", duration: "" }]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperienceList(experienceList.filter((_, idx) => idx !== index));
  };

  const handleExperienceChange = (index: number, field: string, val: string) => {
    const updated = [...experienceList];
    updated[index] = { ...updated[index], [field]: val };
    setExperienceList(updated);
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-slate-400">Loading user profile...</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileId;

  return (
    <div id="profile-page" className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Cover and header card */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
        <div className="h-44 relative bg-slate-950">
          <img
            src={profile.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <div className="px-8 pb-8 relative">
          {/* Profile Picture */}
          <div className="absolute -top-16 left-8">
            <img
              src={profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
              alt="Avatar"
              className="w-28 h-28 rounded-2xl border-4 border-slate-900 object-cover shadow-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="pt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold font-display text-white">@{profile.username}</h2>
              <p className="text-sm text-slate-400 mt-1">{profile.email}</p>
              {profile.phone && <p className="text-xs text-slate-500">{profile.phone}</p>}
            </div>

            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-5 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                {isEditing ? "Cancel Editing" : "Edit Profile Info"}
              </button>
            )}
          </div>

          {/* Bio displaying or editing */}
          <div className="mt-6 border-t border-slate-850/60 pt-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                    Bio Statement
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tell SkillSphere about yourself, your career path, or research focus..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub URL</label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Twitter/X URL</label>
                    <input
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="https://twitter.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">{profile.bio || "No biography provided yet."}</p>
                <div className="flex gap-4 text-slate-500">
                  {profile.socialLinks?.github && (
                    <a href={profile.socialLinks.github} target="_blank" className="hover:text-white transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" className="hover:text-white transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile.socialLinks?.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" className="hover:text-white transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Left column (Skills & Experience), Right column (AI Recommendations) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* DYNAMIC SKILLS FIELD */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold font-display text-white mb-4">Skills & Core Tech Stack</h3>

            {isEditing && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. Next.js, TensorFlow, PyTorch"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-4 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(isEditing ? skillsList : profile.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold"
                >
                  <span>{skill}</span>
                  {isEditing && (
                    <button onClick={() => handleRemoveSkill(skill)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* DYNAMIC EXPERIENCE FIELD */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-white">Experience Timeline</h3>
              {isEditing && (
                <button
                  onClick={handleAddExperience}
                  className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-emerald-400 rounded-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {(isEditing ? experienceList : profile.experience || []).map((exp, idx) => (
                <div key={idx} className="p-4 bg-slate-950/60 border border-slate-850/60 rounded-xl relative space-y-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleRemoveExperience(idx)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                          placeholder="Company"
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                          placeholder="Role"
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                          placeholder="Duration (e.g. 2021-Present)"
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{exp.role}</h4>
                        <p className="text-xs text-emerald-400 font-semibold mt-0.5">{exp.company}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{exp.duration}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC EDUCATION FIELD */}
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-white">Education History</h3>
              {isEditing && (
                <button
                  onClick={handleAddEducation}
                  className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-emerald-400 rounded-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {(isEditing ? educationList : profile.education || []).map((ed, idx) => (
                <div key={idx} className="p-4 bg-slate-950/60 border border-slate-850/60 rounded-xl relative space-y-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleRemoveEducation(idx)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                        <input
                          type="text"
                          value={ed.school}
                          onChange={(e) => handleEducationChange(idx, "school", e.target.value)}
                          placeholder="School/University"
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                        <input
                          type="text"
                          value={ed.degree}
                          onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                          placeholder="Degree"
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                        <input
                          type="text"
                          value={ed.year}
                          onChange={(e) => handleEducationChange(idx, "year", e.target.value)}
                          placeholder="Graduation Year"
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{ed.degree}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{ed.school}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{ed.year}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isEditing && (
            <div className="text-right">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI RECOMMENDATIONS BENTO CARD */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Ambient subtle glow background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
              <h3 className="text-lg font-bold font-display text-white">AI Recommendations</h3>
            </div>

            {aiLoading ? (
              <div className="space-y-3 py-4">
                <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-800 rounded w-5/6 animate-pulse" />
                <div className="h-3 bg-slate-800 rounded w-2/3 animate-pulse" />
              </div>
            ) : aiRecommendations ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Predicted Fields of Interest</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {aiRecommendations.predictedInterests?.map((interest: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-950 border border-slate-800/80 rounded-lg text-[10px] font-bold text-emerald-400">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-850/60 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Model Recommendation Reasoning</h4>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "{aiRecommendations.reasoning}"
                  </p>
                </div>

                <div className="border-t border-slate-850/60 pt-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Recommended Courses</h4>
                  <div className="space-y-2">
                    {courses
                      .filter((c) => aiRecommendations.courseIds?.includes(c.id))
                      .map((course) => (
                        <div key={course.id} className="p-3 bg-slate-950/80 border border-slate-850/80 rounded-xl flex items-center justify-between gap-4 text-xs hover:border-slate-700 transition-colors">
                          <div className="space-y-1">
                            <p className="font-bold text-white line-clamp-1">{course.title}</p>
                            <p className="text-[10px] text-slate-500">{course.instructor}</p>
                          </div>
                          <button
                            onClick={() => onEnroll(course.id)}
                            className="p-1 px-2.5 bg-slate-900 hover:bg-emerald-500 text-slate-300 hover:text-white border border-slate-800 rounded-lg font-semibold text-[10px] transition-colors shrink-0 cursor-pointer"
                          >
                            Enroll
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Update your skills or bio keywords to trigger high-quality server-side Gemini AI interest predictions.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
