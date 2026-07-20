import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BookOpen, Users, Star, Layers, Calendar, ChevronDown, Award, Globe, ArrowRight, ShieldCheck, Download, Code, Sparkles } from "lucide-react";
import { Course } from "../types.js";

interface LandingPageProps {
  onRegisterClick: () => void;
  onExploreCourses: () => void;
  onViewFeed: () => void;
  courses: Course[];
  onEnroll: (courseId: string) => void;
  loggedInUser: any;
}

export default function LandingPage({
  onRegisterClick,
  onExploreCourses,
  onViewFeed,
  courses,
  onEnroll,
  loggedInUser
}: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Active contributors
  const contributors = [
    {
      name: "Sarah Jenkins",
      role: "Lead Developer Advocate",
      company: "Vercel",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      skills: ["React", "TypeScript", "Node.js", "Next.js"],
      stats: "15 Posts • 2.3k Followers"
    },
    {
      name: "Alex Rivera",
      role: "AI Research Scientist",
      company: "Google",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      skills: ["TensorFlow", "Python", "MLOps", "AI Architectures"],
      stats: "12 Posts • 1.9k Followers"
    },
    {
      name: "Elena Rostova",
      role: "Senior Product Designer",
      company: "Airbnb",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      skills: ["Figma", "UI/UX", "Motion Design", "Design Systems"],
      stats: "18 Posts • 3.1k Followers"
    }
  ];

  // Testimonials
  const testimonials = [
    {
      text: "SkillSphere completely transformed how I learn. Instead of boring static courses, I can interact directly with instructors and review real-world PDF cheat sheets uploaded by community legends.",
      name: "Dmitri Volkov",
      role: "Junior Full Stack Engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120"
    },
    {
      text: "The combination of the on-device TensorFlow recommendation engine and direct community feedback on posts creates a super responsive learning loop that I haven't seen anywhere else.",
      name: "Amara Nwosu",
      role: "Machine Learning Apprentice",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
    }
  ];

  const faqs = [
    {
      q: "What makes SkillSphere different from standard online universities?",
      a: "SkillSphere pairs premium online courses with a highly active, Facebook-style community feed. You can ask questions, publish summaries, upload resources (PDF/docx), register for co-working events, and receive smart AI recommendations."
    },
    {
      q: "How does the AI Recommendation Engine work?",
      a: "Our server-side recommendation system uses the Google Gemini 3.5 Flash model. It inspects your registered skills, bio, and experience level, and then suggests the most relevant courses and learning materials to boost your carrier path."
    },
    {
      q: "Is SkillSphere completely free to join?",
      a: "Yes! Joining the community, reading resources, and participating in the public discussion feed is completely free. We also host open-source co-working events across several tech hubs."
    }
  ];

  return (
    <div id="landing-page" className="bg-slate-950 text-white min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 border-b border-slate-900">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_45%)]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-glow" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Full-Stack Social Learning Hub</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black font-display tracking-tight leading-none text-white"
            >
              Where Knowledge Meets <span className="text-gradient">Community</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-slate-400 font-sans"
            >
              Unleash the power of social learning. Connect with experts, join developer discussions, download community cheat sheets, register for local events, and scale your technical skills.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              {loggedInUser ? (
                <button
                  onClick={onViewFeed}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold shadow-[0_4px_20px_rgba(16,185,129,0.25)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Go to Community Feed</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={onRegisterClick}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold shadow-[0_4px_20px_rgba(16,185,129,0.25)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Register Free Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <button
                onClick={onExploreCourses}
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-800 hover:bg-slate-900 font-semibold transition-all cursor-pointer"
              >
                Browse Featured Courses
              </button>
            </motion.div>
          </div>

          {/* Counts metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20 p-6 border border-slate-900 bg-slate-950/65 rounded-2xl backdrop-blur-sm">
            <div className="text-center border-r border-slate-900 last:border-0 pr-4">
              <div className="text-3xl md:text-4xl font-extrabold font-display text-gradient">2.5k+</div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Active Students</div>
            </div>
            <div className="text-center md:border-r border-slate-900 pr-4">
              <div className="text-3xl md:text-4xl font-extrabold font-display text-gradient">450+</div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Cheat Sheets</div>
            </div>
            <div className="text-center border-r border-slate-900 pr-4">
              <div className="text-3xl md:text-4xl font-extrabold font-display text-gradient">18+</div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Interactive Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold font-display text-gradient">120+</div>
              <div className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">Local Events</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COURSES SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-6" id="landing-courses">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Premium Content</div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white leading-tight">Featured Courses</h2>
            <p className="text-slate-400 max-w-xl">
              Accelerate your growth. Learn from industry founders, scientists, and design experts with direct Q&A support.
            </p>
          </div>
          <button
            onClick={onExploreCourses}
            className="mt-4 md:mt-0 px-6 py-2.5 border border-slate-800 hover:bg-slate-900 rounded-xl font-medium transition-all text-sm shrink-0 cursor-pointer"
          >
            See All Courses ({courses.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.slice(0, 4).map((course, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={course.id}
              className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-950">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-[10px] uppercase font-bold tracking-wider text-slate-300 border border-slate-800">
                    {course.level}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                    {course.category}
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-center justify-between border-t border-slate-850/60 pt-4 mb-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 stroke-yellow-500" />
                    <span className="font-bold text-white">{course.rating}</span>
                    <span>({course.reviewsCount})</span>
                  </div>
                  <div>{course.duration}</div>
                </div>

                <button
                  onClick={() => onEnroll(course.id)}
                  className="w-full py-2.5 bg-slate-950 hover:bg-emerald-500 hover:text-white border border-slate-800 hover:border-emerald-500 text-slate-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Enroll Course ({course.enrolledCount})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TOP CONTRIBUTORS / PEER ADVISORS SECTION */}
      <section className="py-20 border-t border-b border-slate-900 bg-slate-950/50 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.04),transparent_40%)]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <div className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Industry Leaders</div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Top Community Contributors</h2>
            <p className="text-slate-400">
              Engage with verified mentors working at Vercel, Google, and Airbnb. Get design tips, code help, and advice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contributors.map((contrib, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-slate-900 border border-slate-850 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={contrib.avatar}
                      alt={contrib.name}
                      className="w-14 h-14 rounded-full border border-slate-800 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-white text-lg">{contrib.name}</h4>
                      <p className="text-xs text-slate-400">{contrib.role} at <span className="text-emerald-400 font-semibold">{contrib.company}</span></p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-medium tracking-wide">
                    {contrib.stats}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {contrib.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="px-2 py-1 bg-slate-950 text-slate-300 border border-slate-800/80 rounded-md text-[10px] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onViewFeed}
                  className="w-full mt-6 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs border border-slate-800 transition-all cursor-pointer"
                >
                  View Feed Posts
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="space-y-4">
            <div className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Success Stories</div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Loved by modern developers</h2>
            <p className="text-slate-400">
              Read how engineers, researchers, and UI experts utilize our real-time feedback loop and file directories to advance their daily workflow.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-6 flex flex-col justify-between">
                <p className="text-slate-300 italic text-sm leading-relaxed">
                  "{test.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="font-semibold text-white text-sm">{test.name}</h5>
                    <p className="text-xs text-slate-500">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION Accordion */}
      <section className="py-20 border-t border-slate-900 max-w-3xl mx-auto px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-bold font-display text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Need help? Explore answers to commonly asked questions.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left text-white font-medium hover:bg-slate-850/50 transition-colors cursor-pointer"
              >
                <span className="text-sm md:text-base">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-emerald-400" : ""}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-5 pt-1 text-slate-400 text-sm leading-relaxed border-t border-slate-850/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="text-white font-display font-bold text-lg flex items-center justify-center md:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>SkillSphere</span>
            </div>
            <p className="text-xs max-w-sm">
              An advanced collaborative environment built for developer networking, online training, and peer review sharing.
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-2 text-xs">
            <div>&copy; 2026 SkillSphere Platform. All rights reserved.</div>
            <div className="text-slate-600">Built in full-stack Sandboxed Container.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
