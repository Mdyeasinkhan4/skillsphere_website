import { UserProfile, Post, Comment, Course, Resource, LearningEvent, Notification, Review } from "../src/types.js";

class SkillSphereDB {
  public users: Map<string, UserProfile> = new Map();
  public posts: Map<string, Post> = new Map();
  public comments: Comment[] = [];
  public courses: Course[] = [];
  public resources: Resource[] = [];
  public events: LearningEvent[] = [];
  public notifications: Notification[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed Users
    const user1: UserProfile = {
      id: "usr_sarah",
      username: "sarah_codes",
      email: "sarah@skillsphere.edu",
      phone: "+15550199",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
      bio: "Lead Developer Advocate & Senior Software Engineer. Passionate about TypeScript, React, and building supportive developer communities worldwide.",
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS"],
      education: [
        { school: "Stanford University", degree: "B.S. in Computer Science", year: "2019" }
      ],
      experience: [
        { company: "Vercel", role: "Developer Relations Engineer", duration: "2022 - Present" },
        { company: "GitHub", role: "Software Engineer", duration: "2019 - 2022" }
      ],
      socialLinks: { github: "https://github.com", linkedin: "https://linkedin.com", twitter: "https://twitter.com" },
      followers: ["usr_alex", "usr_elena"],
      following: ["usr_alex"],
      registeredAt: "2025-01-15T08:00:00Z"
    };

    const user2: UserProfile = {
      id: "usr_alex",
      username: "alex_ai",
      email: "alex@skillsphere.edu",
      phone: "+15550244",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      coverUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800",
      bio: "Machine Learning Engineer. Specializing in computer vision and natural language processing. Always down to discuss TensorFlow, PyTorch, and generative AI models.",
      skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "FastAPI"],
      education: [
        { school: "MIT", degree: "M.S. in Artificial Intelligence", year: "2021" }
      ],
      experience: [
        { company: "Google", role: "AI Research Scientist", duration: "2023 - Present" },
        { company: "OpenAI", role: "ML Resident", duration: "2021 - 2023" }
      ],
      socialLinks: { github: "https://github.com", linkedin: "https://linkedin.com" },
      followers: ["usr_sarah"],
      following: ["usr_sarah", "usr_elena"],
      registeredAt: "2025-02-10T10:30:00Z"
    };

    const user3: UserProfile = {
      id: "usr_elena",
      username: "elena_design",
      email: "elena@skillsphere.edu",
      phone: "+15550388",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      coverUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
      bio: "Senior Product Designer. Focused on creating highly intuitive, accessible user interfaces and gorgeous interactive experiences.",
      skills: ["UI/UX Design", "Figma", "Tailwind CSS", "Motion", "SASS"],
      education: [
        { school: "RISD", degree: "B.F.A. in Graphic Design", year: "2018" }
      ],
      experience: [
        { company: "Airbnb", role: "Lead Product Designer", duration: "2021 - Present" },
        { company: "Stripe", role: "Product Designer", duration: "2018 - 2021" }
      ],
      socialLinks: { linkedin: "https://linkedin.com", twitter: "https://twitter.com" },
      followers: ["usr_alex"],
      following: ["usr_sarah"],
      registeredAt: "2025-03-01T14:15:00Z"
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);

    // Seed Courses
    this.courses = [
      {
        id: "crs_next",
        title: "Mastering Next.js 15 & Modern React Essentials",
        description: "Learn state-of-the-art server components, Server Actions, streaming, dynamic layouts, and API routing. This course covers everything from basic components to full enterprise deployment.",
        instructor: "Sarah Jenkins (Vercel Developer Advocate)",
        duration: "12 Hours",
        rating: 4.9,
        reviewsCount: 142,
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500",
        category: "Web Development",
        level: "Intermediate",
        enrolledCount: 2350
      },
      {
        id: "crs_tf",
        title: "Intro to TensorFlow Lite & Edge Intelligence",
        description: "Deploy highly efficient machine learning models directly on the client, web browser, and mobile devices using TensorFlow Lite and TensorFlow.js.",
        instructor: "Alex Rivera (AI Research Scientist)",
        duration: "8 Hours",
        rating: 4.8,
        reviewsCount: 89,
        image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=500",
        category: "Artificial Intelligence",
        level: "Advanced",
        enrolledCount: 1240
      },
      {
        id: "crs_design",
        title: "Interactive UI: Motion, Figma, and Tailwind CSS",
        description: "Learn the secrets of award-winning interactions. Dive into layout transitions, micro-interactions, custom design systems, and responsive layouts.",
        instructor: "Elena Rostova (Lead Product Designer)",
        duration: "10 Hours",
        rating: 4.9,
        reviewsCount: 215,
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500",
        category: "UI/UX Design",
        level: "Beginner",
        enrolledCount: 3100
      },
      {
        id: "crs_node",
        title: "Scale-Out Backends: Express, GraphQL & WebSockets",
        description: "Build robust backend architectures. Design flexible REST APIs, comprehensive GraphQL endpoints, and real-time Socket.IO bidirectional layers.",
        instructor: "Michael Chen (Principal Architect)",
        duration: "15 Hours",
        rating: 4.7,
        reviewsCount: 95,
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500",
        category: "Backend Development",
        level: "Intermediate",
        enrolledCount: 1820
      }
    ];

