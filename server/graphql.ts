import { db } from "./db.js";

interface GraphQLPayload {
  query: string;
  variables?: Record<string, any>;
}

export function handleGraphQL(req: any, res: any) {
  try {
    const { query, variables = {} } = req.body as GraphQLPayload;

    if (!query) {
      return res.status(400).json({ errors: [{ message: "A query string must be specified" }] });
    }

    // Clean query to inspect operations
    const normalized = query.replace(/\s+/g, " ").trim();

    // Setup default response wrapper
    let data: any = {};
    let errors: any[] | undefined = undefined;

    // --- MUTATIONS ---
    if (normalized.startsWith("mutation") || normalized.includes("mutation ")) {
      if (normalized.includes("createPost")) {
        const { id, authorId, content, type, mediaUrl } = variables;
        const author = db.getUser(authorId || "usr_sarah");
        const newPost = {
          id: id || `post_${Date.now()}`,
          authorId: authorId || "usr_sarah",
          author: {
            username: author?.username || "anonymous",
            avatarUrl: author?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            skills: author?.skills || []
          },
          content,
          type: type || "text",
          mediaUrl,
          likes: [],
          dislikes: [],
          createdAt: new Date().toISOString(),
          averageRating: 0,
          reviews: [],
          sharesCount: 0
        };
        db.createPost(newPost);
        data = { createPost: newPost };

      } else if (normalized.includes("createComment")) {
        const { postId, parentId, authorId, content } = variables;
        const author = db.getUser(authorId || "usr_sarah");
        const newComment = {
          id: `comm_${Date.now()}`,
          postId,
          parentId,
          authorId: authorId || "usr_sarah",
          authorName: author?.username || "anonymous",
          authorAvatar: author?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          content,
          createdAt: new Date().toISOString(),
          likes: []
        };
        db.createComment(newComment);
        data = { createComment: newComment };

      } else if (normalized.includes("addReview")) {
        const { postId, rating, text, authorId } = variables;
        const updatedPost = db.addReviewToPost(postId, rating, text, authorId || "usr_sarah");
        const addedReview = updatedPost.reviews[updatedPost.reviews.length - 1];
        data = { addReview: addedReview };

      } else if (normalized.includes("updateProfile")) {
        const { id, bio, skills, education, experience, socialLinks } = variables;
        const updatedProfile = db.updateProfile(id, { bio, skills, education, experience, socialLinks });
        data = { updateProfile: updatedProfile };

      } else {
        errors = [{ message: "Mutation not recognized or supported in this GraphQL module" }];
      }

    // --- QUERIES ---
    } else {
      if (normalized.includes("users")) {
        data.users = Array.from(db.users.values());
      }
      if (normalized.includes("posts")) {
        data.posts = Array.from(db.posts.values());
      }
      if (normalized.includes("comments")) {
        const postId = variables.postId;
        if (postId) {
          data.comments = db.getComments(postId);
        } else {
          data.comments = db.comments;
        }
      }
      if (normalized.includes("reviews")) {
        // Return reviews from all posts
        const allReviews = Array.from(db.posts.values()).flatMap(p => p.reviews);
        data.reviews = allReviews;
      }

      if (Object.keys(data).length === 0) {
        errors = [{ message: "Query not recognized or supported. Try querying users, posts, comments, or reviews." }];
      }
    }

    return res.json({ data, errors });
  } catch (err: any) {
    return res.status(500).json({ errors: [{ message: err.message || "Internal GraphQL error" }] });
  }
}
