import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";

// CREATE user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// READ all users (with filters, search, pagination)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, name, email, role, search } = req.query;

    const filters: any = {};

    if (name) filters.name = { $regex: name, $options: "i" };
    if (email) filters.email = { $regex: email, $options: "i" };
    if (role) filters.role = role;

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filters);
    const users = await User.find(filters)
      .select("name email role createdAt")
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    res.json({
      total,
      page: +page,
      pages: Math.ceil(total / +limit),
      users,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// READ one user
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// UPDATE user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const updateData: any = { name, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// DELETE user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