    // Seed Posts
    const post1: Post = {
      id: "post_1",
      authorId: "usr_sarah",
      author: {
        username: "sarah_codes",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        skills: ["React", "TypeScript", "Node.js"]
      },
      content: "Just published a comprehensive guide to React Server Components (RSC) vs. Client-side Rendering (CSR). Which one is your go-to model for performance-critical widgets, and why? Let's discuss standard caching strategies!",
      type: "text",
      likes: ["usr_alex", "usr_elena"],
      dislikes: [],
      createdAt: "2026-07-18T09:00:00Z",
      averageRating: 4.8,
      reviews: [
        { id: "rev_1", authorId: "usr_alex", authorName: "alex_ai", authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", rating: 5, text: "Unbelievably thorough comparison! The caching metrics saved me days of load-testing.", createdAt: "2026-07-18T10:15:00Z" }
      ],
      sharesCount: 12
    };

    const post2: Post = {
      id: "post_2",
      authorId: "usr_alex",
      author: {
        username: "alex_ai",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        skills: ["Python", "TensorFlow", "Machine Learning"]
      },
      content: "Check out this quick proof-of-concept visual model trained to predict user interest based on their skill profile. The prediction runs completely on-device. Perfect for instant offline content recommendation in desktop apps!",
      type: "image",
      mediaUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
      likes: ["usr_sarah"],
      dislikes: [],
      createdAt: "2026-07-18T14:30:00Z",
      averageRating: 4.9,
      reviews: [
        { id: "rev_2", authorId: "usr_elena", authorName: "elena_design", authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", rating: 5, text: "The layout of your network graph is gorgeous. Clean and very easy to follow.", createdAt: "2026-07-18T15:00:00Z" }
      ],
      sharesCount: 8
    };

    const post3: Post = {
      id: "post_3",
      authorId: "usr_elena",
      author: {
        username: "elena_design",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        skills: ["UI/UX Design", "Figma", "Tailwind CSS"]
      },
      content: "I've uploaded my latest UI design cheat sheet! It covers grid layouts, typography pairs, and custom shadows using Tailwind v4. It's a free PDF resource for everyone in our community.",
      type: "file",
      fileName: "Tailwind_v4_UX_Cheatsheet.pdf",
      fileSize: "2.4 MB",
      mediaUrl: "/api/resources/download/cheatsheet",
      likes: ["usr_sarah", "usr_alex"],
      dislikes: [],
      createdAt: "2026-07-17T11:20:00Z",
      averageRating: 5.0,
      reviews: [],
      sharesCount: 34
    };

    this.posts.set(post1.id, post1);
    this.posts.set(post2.id, post2);
    this.posts.set(post3.id, post3);

    // Seed Comments
    this.comments = [
      {
        id: "comm_1",
        postId: "post_1",
        authorId: "usr_alex",
        authorName: "alex_ai",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        content: "I absolutely prefer RSC because of the zero bundle size impact. The initial HTML paint is incredibly snappy, especially over 3G.",
        createdAt: "2026-07-18T09:15:00Z",
        likes: ["usr_sarah"]
      },
      {
        id: "comm_2",
        postId: "post_1",
        parentId: "comm_1",
        authorId: "usr_sarah",
        authorName: "sarah_codes",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        content: "Exactly! And by coupling it with server-side caching, we reduce database query loads substantially.",
        createdAt: "2026-07-18T09:20:00Z",
        likes: []
      },
      {
        id: "comm_3",
        postId: "post_1",
        authorId: "usr_elena",
        authorName: "elena_design",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        content: "From a UX perspective, combining RSC with custom skeleton loading blocks creates a seamless flow.",
        createdAt: "2026-07-18T10:05:00Z",
        likes: ["usr_sarah"]
      }
    ];

    // Seed Resources
    this.resources = [
      {
        id: "res_rsc",
        title: "React Server Components Deep-Dive Architecture Guide",
        description: "An advanced, fully-illustrated PDF architecture guide covering payload serialization, client-server component boundaries, and streaming rendering pipelines.",
        fileUrl: "#",
        fileType: "pdf",
        fileName: "React_Server_Components_Deep_Dive.pdf",
        fileSize: "4.8 MB",
        authorName: "sarah_codes",
        category: "Web Development",
        downloadsCount: 145,
        createdAt: "2026-07-15T08:00:00Z"
      },
      {
        id: "res_cheat",
        title: "Tailwind CSS v4 Interactive Component Starter Bundle",
        description: "A ZIP package containing pre-styled Tailwind components, layout grids, modern cards, and interactive button groups complete with motion-driven presets.",
        fileUrl: "#",
        fileType: "zip",
        fileName: "Tailwind_v4_Starter_Templates.zip",
        fileSize: "12.1 MB",
        authorName: "elena_design",
        category: "UI/UX Design",
        downloadsCount: 320,
        createdAt: "2026-07-16T14:00:00Z"
      },
      {
        id: "res_ml",
        title: "TensorFlow Lite JavaScript Integration Cheatsheet",
        description: "A comprehensive developer's notes file in Word format outlining mobile model deployment pipelines, quantization scripts, and async model execution hooks.",
        fileUrl: "#",
        fileType: "docx",
        fileName: "TF_Lite_Web_Integration.docx",
        fileSize: "1.2 MB",
        authorName: "alex_ai",
        category: "Artificial Intelligence",
        downloadsCount: 98,
        createdAt: "2026-07-18T16:00:00Z"
      }
    ];

    // Seed Events
    this.events = [
      {
        id: "evt_next_summit",
        title: "Next.js 15 & GraphQL Community Meetup",
        description: "Join us for an exciting evening of lightning talks, live coding, and visual demonstrations highlighting the power of server actions combined with real-time GraphQL subscriptions.",
        date: "2026-08-05",
        time: "18:30",
        location: "TechSpace Co-working Lounge, San Francisco",
        latitude: 37.7749,
        longitude: -122.4194,
        creatorName: "sarah_codes",
        registeredUsers: ["usr_alex", "usr_elena"],
        createdAt: "2026-07-18T10:00:00Z"
      },
      {
        id: "evt_ai_workshop",
        title: "On-Device Deep Learning & TensorFlow Hackathon",
        description: "An intensive hands-on workshop led by industry scientists. Bring your laptops; we will build, prune, and run customized neural networks directly inside web applications.",
        date: "2026-08-12",
        time: "10:00",
        location: "AI Innovation Hub, New York",
        latitude: 40.7128,
        longitude: -74.0060,
        creatorName: "alex_ai",
        registeredUsers: ["usr_sarah"],
        createdAt: "2026-07-18T15:30:00Z"
      }
    ];

    // Seed Notifications
    this.notifications = [
      {
        id: "not_1",
        userId: "usr_sarah",
        type: "comment",
        message: "alex_ai commented on your post regarding React Server Components.",
        senderName: "alex_ai",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        read: false,
        createdAt: "2026-07-18T09:15:00Z"
      },
      {
        id: "not_2",
        userId: "usr_sarah",
        type: "like",
        message: "elena_design liked your React Server Components vs. CSR post.",
        senderName: "elena_design",
        senderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        read: true,
        createdAt: "2026-07-18T10:10:00Z"
      }
    ];
  }

  // --- API Helper Methods ---

  public getUser(id: string): UserProfile | null {
    return this.users.get(id) || null;
  }

  public getUserByUsername(username: string): UserProfile | null {
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  public checkUsername(username: string): boolean {
    // Returns true if username is available (i.e., not taken)
    return !Array.from(this.users.values()).some(
      u => u.username.toLowerCase() === username.toLowerCase()
    );
  }

  public createUser(profile: UserProfile): UserProfile {
    this.users.set(profile.id, profile);
    return profile;
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile {
    const user = this.getUser(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  public getPosts(page = 1, limit = 5, categoryFilter = "", searchQuery = ""): { posts: Post[], total: number } {
    let postsList = Array.from(this.posts.values());

    if (categoryFilter) {
      postsList = postsList.filter(p => {
        const u = this.getUser(p.authorId);
        return u?.skills.some(s => s.toLowerCase() === categoryFilter.toLowerCase());
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      postsList = postsList.filter(p => 
        p.content.toLowerCase().includes(query) ||
        p.author.username.toLowerCase().includes(query)
      );
    }

    // Sort by createdAt descending
    postsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = postsList.length;
    const startIndex = (page - 1) * limit;
    const paginated = postsList.slice(startIndex, startIndex + limit);

    return { posts: paginated, total };
  }

  public createPost(post: Post): Post {
    this.posts.set(post.id, post);
    return post;
  }

  public updatePost(id: string, updates: Partial<Post>): Post {
    const post = this.posts.get(id);
    if (!post) throw new Error("Post not found");
    const updated = { ...post, ...updates };
    this.posts.set(id, updated);
    return updated;
  }

  public deletePost(id: string): boolean {
    return this.posts.delete(id);
  }

  public likePost(postId: string, userId: string): Post {
    const post = this.posts.get(postId);
    if (!post) throw new Error("Post not found");

    const likedIndex = post.likes.indexOf(userId);
    const dislikedIndex = post.dislikes.indexOf(userId);

    if (likedIndex > -1) {
      post.likes.splice(likedIndex, 1);
    } else {
      post.likes.push(userId);
      if (dislikedIndex > -1) {
        post.dislikes.splice(dislikedIndex, 1);
      }
    }
    this.posts.set(postId, post);
    return post;
  }

  public dislikePost(postId: string, userId: string): Post {
    const post = this.posts.get(postId);
    if (!post) throw new Error("Post not found");

    const likedIndex = post.likes.indexOf(userId);
    const dislikedIndex = post.dislikes.indexOf(userId);

    if (dislikedIndex > -1) {
      post.dislikes.splice(dislikedIndex, 1);
    } else {
      post.dislikes.push(userId);
      if (likedIndex > -1) {
        post.likes.splice(likedIndex, 1);
      }
    }
    this.posts.set(postId, post);
    return post;
  }

  public addReviewToPost(postId: string, rating: number, text: string, authorId: string): Post {
    const post = this.posts.get(postId);
    if (!post) throw new Error("Post not found");

    const reviewer = this.getUser(authorId);
    if (!reviewer) throw new Error("Reviewer not found");

    const review: Review = {
      id: `rev_${Date.now()}`,
      authorId,
      authorName: reviewer.username,
      authorAvatar: reviewer.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      rating,
      text,
      createdAt: new Date().toISOString()
    };

    post.reviews.push(review);

    // Re-calculate average rating
    const totalRating = post.reviews.reduce((sum, r) => sum + r.rating, 0);
    post.averageRating = Number((totalRating / post.reviews.length).toFixed(1));

    this.posts.set(postId, post);
    return post;
  }

  public getComments(postId: string): Comment[] {
    return this.comments.filter(c => c.postId === postId);
  }

  public createComment(comment: Comment): Comment {
    this.comments.push(comment);
    return comment;
  }

  public getCourses(): Course[] {
    return this.courses;
  }

  public enrollCourse(courseId: string, userId: string): Course {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");
    course.enrolledCount += 1;
    return course;
  }

  public getResources(): Resource[] {
    return this.resources;
  }

  public createResource(resource: Resource): Resource {
    this.resources.push(resource);
    return resource;
  }

  public getEvents(): LearningEvent[] {
    return this.events;
  }

  public createEvent(event: LearningEvent): LearningEvent {
    this.events.push(event);
    return event;
  }

  public registerEvent(eventId: string, userId: string): LearningEvent {
    const event = this.events.find(e => e.id === eventId);
    if (!event) throw new Error("Event not found");

    const index = event.registeredUsers.indexOf(userId);
    if (index > -1) {
      event.registeredUsers.splice(index, 1);
    } else {
      event.registeredUsers.push(userId);
    }
    return event;
  }

  public getNotifications(userId: string): Notification[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  public addNotification(notification: Notification) {
    this.notifications.push(notification);
  }

  public markAsRead(id: string, userId: string): void {
    const notif = this.notifications.find(n => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
    }
  }
}

export const db = new SkillSphereDB();
