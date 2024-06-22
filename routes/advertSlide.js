import AdvertSlideModel from "../schema/advertSlide.js";
import { Router } from "express";
import upload from "../utils/multer.js";
import cloud from "../utils/cloudinary.js";
import { promisify } from "util";
import getAllAdverts from "../controller/advertSlide.js";

const AdvertSlideRoute = Router();

AdvertSlideRoute.get("/adverts", getAllAdverts);
AdvertSlideRoute.get("/adverts/:Id", async (req, res) => {
  try {
    const { Id } = req.params;
    const advert = await AdvertSlideModel.findOne({ Id });
    if (!advert) {
      return res.status(404).json({ message: "Advert not found" });
    }
    res.status(200).json({ advert });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
});
AdvertSlideRoute.post(
  "/adverts",
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    let imageUrl;
    try {
      await Promise.all(
        req.files.file.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          imageUrl = { url: result.secure_url, id: result.public_id };
        })
      );
      const { name } = req.body;
      let lastId;
      const prevAdverts = await AdvertSlideModel.find({});
      if (prevAdverts.length == 0) {
        lastId = 1;
      } else {
        lastId = prevAdverts[prevAdverts.length - 1].id + 1;
      }
      const data = {
        name,
        url: imageUrl.url,
        asset_id: imageUrl.id,
        id: lastId,
      };
      const saveData = new AdvertSlideModel(data);
      const result = await saveData.save();

      res.status(200).json({ result });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }
);
AdvertSlideRoute.delete("/adverts/:Id", async (req, res) => {
  const { Id } = req.params;
  try {
    // const data =
    const data = await AdvertSlideModel.findOneAndDelete({ Id });
    cloud.uploader.destroy(data.Asset_id).then((result) => {
      res.status(200).json({ message: "Deleted advert", result });
    });
  } catch (err) {
    res.status(500).json({ message: "Internam server error" });
  }
});

AdvertSlideRoute.patch("/adverts/:Id", async (req, res) => {
  const { Id } = req.params;
  try {
    const newAdvert = await AdvertSlideModel.findOneAndUpdate(
      { Id },
      req.body,
      { new: true }
    );

    res.status(200).json({ newAdvert });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
AdvertSlideRoute.patch(
  "/adverts/:Id/image",
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    let imageUrl;
    let sendData;
    const { Id } = req.params;
    try {
      await Promise.all(
        req.files.file.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          imageUrl = { Url: result.secure_url, Asset_id: result.public_id };
        })
      );
      sendData = { ...imageUrl, ...req.body };

      const saveData = await AdvertSlideModel.findOneAndUpdate(
        { Id },
        sendData,
        { new: false }
      );
      cloud.uploader.destroy(saveData.Asset_id).then((result) => {
        res.status(200).json({ message: "Updated advert", saveData });
      });
    } catch (err) {
      res.status(500).json({ message: "Intername server error" });
    }
    // res.status(200).json({ newAdvert: "dd" });
  }
);
export default AdvertSlideRoute;
