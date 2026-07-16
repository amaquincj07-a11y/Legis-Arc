import { Router } from "express";
import { healthController } from "../controllers/health.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import publicRoutes from "./public.routes.js";
import companyRoutes from "./company.routes.js";

const router = Router();

router.get("/health", asyncHandler(healthController.check));

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/public", publicRoutes);
router.use("/company", companyRoutes);

export default router;
