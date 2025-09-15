import { Router } from "express";
import { createCategory, getCategories } from "../controllers/categories.controller";

const router = Router();

router.post("/", createCategory);
router.get("/", getCategories);

export default router;
