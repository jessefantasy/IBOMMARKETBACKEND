import mongoose from "mongoose";
import { Router } from "express";
import jwt from "jsonwebtoken";
import upload from "../utils/multer.js";
import cloud from "../utils/cloudinary.js";
import { promisify } from "util";

import BusinessSchema, { IbommarketBusinessIDs } from "../schema/business.js";
import UserSchema from "../schema/user.js";
import PostSchema from "../schema/posts.js";
import change from "../utils/change.js";
import { createIbmId } from "../utils/createIbmId.js";
import axios from "axios";

const BusinessesRouter = Router();
// get all businesses
BusinessesRouter.get("/business", async (req, res) => {
  try {
    const businesses = await BusinessSchema.find({});
    res.status(200).json({ businesses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
});

// get business by owner id
BusinessesRouter.get("/business/:ownerId", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { ownerId } = req.params;

    // if (!authorization || authorization.length < 10) {
    //   return res.status(400).json({
    //     message: {
    //       name: "JsonWebTokenError",
    //       message: "invalid token",
    //     },
    //   });
    // }
    // const token = authorization.split("Bearer ")[1];

    // const verifiedToken = jwt.verify(token, process.env.JWTSECRET);

    // if (verifiedToken.Id !== ownerId) {
    //   return res
    //     .status(400)
    //     .json({ message: "You can only view your business" });
    // }

    const conditions = [];

    // Check if ownerId is a valid ObjectId before adding it to the conditions
    if (mongoose.Types.ObjectId.isValid(ownerId)) {
      conditions.push({ ownerId: ownerId });
    } else {
      conditions.push({ ibmId: Number(ownerId) });
    }
    console.log(conditions, 60);
    const business = await BusinessSchema.findOne({
      $or: conditions,
    });
    console.log(business, 64);
    if (!business) {
      return res
        .status(404)
        .json({ message: "This user doses not have a business setup" });
    }
    const businessPosts = await PostSchema.find({
      ownerId: business.ownerId,
      status: "active",
    }).sort({ updatedAt: -1 });

    let sendPosts = businessPosts.map((advert) => {
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

    console.log(business);

    let sendBusiness = {
      ...business._doc,
      createdAt: business.createdAt?.toString(),
      updatedAt: business.updatedAt?.toString(),
      _id: business._id.toString(),
      ownerId: business.ownerId.toString(),
      Token: business.ownerId.toString(),
      LogoUrl: business.logo,
      BusinessId: business.ibmId,
    };
    console.log(business);
    const finalBusiness = { ...sendBusiness, posts: sendPosts };
    res.status(200).json(change.mainChangeFunction(finalBusiness));
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: error });
  }
});

// get business by title
BusinessesRouter.get("/business-search", async (req, res) => {
  try {
    const { searchTerm } = req.query;

    const businesses = await BusinessSchema.find({
      businessName: { $regex: searchTerm, $options: "i" },
    });

    let sendBusinesses = businesses.map((business) => {
      return {
        ...business._doc,
        createdAt: business.createdAt?.toString(),
        updatedAt: business.updatedAt?.toString(),
        _id: business._id.toString(),
        ownerId: business.ownerId.toString(),
        Token: business.ownerId.toString(),
        LogoUrl: business.logo,
        BusinessId: business.ibmId,
      };
    });

    res.status(200).json(change.arrayChangeFunctin(sendBusinesses));
  } catch (error) {
    // console.log(error);
    res.status(500).json({ message: error });
  }
});

BusinessesRouter.get("/business/my-business/:ownerId", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { ownerId } = req.params;

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

    if (verifiedToken.Id !== ownerId) {
      return res
        .status(400)
        .json({ message: "You can only view your business" });
    }
    const business = await BusinessSchema.findOne({ ownerId });
    if (!business) {
      return res
        .status(404)
        .json({ message: "This user doses not have a business setup" });
    }
    const businessPosts = await PostSchema.find({ ownerId });

    let sendPosts = businessPosts.map((advert) => {
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

    console.log(business);

    let sendBusiness = {
      ...business._doc,
      createdAt: business.createdAt?.toString(),
      updatedAt: business.updatedAt?.toString(),
      _id: business._id.toString(),
      ownerId: business.ownerId.toString(),
      Token: business.ownerId.toString(),
      LogoUrl: business.logo,

      // postImages: "",
      // others: "",
    };
    const finalBusiness = { ...sendBusiness, posts: sendPosts };
    // console.log(sendBusiness);
    // res.status(200).json(f);
    res.status(200).json(change.mainChangeFunction(finalBusiness));
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
});

BusinessesRouter.post(
  "/business",
  upload.fields([{ name: "logo" }]),
  async (req, res) => {
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

      const verifiedToken = jwt.verify(token, process.env.JWTSECRET);
      let imageUrl;
      await Promise.all(
        req.files.logo.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          console.log(result);
          imageUrl = { logo: result.secure_url, logoId: result.public_id };
        })
      );
      const prevBusinessIds = await IbommarketBusinessIDs.findOne({});
      console.log(prevBusinessIds.IDS, 190);
      const newBusinessId = createIbmId(prevBusinessIds.IDS);

      prevBusinessIds.IDS.push(newBusinessId);
      await prevBusinessIds.save();
      const saveBusiness = new BusinessSchema({
        ...req.body,
        ownerId: verifiedToken.Id,
        ...imageUrl,
        ibmId: newBusinessId,
      });
      const result = await saveBusiness.save();
      const businessOwner = await UserSchema.findOneAndUpdate(
        { _id: verifiedToken.Id },
        { businessId: verifiedToken.Id }
      );
      res.status(200).json({ business: result });
    } catch (error) {
      console.log(error.code);
      if (error?.code == 11000) {
        let reason = "";
        for (let key in error.keyValue) {
          reason = error.keyValue[key];
        }
        res.statusMessage = `${reason} is already user by another Business`;
        return res
          .status(400)
          .json({ message: `${reason} is already user by another Business` });
      }
      res.status(500).json({ message: error });
    }
  }
);

