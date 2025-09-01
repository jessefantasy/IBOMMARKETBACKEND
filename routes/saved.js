import PostSchema from "../schema/posts.js";
import SavedSchema from "../schema/saved.js";
import { Router } from "express";

const SavedRouter = Router();

// Save a post
SavedRouter.post("/save-post", async (req, res) => {
  try {
    const { userId, postId } = req.body;
    if (!userId || !postId) {
      return res
        .status(400)
        .json({ message: "User ID and Post ID are required." });
    }

    const existingSaved = await SavedSchema.findOne({ userId });
    if (existingSaved) {
      if (existingSaved.postsId.includes(postId)) {
        return res.status(400).json({ message: "Post already saved." });
      }
      existingSaved.postsId.push(postId);
      await existingSaved.save();
      return res.status(200).json(existingSaved);
    }

    const newSaved = new SavedSchema({
      userId,
      postsId: [postId],
    });

    const savedPost = await newSaved.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get saved posts for a user
SavedRouter.get("/get-saved-posts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const savedPosts = await SavedSchema.findOne({ userId });
    if (!savedPosts) {
      // If no saved posts, create a new record for the user and return empty array
      const newSaved = new SavedSchema({ userId, postsId: [] });
      await newSaved.save();
      return res.status(200).json(newSaved);
    }

    res.status(200).json(savedPosts);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get saved posts details for a user
SavedRouter.get("/get-saved-posts-details/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const savedPosts = await SavedSchema.findOne({ userId });
    if (!savedPosts) {
      // If no saved posts, create a new record for the user and return empty array
      const newSaved = new SavedSchema({ userId, postsId: [] });
      await newSaved.save();
      return res.status(200).json(newSaved);
    }

    console.log(savedPosts.postsId);
    // Assuming you have a Post model to fetch post details
    const Posts = await PostSchema.find({ _id: { $in: savedPosts.postsId } });

    console.log(Posts);
    res.status(200).json(Posts);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Add multiple saved posts

SavedRouter.post("/add-saved-posts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { postsId } = req.body;
    if (!userId || !Array.isArray(postsId) || postsId.length === 0) {
      return res
        .status(400)
        .json({ message: "User ID and an array of Post IDs are required." });
    }

    const existingSaved = await SavedSchema.findOne({ userId });
    if (existingSaved) {
      // Add only new posts that are not already saved
      const newPosts = postsId.filter(
        (id) => !existingSaved.postsId.includes(id)
      );
      if (newPosts.length > 0) {
        existingSaved.postsId.push(...newPosts);
        await existingSaved.save();
      }
      return res.status(200).json(existingSaved);
    }

    const newSaved = new SavedSchema({
      userId,
      postsId: postsId,
    });

    const savedPost = await newSaved.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Remove multiple saved posts
SavedRouter.post("/remove-saved-posts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { postsId } = req.body;
    if (!userId || !Array.isArray(postsId) || postsId.length === 0) {
      return res
        .status(400)
        .json({ message: "User ID and an array of Post IDs are required." });
    }

    const savedPosts = await SavedSchema.findOne({ userId });
    if (!savedPosts) {
      return res
        .status(404)
        .json({ message: "No saved posts found for this user." });
    }

    // Filter out all postsId provided
    savedPosts.postsId = savedPosts.postsId.filter(
      (id) => !postsId.includes(id)
    );
    await savedPosts.save();

    res.status(200).json(savedPosts);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Clear all saved posts for a user
SavedRouter.delete("/clear-saved-posts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const savedPosts = await SavedSchema.findOne({ userId });
    if (!savedPosts) {
      return res
        .status(404)
        .json({ message: "No saved posts found for this user." });
    }
    savedPosts.postsId = [];
    await savedPosts.save();

    res.status(200).json({ message: "All saved posts cleared successfully." });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default SavedRouter;
