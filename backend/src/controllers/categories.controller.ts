import { Request, Response } from "express";
import Category from "../models/Category";

// Create category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, parentCategory } = req.body;
    const category = new Category({ name, parentCategory: parentCategory || null });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