BusinessesRouter.patch("/business/:_id", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { _id } = req.params;

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

    const business = await BusinessSchema.findOne({ _id });
    console.log(business);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (business.ownerId !== verifiedToken.Id) {
      return res
        .status(400)
        .json({ message: "you can only view your business" });
    }
    // const result = await saveBusiness.save();
    // const update

    for (const key in req.body) {
      business[key] = req.body[key];
      console.log(key, req.body[key]);
    }
    await business.save();
    res.status(200).json({ business });
  } catch (error) {
    console.log(error.code);
    if (error?.code == 11000) {
      let reason = "";
      for (let key in error.keyValue) {
        reason = error.keyValue[key];
      }
      console.log(reason);
      res.statusMessage = `${reason} is already user by another Business`;
      return res
        .status(400)
        .json({ message: `${reason} is already user by another Business` });
    }

    res.status(500).json({ message: error });
  }
});

BusinessesRouter.patch(
  "/business/:_id/image",
  upload.fields([{ name: "logo" }]),
  async (req, res) => {
    try {
      const { authorization } = req.headers;
      const { _id } = req.params;

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
      console.log("Finding business");
      const business = await BusinessSchema.findOne({ _id });
      console.log(business);

      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      if (business.ownerId !== verifiedToken.Id) {
        return res
          .status(400)
          .json({ message: "you can only view your business" });
      }
      console.log("Uploading new");
      let imageUrl;
      await Promise.all(
        req.files.logo.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          console.log(result);
          imageUrl = { logo: result.secure_url, logoId: result.public_id };
        })
      );
      console.log("deleting old");

      cloud.uploader.destroy(business.logoId).then(async (result) => {
        const newBody = { ...req.body, ...imageUrl };
        for (const key in newBody) {
          business[key] = newBody[key];
        }
        await business.save();
        res.status(200).json({ business });
      });
      console.log("hi");
    } catch (error) {
      console.log(error);
      if (error?.code == 11000) {
        let reason = "";
        for (let key in error.keyValue) {
          reason = error.keyValue[key];
        }
        res.statusMessage = `${reason} is already user by another Business`;
        return res
          .status(400)
          .json({ message: `${reason} is already user by another Business` });
      }
      res.status(500).json({ message: error });
    }
  }
);

BusinessesRouter.delete("/business/:_id", async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { _id } = req.params;

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
    console.log("Finding business");
    const business = await BusinessSchema.findOne({ _id });
    console.log(business);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (business.ownerId !== verifiedToken.Id) {
      return res
        .status(400)
        .json({ message: "you can only view your business" });
    }

    console.log("getting old");
    const deleteBusiness = await BusinessSchema.findOneAndDelete({ _id });
    console.log("deleting old");

    cloud.uploader.destroy(deleteBusiness.logoId).then(async (result) => {
      res.status(200).json({ message: "Business deleted", deleteBusiness });
    });
    console.log("hi");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
});

export default BusinessesRouter;
