import express from "express";
import http from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db.js";
import { handleGraphQL } from "./server/graphql.js";
import { generateRecommendations } from "./server/ai.js";
import nodemailer from "nodemailer";

// Session persistence store (simple memory map)
const sessions = new Map<string, string>(); // token -> userId

// In-memory verification storage for register OTPs
const verificationCodes = new Map<string, { code: string; expiresAt: number; userData: any }>();

// SMTP Helper to send real-time OTP emails
async function sendOTPEmail(to: string, otp: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || "noreply@skillsphere.com";

  if (!host || !user || !pass) {
    console.warn("SMTP settings are not configured in environment. Skipping email dispatch.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for port 465, false for 587 or other ports
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"SkillSphere" <${from}>`,
      to,
      subject: `SkillSphere Verification Code: ${otp}`,
      text: `Your SkillSphere verification code is: ${otp}\n\nThis code is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">SkillSphere</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 16px; color: #334155;">Hello,</p>
          <p style="font-size: 16px; color: #334155;">Thank you for signing up for SkillSphere! Please use the following One-Time Password (OTP) to verify your email address:</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b; font-family: monospace;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b; text-align: center;">This code will expire in 10 minutes.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you did not request this email, please ignore it.</p>
        </div>
      `,
    });

    console.log(`Successfully sent email OTP to ${to}`);
    return true;
  } catch (error) {
    console.error("Failed to send email OTP via SMTP:", error);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Create HTTP and Socket.IO servers
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Socket.IO event handler
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join_post", (postId) => {
      socket.join(`post_${postId}`);
      console.log(`Socket ${socket.id} joined post room post_${postId}`);
    });

    socket.on("leave_post", (postId) => {
      socket.leave(`post_${postId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Authentication Middleware
  const getAuthUser = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const userId = sessions.get(token);
      if (userId) {
        return db.getUser(userId);
      }
    }
    return null;
  };

  // --- GraphQL Endpoint ---
  app.post("/api/graphql", (req, res) => {
    handleGraphQL(req, res);
  });

  // --- REST API Endpoints ---

  // Auth: Check Username Availability
  app.post("/api/auth/check-username", (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    const isAvailable = db.checkUsername(username);
    return res.json({ available: isAvailable });
  });

  // Auth: Register (Simulates Email/Phone verification with code)
  app.post("/api/auth/register", async (req, res) => {
    const { username, email, phone, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!db.checkUsername(cleanUsername)) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Generate real-time random 6-digit OTP code
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in-memory with 10 minutes validity
    verificationCodes.set(cleanEmail, {
      code: emailOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userData: { username: cleanUsername, email: cleanEmail, phone: (phone || "").trim(), password }
    });

    // Try sending email via SMTP
    const emailSent = await sendOTPEmail(cleanEmail, emailOtp);

    if (emailSent) {
      return res.json({
        message: "A 6-digit verification code has been sent to your email address.",
        emailSent: true,
        fallbackOtp: emailOtp,
        tempUser: { username: cleanUsername, email: cleanEmail, phone: (phone || "").trim(), password }
      });
    } else {
      return res.json({
        message: "Verification code generated. (SMTP is not configured in Settings, please check console logs or use the fallback code below).",
        emailSent: false,
        fallbackOtp: emailOtp,
        tempUser: { username: cleanUsername, email: cleanEmail, phone: (phone || "").trim(), password }
      });
    }
  });

  // Auth: Verify OTP and Create Session
  app.post("/api/auth/verify-otp", (req, res) => {
    const { username, email, phone, emailCode } = req.body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanCode = (emailCode || "").toString().trim();

    const record = verificationCodes.get(cleanEmail);
    if (!record) {
      return res.status(400).json({ error: "No verification request found for this email. Please register again." });
    }

    if (Date.now() > record.expiresAt) {
      verificationCodes.delete(cleanEmail);
      return res.status(400).json({ error: "Verification code has expired. Please register again." });
    }

    if (record.code !== cleanCode) {
      return res.status(400).json({ error: "Invalid email verification code." });
    }

    const matchedUserData = record.userData || { username, email: cleanEmail, phone, password: "" };

    // Clean up verification
    verificationCodes.delete(cleanEmail);

    // Create the user profile
    const userId = `usr_${Date.now()}`;
    const newUser = db.createUser({
      id: userId,
      username: matchedUserData.username || username,
      email: matchedUserData.email || cleanEmail,
      phone: matchedUserData.phone || phone || "",
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
      bio: "Aspiring lifelong learner on SkillSphere.",
      skills: [],
      education: [],
      experience: [],
      socialLinks: {},
      followers: [],
      following: [],
      registeredAt: new Date().toISOString()
    });

    const token = `sess_${userId}_${Date.now()}`;
    sessions.set(token, userId);

    return res.json({ token, user: newUser });
  });

  // Auth: Login
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = db.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: "User not found. Try registering instead!" });
    }

    const token = `sess_${user.id}_${Date.now()}`;
    sessions.set(token, user.id);

    return res.json({ token, user });
  });

  // Auth: Get Current Profile
  app.get("/api/auth/me", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.json({ user });
  });

  // Users: Get Specific User Profile
  app.get("/api/users/:id", (req, res) => {
    const user = db.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }
    return res.json(user);
  });

  // Users: Get List of All Users
  app.get("/api/users", (req, res) => {
    return res.json(Array.from(db.users.values()));
  });

  // Users: Update User Profile
  app.put("/api/users/:id", (req, res) => {
    const loggedUser = getAuthUser(req);
    if (!loggedUser || loggedUser.id !== req.params.id) {
      return res.status(403).json({ error: "Forbidden: You can only edit your own profile" });
    }

    try {
      const updated = db.updateProfile(req.params.id, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Posts: Get Community Feed with Pagination, Search, Skill Filters
  app.get("/api/posts", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skillFilter = (req.query.skill as string) || "";
    const search = (req.query.search as string) || "";

    const data = db.getPosts(page, limit, skillFilter, search);
    return res.json(data);
  });

  // Posts: Create New Post
  app.post("/api/posts", (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { content, type, mediaUrl, fileName, fileSize } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Post content is required" });
    }

    const newPost = db.createPost({
      id: `post_${Date.now()}`,
      authorId: user.id,
      author: {
        username: user.username,
        avatarUrl: user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        skills: user.skills
      },
      content,
      type: type || "text",
      mediaUrl,
      fileName,
      fileSize,
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString(),
      averageRating: 0,
      reviews: [],
      sharesCount: 0
    });

    // Notify other users via Socket.IO
    io.emit("post_created", newPost);

    return res.json(newPost);
  });

  // Posts: Edit Post
  app.put("/api/posts/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const post = db.posts.get(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.authorId !== user.id) {
      return res.status(403).json({ error: "Forbidden: You are not the author of this post" });
    }

    const updated = db.updatePost(req.params.id, { content: req.body.content });
    io.emit("post_updated", updated);
    return res.json(updated);
  });

  // Posts: Delete Post
  app.delete("/api/posts/:id", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const post = db.posts.get(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.authorId !== user.id) {
      return res.status(403).json({ error: "Forbidden: You can only delete your own post" });
    }

    db.deletePost(req.params.id);
    io.emit("post_deleted", req.params.id);
    return res.json({ success: true });
  });

  // Posts: Like
  app.post("/api/posts/:id/like", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    try {
      const updated = db.likePost(req.params.id, user.id);
      
      // Notify original author if liked and they are not the liker
      if (updated.authorId !== user.id && updated.likes.includes(user.id)) {
        const notif = {
          id: `not_${Date.now()}`,
          userId: updated.authorId,
          type: "like" as const,
          message: `${user.username} liked your post regarding "${updated.content.slice(0, 30)}..."`,
          senderName: user.username,
          senderAvatar: user.avatarUrl || "",
          read: false,
          createdAt: new Date().toISOString()
        };
        db.addNotification(notif);
        io.emit("notification_received", { userId: updated.authorId, notification: notif });
      }

      io.to(`post_${req.params.id}`).emit("post_reaction_updated", updated);
      io.emit("post_updated", updated);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Posts: Dislike
  app.post("/api/posts/:id/dislike", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    try {
      const updated = db.dislikePost(req.params.id, user.id);
      io.to(`post_${req.params.id}`).emit("post_reaction_updated", updated);
      io.emit("post_updated", updated);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Posts: Review (Rating System)
  app.post("/api/posts/:id/review", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { rating, text } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "A valid rating between 1 and 5 is required" });
    }

    try {
      const updated = db.addReviewToPost(req.params.id, rating, text || "", user.id);

      // Create notification for original author
      if (updated.authorId !== user.id) {
        const notif = {
          id: `not_${Date.now()}`,
          userId: updated.authorId,
          type: "review" as const,
          message: `${user.username} rated your post ${rating} stars!`,
          senderName: user.username,
          senderAvatar: user.avatarUrl || "",
          read: false,
          createdAt: new Date().toISOString()
        };
        db.addNotification(notif);
        io.emit("notification_received", { userId: updated.authorId, notification: notif });
      }

      io.to(`post_${req.params.id}`).emit("post_reaction_updated", updated);
      io.emit("post_updated", updated);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Posts: Share Increment
  app.post("/api/posts/:id/share", (req, res) => {
    const post = db.posts.get(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.sharesCount += 1;
    io.emit("post_updated", post);
    return res.json(post);
  });

  // Comments: Get comments
  app.get("/api/posts/:id/comments", (req, res) => {
    const comments = db.getComments(req.params.id);
    return res.json(comments);
  });

  // Comments: Add comment
  app.post("/api/posts/:id/comments", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { content, parentId } = req.body;
    if (!content) return res.status(400).json({ error: "Comment content is required" });

    const post = db.posts.get(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const newComment = db.createComment({
      id: `comm_${Date.now()}`,
      postId: req.params.id,
      parentId,
      authorId: user.id,
      authorName: user.username,
      authorAvatar: user.avatarUrl || "",
      content,
      createdAt: new Date().toISOString(),
      likes: []
    });

    // Notify author of post
    if (post.authorId !== user.id) {
      const isReply = !!parentId;
      const notif = {
        id: `not_${Date.now()}`,
        userId: post.authorId,
        type: isReply ? ("reply" as const) : ("comment" as const),
        message: `${user.username} ${isReply ? "replied to a comment" : "commented"} on your post: "${content.slice(0, 35)}..."`,
        senderName: user.username,
        senderAvatar: user.avatarUrl || "",
        read: false,
        createdAt: new Date().toISOString()
      };
      db.addNotification(notif);
      io.emit("notification_received", { userId: post.authorId, notification: notif });
    }

    // Emit live update in real-time
    io.to(`post_${req.params.id}`).emit("comment_added", newComment);
    io.emit("post_updated", post); // to refresh main feed comment count

    return res.json(newComment);
  });

  // Resources: Get all resources
  app.get("/api/resources", (req, res) => {
    return res.json(db.getResources());
  });

  // Resources: Create Resource
  app.post("/api/resources", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, fileType, fileName, fileSize, category } = req.body;
    if (!title || !fileType) return res.status(400).json({ error: "Title and fileType are required" });

    const newResource = db.createResource({
      id: `res_${Date.now()}`,
      title,
      description: description || "",
      fileUrl: "#",
      fileType,
      fileName: fileName || `resource.${fileType}`,
      fileSize: fileSize || "1.0 MB",
      authorName: user.username,
      category: category || "General",
      downloadsCount: 0,
      createdAt: new Date().toISOString()
    });

    return res.json(newResource);
  });

  // Resources: Simulates drag & drop drag file upload progress, returning mock Cloudinary details
  app.post("/api/resources/upload", (req, res) => {
    const { name, size, type } = req.body;
    if (!name) return res.status(400).json({ error: "File details are required" });

    // Extract file info
    let fileType: "pdf" | "docx" | "zip" = "pdf";
    if (name.endsWith(".zip")) fileType = "zip";
    if (name.endsWith(".docx") || name.endsWith(".doc")) fileType = "docx";

    const formattedSize = size ? `${(size / (1024 * 1024)).toFixed(1)} MB` : "2.5 MB";

    // Simulate Cloudinary asset payload
    return res.json({
      success: true,
      cloudinaryUrl: `https://res.cloudinary.com/demo/image/upload/skillsphere/${name}`,
      fileName: name,
      fileSize: formattedSize,
      fileType
    });
  });

  // Courses: Get Courses list
  app.get("/api/courses", (req, res) => {
    return res.json(db.getCourses());
  });

  // Courses: Enroll in Course
  app.post("/api/courses/:id/enroll", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    try {
      const updated = db.enrollCourse(req.params.id, user.id);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Events: Get all Events
  app.get("/api/events", (req, res) => {
    return res.json(db.getEvents());
  });

  // Events: Create Event
  app.post("/api/events", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, date, time, location, latitude, longitude } = req.body;
    if (!title || !date || !time || !location) {
      return res.status(400).json({ error: "Title, date, time, and location are required" });
    }

    const newEvent = db.createEvent({
      id: `evt_${Date.now()}`,
      title,
      description: description || "",
      date,
      time,
      location,
      latitude: latitude || 37.7749,
      longitude: longitude || -122.4194,
      creatorName: user.username,
      registeredUsers: [user.id],
      createdAt: new Date().toISOString()
    });

    return res.json(newEvent);
  });

  // Events: Register
  app.post("/api/events/:id/register", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    try {
      const updated = db.registerEvent(req.params.id, user.id);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Notifications: List
  app.get("/api/notifications", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    return res.json(db.getNotifications(user.id));
  });

  // Notifications: Mark Read
  app.post("/api/notifications/:id/read", (req, res) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    db.markAsRead(req.params.id, user.id);
    return res.json({ success: true });
  });

  // AI Recommendation Engine
  app.post("/api/ai/recommend", async (req, res) => {
    const { skills = [], bio = "" } = req.body;
    try {
      const recommendations = await generateRecommendations(skills, bio);
      return res.json(recommendations);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Recommendation engine failure" });
    }
  });

  // --- Vite Dev server or Static Production Assets config ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Listen on PORT 3000
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
