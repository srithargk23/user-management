import { Router } from "express";
import { getProducts, createProduct, deleteProduct ,updateProduct  } from "../controllers/products.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

// List products
router.get("/", authenticate, getProducts);

// Create product (admin only)
router.post("/", authenticate, requireRole("admin"), createProduct);

// Delete product (admin only)
router.delete("/:id", authenticate, requireRole("admin"), deleteProduct);

// Update product (admin only)
router.put("/:id", authenticate, requireRole("admin"), updateProduct);


export default router;
