import { Router } from "express";
import upload from "../utils/multer.js";
import changes from "../utils/change.js";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import cloud from "../utils/cloudinary.js";
import PostModel from "../schema/posts.js";
import PostSchema from "../schema/posts.js";
import { findMatchingPropertyInObjects } from "../utils/addFoundInPropertyToSearch.js";
import { convertToMongooseQuery } from "../utils/formartQueryParams.js";
import { getCookie } from "../utils/cookie.js";
import CategoriesSchema from "../schema/categories.js";
import BusinessSchema from "../schema/business.js";
import UserVisitsSchema from "../schema/userVsits.js";
import handleTrackUUID from "../utils/trackUUIDHandler.js";
import axios from "axios";
import getRecommendedPosts from "../utils/getRecommendedPosts.js";
import { uploadRateLimit } from "../middlewares/rateLimiters.js";

const PostsRoute = Router();

PostsRoute.get("/post", async (req, res) => {
  const { pageNumber } = req.query;
  const { trackId } = req.query;

  try {
    console.log("trackId", trackId);
    let userVisit;
    // Handle track UUID operations
    // if (trackId) {
    //   userVisit = await handleTrackUUID(trackId);
    // }

    // const posts = await getRecommendedPosts(trackId, pageNumber);

    const posts = await PostModel.find({ status: "active" })
      .sort({ updatedAt: -1 })
      .skip((pageNumber - 1) * 20)
      .limit(20);
    // const posts = await PostModel.find({})
    //   .skip((pageNumber - 1) * 20)
    //   .limit(20);
    // const posts = await PostModel.find({});

    let sendPosts = posts.map((advert) => {
      // advert._id = advert._id.toString();
      return {
        ...advert._doc,
        createdAt: advert.createdAt.toString(),
        updatedAt: advert.updatedAt.toString(),
        _id: advert._id.toString(),
        ownerId: advert.ownerId.toString(),
        PropertyPhotos: advert.postImages,
        Token: advert._id.toString(),
        BusinessToken: advert.ownerId.toString(),
        // postImages: "",
        // others: "",
      };
    });
    res.status(200).json(changes.arrayChangeFunction(sendPosts));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// search in homepage
PostsRoute.get("/post/homepage/search", async (req, res) => {
  const { pageNumber, SearchTerm: searchTerm } = req.query;

  try {
    const posts = await PostModel.find({
      status: "active",
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { categoryName: { $regex: searchTerm, $options: "i" } },
        { subcategoryName: { $regex: searchTerm, $options: "i" } },
      ],
    }).limit(5);

    let sendPosts = posts.map((advert) => {
      // advert._id = advert._id.toString();
      return {
        ...advert._doc,
        createdAt: advert.createdAt.toString(),
        updatedAt: advert.updatedAt.toString(),
        _id: advert._id.toString(),
        ownerId: advert.ownerId.toString(),
        PropertyPhotos: advert.postImages,
        Token: advert._id.toString(),
        BusinessToken: advert.ownerId.toString(),
        // postImages: "",
        // others: "",
      };
    });
    sendPosts = findMatchingPropertyInObjects(sendPosts, searchTerm);
    res.status(200).json(changes.arrayChangeFunction(sendPosts));
  } catch (error) {
    res.status(500).json({ error });
  }
});

// get rejected post
PostsRoute.get("/post-rejected/:_id", async (req, res) => {
  const { _id } = req.params;
  const { authorization } = req.headers;

  try {
    if (!authorization || authorization.length < 10) {
      return res.status(400).json({
        message: {
          name: "JsonWebTokenError",
          message: "invalid token",
        },
      });
    }
    const token = authorization.split("Bearer ")[1];

    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
    const rejectedPost = await PostModel.findOne({ _id, status: "rejected" });
    if (!rejectedPost) {
      return res.status(404).json({
        message: "No post with this id found",
      });
    }

    if (verifiedToken.Id !== rejectedPost.ownerId.toString()) {
      return res.status(400).json({
        message: "You can only edit your own post",
      });
    }

    let sendPost = {
      ...rejectedPost._doc,
      createdAt: rejectedPost.createdAt.toString(),
      updatedAt: rejectedPost.updatedAt.toString(),
      _id: rejectedPost._id.toString(),
      ownerId: rejectedPost.ownerId.toString(),
      PropertyPhotos: rejectedPost.postImages,
      Token: rejectedPost._id.toString(),
      BusinessToken: rejectedPost.ownerId.toString(),
    };
    res.status(200).json(changes.mainChangeFunction(sendPost));
  } catch (error) {
    res.status(500).json({ error });
  }
});

// search in filter page
PostsRoute.get("/post/filter/search", async (req, res) => {
  const { searchTerm: title } = req.query;

  const { searchTerm, ...formQueryParams } = req.query;
  const mainQueryObject = convertToMongooseQuery(formQueryParams);

  try {
    console.log({
      status: "active",
      $or: [
        { title: { $regex: title, $options: "i" } },
        { description: { $regex: title, $options: "i" } },
        { categoryName: { $regex: title, $options: "i" } },
        { subcategoryName: { $regex: title, $options: "i" } },
      ],
      ...mainQueryObject,
    });
    const posts = await PostModel.find({
      status: "active",
      $or: [
        { title: { $regex: title, $options: "i" } },
        { description: { $regex: title, $options: "i" } },
        { categoryName: { $regex: title, $options: "i" } },
        { subcategoryName: { $regex: title, $options: "i" } },
      ],
      ...mainQueryObject,
    }).limit(50);

    let sendPosts = posts.map((advert) => {
      // advert._id = advert._id.toString();
      return {
        ...advert._doc,
        createdAt: advert.createdAt.toString(),
        updatedAt: advert.updatedAt.toString(),
        _id: advert._id.toString(),
        ownerId: advert.ownerId.toString(),
        PropertyPhotos: advert.postImages,
        Token: advert._id.toString(),
        BusinessToken: advert.ownerId.toString(),
        // postImages: "",
        // others: "",
      };
    });
    sendPosts = findMatchingPropertyInObjects(sendPosts, searchTerm);
    res.status(200).json(changes.arrayChangeFunction(sendPosts));
  } catch (error) {
    res.status(500).json({ error });
  }
});

PostsRoute.get("/post-admin", async (req, res) => {
  const { pageNumber } = req.query;

  try {
    // const posts = await PostModel.find({status : "active" }).skip( (pageNumber - 1) * 20 ).limit(20);
    const posts = await PostModel.find({})
      .sort({ updatedAt: -1 })
      .skip((pageNumber - 1) * 20)
      .limit(20);
    // const posts = await PostModel.find({ })

    let sendPosts = posts.map((advert) => {
      // advert._id = advert._id.toString();
      return {
        ...advert._doc,
        createdAt: advert.createdAt.toString(),
        updatedAt: advert.updatedAt.toString(),
        _id: advert._id.toString(),
        ownerId: advert.ownerId.toString(),
        PropertyPhotos: advert.postImages,
        Token: advert._id.toString(),
        BusinessToken: advert.ownerId.toString(),
        // postImages: "",
        // others: "",
      };
    });
    res.status(200).json(changes.arrayChangeFunction(sendPosts));
  } catch (error) {
    res.status(500).json({ error });
  }
});
// admin get one

PostsRoute.get("/post-admin/:_id", async (req, res) => {
  const { _id } = req.params;

  try {
    const post = await PostModel.findOne({ _id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    let sendPost = {
      ...post._doc,
      createdAt: post.createdAt.toString(),
      updatedAt: post.updatedAt.toString(),
      _id: post._id.toString(),
      ownerId: post.ownerId.toString(),
      PropertyPhotos: post.postImages,
      Token: post._id.toString(),
      BusinessToken: post.ownerId.toString(),
    };
    res.status(200).json(changes.mainChangeFunction(sendPost));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// get one post
PostsRoute.get("/post/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { cookie: deviceCookie, isMine } = req.query;

    const post = await PostModel.findOne({ _id, status: "active" });
    if (!post) {
      return res.status(404).json({ message: "This post does not exist" });
    }
    // const deviceCookie = getCookie(req.headers.cookie, "ibm-device-id");

    if (
      deviceCookie &&
      isMine != post.ownerId &&
      !post.visits.includes(deviceCookie)
    ) {
      post.visits.push(deviceCookie);
    }

    if (deviceCookie && isMine != post.ownerId) {
      post.impressions = post.impressions + 1;
    }

    await post.save();
    let sendPost = {
      ...post._doc,
      createdAt: post.createdAt.toString(),
      updatedAt: post.updatedAt.toString(),
      _id: post._id.toString(),
      ownerId: post.ownerId.toString(),
      PropertyPhotos: post.postImages,
      Token: post._id.toString(),
      BusinessToken: post.ownerId.toString(),
    };
    res.status(200).json(changes.mainChangeFunction(sendPost));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// add phoneViews
PostsRoute.get("/post-phoneviews/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { cookie: deviceCookie } = req.query;
    const post = await PostModel.findById(_id);
    if (!post) {
      return res.status(404).json({ message: "This post does not exist" });
    }
    // const deviceCookie = getCookie(req.headers.cookie, "ibm-device-id");

    if (deviceCookie && !post.phoneViews.includes(deviceCookie)) {
      post.phoneViews.push(deviceCookie);
    }
    // console.log(deviceCookie);
    await post.save();
    res.status(200).json({
      message: "Done ...",
      cookie: deviceCookie,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

//
PostsRoute.get(
  "/post/relatedproperties/:_id/:subcategoryId",
  async (req, res) => {
    try {
      const { _id, subcategoryId } = req.params;
      const posts = await PostModel.find({ subcategoryId, status: "active" });
      let sendPosts = posts.map((post) => {
        return {
          ...post._doc,
          createdAt: post.createdAt?.toString(),
          updatedAt: post.updatedAt?.toString(),
          _id: post._id?.toString(),
          ownerId: post.ownerId?.toString(),
          PropertyPhotos: post.postImages,
          Token: post._id?.toString(),
          BusinessToken: post.ownerId?.toString(),
        };
      });

      res.status(200).json(changes.mainChangeFunction(sendPosts));
    } catch (error) {
      res.status(500).json({ error });
    }
  }
);

//
PostsRoute.post(
  "/post",
  uploadRateLimit,
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    try {
      const imageUrls = [];

      const { authorization } = req.headers;

      if (!authorization || authorization.length < 10) {
        return res.status(400).json({
          message: {
            name: "JsonWebTokenError",
            message: "invalid token",
          },
        });
      }
      const token = authorization.split("Bearer ")[1];

      const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
      // confirm category  and subcategory
      const belongsHere = await CategoriesSchema.findOne({
        Id: req.body.categoryId,
      });

      if (!belongsHere) {
        return res
          .status(400)
          .json({ message: "This category does not exist" });
      }
      const categoryAndSubDetails = {
        categoryName: "",
        subcategoryName: "",
      };
      categoryAndSubDetails.categoryName = belongsHere.Name;
      let subExits = 0;
      belongsHere.Subcategories.forEach((one) => {
        if (one.Id == Number(req.body.subcategoryId)) {
          subExits++;
          categoryAndSubDetails.subcategoryName = one.Name;
        }
      });
      if (subExits == 0) {
        return res
          .status(400)
          .json({ message: "This sub-category does not exist" });
      }

      // Use Promise.all to wait for all uploads to complete
      await Promise.all(
        req.files.file.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          const { public_id, secure_url } = result;
          imageUrls.push({ public_id, url: secure_url });
        })
      );

      // imageUrls.push({
      //   public_id: "givjgyxe8pp0dgccypfp",
      //   url: "https://res.cloudinary.com/dggvnotet/image/upload/v1718383131/givjgyxe8pp0dgccypfp.jpg",
      // });

      const { others, ...withoutOthers } = req.body;

      const data = {
        ...withoutOthers,
        ownerId: verifiedToken.Id,
        coverImageUrl: imageUrls[0].url,
        postImages: imageUrls,
        ...categoryAndSubDetails,
        phoneNumber:
          typeof req.body.phoneNumber == "object"
            ? req.body.phoneNumber[0]
            : req.body.phoneNumber,
        others: JSON.parse(req.body.others),
      };
      const saveData = new PostModel(data);
      const result = await saveData.save();

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error });
    }
  }
);

// patch without image
PostsRoute.patch("/post/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { authorization } = req.headers;

    if (!authorization || authorization.length < 10) {
      return res.status(400).json({
        message: {
          name: "JsonWebTokenError",
          message: "invalid token",
        },
      });
    }
    const token = authorization.split("Bearer ")[1];

    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
    const editPost = await PostModel.findOne({ _id });
    if (!editPost) {
      return res.status(404).json({
        message: "No post with this id found",
      });
    }

    if (verifiedToken.Id !== editPost.ownerId.toString()) {
      return res.status(400).json({
        message: "You can only edit your own post",
      });
    }
    const mainEdit = await PostModel.findOneAndUpdate(
      { _id },
      { ...req.body, status: "pending" }
    );
    return res.status(200).json(mainEdit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});

// edit post with image
PostsRoute.patch(
  "/post/:_id/image",
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    try {
      const { _id } = req.params;
      const { authorization } = req.headers;

      if (!authorization || authorization.length < 10) {
        return res.status(400).json({
          message: {
            name: "JsonWebTokenError",
            message: "invalid token",
          },
        });
      }
      const token = authorization.split("Bearer ")[1];

      const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
      const editPost = await PostModel.findOne({ _id });
      if (!editPost) {
        return res.status(404).json({
          message: "No post with this id found",
        });
      }

      if (verifiedToken.Id !== editPost.ownerId.toString()) {
        return res.status(400).json({
          message: "You can only edit your own post",
        });
      }
      const imageUrls = [];
      await Promise.all(
        req.files.file.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          const { public_id, secure_url } = result;
          imageUrls.push({ public_id, url: secure_url });
        })
      );

      const newData = {
        ...req.body,
        coverImageUrl: imageUrls[0].url,
        postImages: imageUrls,
        status: "pending",
      };

      const saveNewPost = await PostModel.findOneAndUpdate({ _id }, newData);
      if (saveNewPost) {
        {
          let results = [];
          await Promise.all(
            editPost.postImages.map(async (image) => {
              const uploadPromise = promisify(cloud.uploader.destroy);
              const result = await uploadPromise(image.public_id);
              results.push(result);
            })
          );
          res.status(200).json({ message: "Post updated", results });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error });
    }
  }
);

// close advert

PostsRoute.patch("/post-open-close/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { authorization } = req.headers;

    if (!authorization || authorization.length < 10) {
      return res.status(400).json({
        message: {
          name: "JsonWebTokenError",
          message: "invalid token",
        },
      });
    }
    const token = authorization.split("Bearer ")[1];

    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
    const editPost = await PostModel.findOne({ _id });
    if (!editPost) {
      return res.status(404).json({
        message: "No post with this id found",
      });
    }

    if (verifiedToken.Id !== editPost.ownerId.toString()) {
      return res.status(400).json({
        message: "You can only edit your own post",
      });
    }
    const mainEdit = await PostModel.findOneAndUpdate(
      { _id },
      { status: req.body.status }
    );
    return res.status(200).json(mainEdit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});

PostsRoute.delete("/post/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { authorization } = req.headers;

    if (!authorization || authorization.length < 10) {
      return res.status(400).json({
        message: {
          name: "JsonWebTokenError",
          message: "invalid token",
        },
      });
    }
    const token = authorization.split("Bearer ")[1];

    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
    const editPost = await PostModel.findOne({ _id });
    if (!editPost) {
      return res.status(404).json({
        message: "No post with this id found",
      });
    }

    if (verifiedToken.Id !== editPost.ownerId.toString()) {
      return res.status(400).json({
        message: "You can only edit your own post",
      });
    }

    const deletePost = await PostModel.findOneAndDelete({ _id });
    if (deletePost) {
      {
        let results = [];
        await Promise.all(
          deletePost.postImages.map(async (image) => {
            const uploadPromise = promisify(cloud.uploader.destroy);
            const result = await uploadPromise(image.public_id);
            results.push(result);
          })
        );
        res.status(200).json({ message: "Post deleted", results });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});

// admin interraction

// admin and manager get

PostsRoute.get("/admin-manager/get-post", async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(400).json({
        message: {
          name: "JsonWebTokenError",
          message: "Invalid or missing token",
        },
      });
    }

    const token = authorization.split("Bearer ")[1];
    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);

    // FIXED: Use proper logical OR
    if (verifiedToken.role !== "admin" && verifiedToken.role !== "manager") {
      return res.status(403).json({
        message: {
          name: "AuthorizationError",
          message: "You are not authorized",
        },
      });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      PostSchema.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      PostSchema.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      currentPage: page,
      totalPages,
      pageSize: limit,
      totalItems: total,
      items: posts,
    });
  } catch (error) {
    console.error("Error in get-post route:", error);
    return res.status(500).json({
      message: {
        name: "ServerError",
        message: "Something went wrong",
      },
    });
  }
});

