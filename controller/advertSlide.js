import changes from "../utils/change.js";

import AdvertSlideModel from "../schema/advertSlide.js";

const getAllAdverts = async (req, res) => {
  try {
    const adverts = await AdvertSlideModel.find({});
    let sendAdverts = adverts.map((advert) => {
      // advert._id = advert._id.toString();
      return {
        ...advert._doc,
        createdAt: advert.createdAt.toString(),
        updatedAt: advert.updatedAt.toString(),
        _id: advert._id.toString(),
      };
    });
    res
      .status(200)
      .json(changes.arrayChangeFunction(sendAdverts, sendAdverts.length));
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
};

export default getAllAdverts;
