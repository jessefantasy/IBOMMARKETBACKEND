import { Router } from "express";
import CategoriesSchema from "../schema/categories.js";
import cloud from "../utils/cloudinary.js";
import upload from "../utils/multer.js";
import { promisify } from "util";
import PostSchema from "../schema/posts.js";
import axios from "axios";

const CategoriesRouter = Router();

CategoriesRouter.get("/categories", async (req, res) => {
  try {
    const categories = await CategoriesSchema.find({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "internal server server" });
  }
});

// get single category
CategoriesRouter.get("/categories/:Id", async (req, res) => {
  try {
    const { Id } = req.params;
    const category = await CategoriesSchema.findOne({ Id });
    if (!category) {
      return res
        .status(404)
        .json({ message: "No category with this Id forund" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "internal server server" });
  }
});

// add category
CategoriesRouter.post(
  "/categories",
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    try {
      let prevId = 1;
      const prevCategories = await CategoriesSchema.find();
      if (prevCategories.length != 0) {
        prevId = prevCategories[prevCategories.length - 1].Id + 1;
      }
      let imageUrl;
      await Promise.all(
        req.files.file.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          imageUrl = {
            ImageUrl: result.secure_url,
            Public_Id: result.public_id,
          };
        })
      );

      const newCategory = new CategoriesSchema({
        ...req.body,
        Id: prevId,
        ...imageUrl,
      });

      const result = await newCategory.save();
      res.status(200).json({ result });
    } catch (error) {
      res.status(500).json({ message: "internal server server", ...error });
    }
  }
);

// delete single category
CategoriesRouter.delete("/categories/:Id", async (req, res) => {
  const { Id } = req.params;
  try {
    const result = await CategoriesSchema.findOneAndDelete({ Id });

    if (!result) {
      return res
        .status(404)
        .json({ message: "Category with this Id not found" });
    } else {
      let results = [];
      const imagesToDestroy = [result, ...result.Subcategories];
      await Promise.all(
        imagesToDestroy.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.destroy);
          const result = await uploadPromise(image.Public_Id);
          results.push(result);
        })
      );
      res.status(200).json({ message: "Category deleted", results });
    }
  } catch (error) {
    res.status(500).json({ message: "internal server server", error });
  }
});

// patch category without image
CategoriesRouter.patch("/categories/:Id", async (req, res) => {
  try {
    const { Id } = req.params;

    const result = await CategoriesSchema.findOneAndUpdate({ Id }, req.body, {
      new: false,
    });
    if (!result) {
      res.status(400).json({ message: "Category with id not found" });
    }
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ message: "internal server server", ...error });
  }
});

// patch single category with image
CategoriesRouter.patch(
  "/categories/:Id/image",
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
          imageUrl = {
            ImageUrl: result.secure_url,
            Public_Id: result.public_id,
          };
        })
      );
      sendData = { ...imageUrl, ...req.body };

      const saveData = await CategoriesSchema.findOneAndUpdate(
        { Id },
        sendData,
        {
          new: false,
        }
      );
      cloud.uploader.destroy(saveData.Public_Id).then((result) => {
        res.status(200).json({ message: "Updated category", saveData });
      });
    } catch (err) {
      res.status(500).json({ message: "Intername server error" });
    }
  }
);

// get single sub category
CategoriesRouter.get("/categories/:CatId/:Id", async (req, res) => {
  try {
    const { CatId, Id } = req.params;
    const mainCategory = await CategoriesSchema.findOne({ Id: CatId });
    if (!mainCategory) {
      return res.status(404).json({ message: "This category does not exist" });
    }

    if (Id == "all") {
      return res.status(200).json(mainCategory.Subcategories);
    }
    const subCategory = mainCategory.Subcategories.filter(
      (sub) => sub.Id == Id
    );
    if (!subCategory[0]) {
      return res
        .status(404)
        .json({ message: "This subcategory does not exist" });
    }
    res.status(200).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: "internal server server", ...error });
  }
});

// add sub category
CategoriesRouter.post(
  "/categories/:CatId",
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    try {
      const { CatId } = req.params;
      let prevId = 1;

      const mainCategory = await CategoriesSchema.findOne({ Id: CatId });
      if (!mainCategory) {
        return res
          .status(404)
          .json({ messgae: "Category with this id does not exist" });
      }
      const previousSubCaegories = mainCategory.Subcategories;
      if (previousSubCaegories.length != 0) {
        prevId = previousSubCaegories[previousSubCaegories.length - 1].Id + 1;
      }
      let imageUrl;
      await Promise.all(
        req.files.file.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          imageUrl = {
            ImageUrl: result.secure_url,
            Public_Id: result.public_id,
          };
        })
      );
      mainCategory.Subcategories.push({
        ...req.body,
        CategoryId: CatId,
        ...imageUrl,
        Id: prevId,
      });
      const result = await mainCategory.save();
      res.status(200).json({ result });
    } catch (error) {
      res.status(500).json({ message: "internal server server", error });
    }
  }
);

