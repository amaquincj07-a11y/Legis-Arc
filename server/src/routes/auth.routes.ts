import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/login", asyncHandler(authController.login));
router.get("/me", requireAuth, asyncHandler(authController.me));
router.post("/logout", requireAuth, asyncHandler(authController.logout));
router.post(
  "/password-reset/request",
  asyncHandler(authController.requestPasswordReset)
);
router.post(
  "/password-reset/complete",
  asyncHandler(authController.completePasswordReset)
);

export default router;