// admin and manager edit
PostsRoute.patch("/admin/admin-manager-edit-post/:_id", async (req, res) => {
  try {
    const { _id } = req.params;

    const { authorization } = req.headers;
    if (!authorization || authorization.length < 10) {
      return res.status(400).json({
        message: {
          name: "JsonWebTokenError",
          message: "invalid token",
        },
      });
    }
    const token = authorization.split("Bearer ")[1];
    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
    if (!verifiedToken.role == "admin" || !verifiedToken.role == "manager") {
      return res.status(400).json({
        message: {
          name: "Authorization Error",
          message: "You are not an admin",
        },
      });
    }
    const editPost = await PostModel.findOne({ _id });

    if (!editPost) {
      return res.status(404).json({
        message: "No post with this id found",
      });
    }

    const mainEdit = await PostModel.findOneAndUpdate({ _id }, req.body);
    if (req.body.status == "active") {
      const business = await BusinessSchema.findOne({
        ownerId: mainEdit.ownerId,
      });
      await BusinessSchema.findOneAndUpdate(
        { ownerId: mainEdit.ownerId },
        { activePosts: business.activePosts + 1 }
      );
    }
    // if(req.body)
    return res.status(200).json(mainEdit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});

// Test route for track UUID functionality
PostsRoute.get("/test-track-uuid/:trackId", async (req, res) => {
  try {
    const { trackId } = req.params;

    // Test the track UUID handler
    const result = await handleTrackUUID(trackId);

    res.status(200).json({
      message: "Track UUID operation completed successfully",
      trackId: trackId,
      result: result,
    });
  } catch (error) {
    console.error("Error in test track UUID route:", error);
    res.status(500).json({
      message: "Error processing track UUID",
      error: error.message,
    });
  }
});

export default PostsRoute;