// delete sub category without
CategoriesRouter.delete("/categories/:CatId/:Id", async (req, res) => {
  try {
    const { CatId, Id } = req.params;
    const mainCategory = await CategoriesSchema.findOne({ Id: CatId });
    if (!mainCategory) {
      return res
        .status(404)
        .json({ message: "Category with this Id does not exist" });
    }
    const subCategoryExist = mainCategory.Subcategories.find(
      (one) => one.Id == Id
    );

    if (!subCategoryExist) {
      return res
        .status(404)
        .json({ message: "Subcategory with this Id does not exist" });
    }
    cloud.uploader.destroy(subCategoryExist.Public_Id).then(async (result) => {
      const newSubCategories = mainCategory.Subcategories.filter(
        (one) => one.Id != Id
      );
      mainCategory.Subcategories = newSubCategories;
      const save = await mainCategory.save();
      return res.status(200).json({ message: "deleted", ...save });
    });
  } catch (error) {
    res.status(500).json({ message: "internal server server", error });
  }
});

// patch sub category without images
CategoriesRouter.patch("/categories/:CatId/:Id", async (req, res) => {
  try {
    const { CatId, Id } = req.params;
    const mainCategory = await CategoriesSchema.findOne({ Id: CatId });
    if (!mainCategory) {
      return res
        .status(404)
        .json({ message: "Subcategory with this Id does not exist" });
    }
    const subCategoryExist = mainCategory.Subcategories.find(
      (one) => one.Id == Id
    );

    if (!subCategoryExist) {
      return res
        .status(404)
        .json({ message: "Subcategory with this Id does not exist" });
    }
    let patchedSubCategory = { ...subCategoryExist, ...req.body };
    const newSubCategories = mainCategory.Subcategories.filter(
      (one) => one.Id != Id
    );
    mainCategory.Subcategories = [
      ...newSubCategories,
      { ...subCategoryExist, ...req.body },
    ];

    const save = await mainCategory.save();
    if (save) {
      res.status(200).json({ message: "Sub category edited", mainCategory });
    }
  } catch (error) {
    res.status(500).json({ message: "internal server server", error });
  }
});
// patch sub category with image
CategoriesRouter.patch(
  "/categories/:CatId/:Id/image",
  upload.fields([{ name: "file" }]),
  async (req, res) => {
    try {
      const { CatId, Id } = req.params;
      const mainCategory = await CategoriesSchema.findOne({ Id: CatId });
      if (!mainCategory) {
        return res
          .status(404)
          .json({ message: "Subcategory with this Id does not exist" });
      }
      const subCategoryExist = mainCategory.Subcategories.find(
        (one) => one.Id == Id
      );

      if (!subCategoryExist) {
        return res
          .status(404)
          .json({ message: "Subcategory with this Id does not exist" });
      }
      let imageUrl;

      await Promise.all(
        req.files.file.map(async (image) => {
          const uploadPromise = promisify(cloud.uploader.upload);
          const result = await uploadPromise(image.path);
          imageUrl = {
            ImageUrl: result.secure_url,
            Public_Id: result.public_id,
          };
        })
      );

      let patchedSubCategory = {
        ...subCategoryExist,
        ...req.body,
        ...imageUrl,
      };

      const newSubCategories = mainCategory.Subcategories.filter(
        (one) => one.Id != Id
      );
      mainCategory.Subcategories = [...newSubCategories, patchedSubCategory];

      const save = await mainCategory.save();
      if (save) {
        cloud.uploader.destroy(subCategoryExist.Public_Id).then((result) => {
          res
            .status(200)
            .json({ message: "Sub category edited", mainCategory });
        });
      }
    } catch (error) {
      res.status(500).json({ message: "internal server server", error });
    }
  }
);

// get sub category ads count
CategoriesRouter.get(
  "/categories/subcategories/get-count/:Id",
  async (req, res) => {
    const { Id } = req.params;
    try {
      const result = await CategoriesSchema.findOne({
        Id: parseInt(Id),
      });
      if (!result) {
        return res
          .status(404)
          .json({ message: "Category with this Id not found" });
      }
      let results = [];
      let queries = [];
      result.Subcategories.forEach((subCategory) => {
        queries.push(
          PostSchema.find({
            categoryId: parseInt(Id),
            subcategoryId: subCategory.Id,
            status: "active",
          })
        );
      });
      let axiosResponse = await axios.all(queries);
      axiosResponse.forEach((one, index) => {
        results.push({
          count: one.length,
          Id: result.Subcategories[index].Id,
          Id: result.Subcategories[index].Name,
          SubCategories: result.Subcategories,
        });
      });
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: "internal server server", error });
    }
  }
);

export default CategoriesRouter;
