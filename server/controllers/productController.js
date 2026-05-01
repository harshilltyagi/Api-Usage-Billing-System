import ApiProduct from "../models/ApiProduct.js";

export const createProduct = async (req, res) => {
  try {
    const { name, slug, baseUrl } = req.body;

    if (!name || !slug || !baseUrl) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const exists = await ApiProduct.findOne({ slug });

    if (exists) {
      return res.status(400).json({
        message: "Slug already exists",
      });
    }

    const product = await ApiProduct.create({
      name,
      slug,
      baseUrl,
      owner: req.user.id,
    });

    return res.status(201).json({
      message: "API Product created",
      product,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Create product failed",
    });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await ApiProduct.find({
      owner: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};
