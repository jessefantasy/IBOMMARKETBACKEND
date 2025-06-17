import PostSchema from "../schema/posts.js";

const getRecommendedPosts = async (trackingId, pageNumber) => {
  console.log(1, "Getting rec");
  console.log(trackingId);

  try {
    // Step 1: Find posts this user has visited
    const userPosts = await PostSchema.find({ visits: trackingId });

    // Step 2: Get the subcategoryNames from user's visited posts
    const subcategoryCounts = {};
    userPosts.forEach((post) => {
      const sub = post.subcategoryName;
      if (sub) {
        subcategoryCounts[sub] = (subcategoryCounts[sub] || 0) + 1;
      }
    });

    // Step 3: Sort subcategories by frequency
    const sortedSubcategories = Object.entries(subcategoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    if (sortedSubcategories.length === 0) {
      const allPosts = await PostSchema.find({
        status: "active",
      })
        .sort({ impressions: -1 })
        .skip((pageNumber - 1) * 20)
        .limit(20);
      return allPosts;
    }

    // Step 4: Find recommended posts
    let recommendedPosts = await PostSchema.find({
      subcategoryName: { $in: sortedSubcategories },
      visits: { $ne: trackingId },
      status: "active",
    })
      .sort({ impressions: -1 })
      .skip((pageNumber - 1) * 20)
      .limit(20);

    // Step 5: If recommended posts are less than 20, add random posts
    if (recommendedPosts.length < 20) {
      const remainingCount = 20 - recommendedPosts.length;

      // Get random posts using find instead of aggregate

      const excludeIds = recommendedPosts.map((post) => post._id);

      const randomPosts = await PostSchema.find({
        status: "active",
        visits: { $ne: trackingId }, // or use $nin if checking multiple tracking IDs
      })
        .sort({ impressions: -1 }) // Sort by impressions
        .limit(remainingCount); // Limit to remaining needed posts

      console.log(randomPosts.length, "random posts added to recommendations");
      recommendedPosts = [...recommendedPosts, ...randomPosts];
    }

    console.log(recommendedPosts.length, "total posts found");
    return recommendedPosts;
  } catch (err) {
    console.error("Recommendation error:", err);
    throw new Error("Failed to get recommended posts");
  }
};

export default getRecommendedPosts;
