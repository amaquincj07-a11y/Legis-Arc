import { Router } from "express";
import { companyController } from "../controllers/company.controller.js";
import { requireCompanyAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(requireCompanyAuth);

router.get("/lgus", asyncHandler(companyController.listLgus));
router.get("/lgus/:id", asyncHandler(companyController.getLgu));
router.post("/lgus", asyncHandler(companyController.createLgu));
router.patch("/lgus/:id", asyncHandler(companyController.updateLgu));
router.patch(
  "/lgus/:id/subscription",
  asyncHandler(companyController.updateSubscription)
);

router.post("/lgus/:id/activate", asyncHandler(companyController.activate));
router.post("/lgus/:id/block", asyncHandler(companyController.block));
router.post("/lgus/:id/unblock", asyncHandler(companyController.unblock));

router.get("/lgus/:id/users", asyncHandler(companyController.listUsers));
router.post("/lgus/:id/users", asyncHandler(companyController.createUser));
router.post(
  "/lgus/:id/users/:userId/toggle-active",
  asyncHandler(companyController.toggleUserActive)
);

export default router;
