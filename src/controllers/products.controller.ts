import { Request, Response } from "express";
import Product from "../models/Product";



export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, name, category, keyword, search } = req.query;

    const query: any = {};

  
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

   
    if (name) query.name = { $regex: name, $options: "i" };

    if (category) query.category = category;

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate("category", "name") // 
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};



// Create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, category, image } = req.body;
    const product = new Product({ name, price, description, category, image });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Delete product by ID
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};


// Update product by ID
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, image } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, description, category, image },
      { new: true } // return the updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

