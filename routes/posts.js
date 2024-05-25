import { Router } from "express";
import upload from "../utils/multer.js";
import changes from "../utils/change.js";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import cloud from "../utils/cloudinary.js";
import PostModel from "../schema/posts.js";
import PostSchema from "../schema/posts.js";
import { findMatchingPropertyInObjects } from "../utils/addFoundInPropertyToSearch.js";

const PostsRoute = Router();

PostsRoute.get("/post", async (req, res) => {
  const { pageNumber } = req.query;

  console.log(pageNumber);
  try {
    const posts = await PostModel.find({ status: "active" })
      .sort({ updatedAt: -1 })
      .skip((pageNumber - 1) * 20)
      .limit(20);
    // const posts = await PostModel.find({ }).skip( (pageNumber - 1) * 20 ).limit(20);
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
    res.status(200).json(changes.arrayChangeFunctin(sendPosts));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// search in homepage
PostsRoute.get("/post/homepage/search", async (req, res) => {
  const { pageNumber, SearchTerm: searchTerm } = req.query;

  console.log(pageNumber);
  try {
    const posts = await PostModel.find({
      status: "active",
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
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
    res.status(200).json(changes.arrayChangeFunctin(sendPosts));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

// search in filter page
PostsRoute.get("/post/filter/search", async (req, res) => {
  const { pageNumber, searchTerm } = req.query;

  console.log(pageNumber);
  try {
    const posts = await PostModel.find({
      status: "active",
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ],
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
    res.status(200).json(changes.arrayChangeFunctin(sendPosts));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

PostsRoute.get("/post-admin", async (req, res) => {
  const { pageNumber } = req.query;

  console.log(pageNumber);
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
    res.status(200).json(changes.arrayChangeFunctin(sendPosts));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});
PostsRoute.get("/post/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const post = await PostModel.findById(_id);
    if (!post) {
      return res.status(404).json({ message: "This post does not exist" });
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
PostsRoute.post(
  "/post",
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    console.log(req.body, 65);
    console.log(typeof req.body.phoneNumber, 66);
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

      // Use Promise.all to wait for all uploads to complete
      await Promise.all(
        req.files.file.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          const { public_id, secure_url } = result;
          imageUrls.push({ public_id, url: secure_url });
        })
      );
      const data = {
        ...req.body,
        ownerId: verifiedToken.Id,
        coverImageUrl: imageUrls[0].url,
        postImages: imageUrls,
        phoneNumber:
          typeof req.body.phoneNumber == "object"
            ? req.body.phoneNumber[0]
            : req.body.phoneNumber,
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
    const mainEdit = await PostModel.findOneAndUpdate({ _id }, req.body);
    return res.status(200).json(mainEdit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});
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
    if (!authorization || authorization.length < 10) {
      return res.status(400).json({
        message: {
          name: "JsonWebTokenError",
          message: "invalid token",
        },
      });
    }
    const token = authorization.split("Bearer ")[1];
    console.log(token);
    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
    console.log(verifiedToken.role == "admin");
    if (!verifiedToken.role == "admin" || !verifiedToken.role == "manager") {
      return res.status(400).json({
        message: {
          name: "Authorization Error",
          message: "You are not an admin",
        },
      });
    }
    const posts = await PostSchema.find();

    return res.status(200).json({ ...posts });
  } catch (error) {}
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
    console.log(token);
    const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
    console.log(verifiedToken.role == "admin");
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
    return res.status(200).json(mainEdit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});
export default PostsRoute;
