import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/users.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();


router.get("/", authenticate, requireRole("admin"), getUsers); 
router.post("/", authenticate, requireRole("admin"), createUser); 
router.put("/:id", authenticate, requireRole("admin"), updateUser);
router.delete("/:id", authenticate, requireRole("admin"), deleteUser);


router.get("/me", authenticate, async (req: any, res) => {
  try {
    res.json(req.user); 
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Allow normal user to update their own profile
router.put("/me", authenticate, async (req: any, res) => {
  try {
    const { name, email, password } = req.body;

    // user can only update self
    const updateData: any = { name, email };
    if (password) {
      const bcrypt = await import("bcrypt");
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await req.models.User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

export default router;
