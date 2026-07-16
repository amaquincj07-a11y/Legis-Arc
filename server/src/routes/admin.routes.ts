import { Router } from "express";
import { ordinancesController } from "../controllers/ordinances.controller.js";
import { resolutionsController } from "../controllers/resolutions.controller.js";
import { minutesController } from "../controllers/minutes.controller.js";
import { categoriesController } from "../controllers/categories.controller.js";
import {
  accountController,
  activityController,
  committeesController,
  csoController,
  dashboardController,
  downloadLogsController,
  sbMembersController,
  usersController,
} from "../controllers/admin-misc.controller.js";
import {
  requireLguAuth,
  requireLguPrimaryAdmin,
} from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { imageUpload } from "../lib/upload.js";
import { pdfUpload } from "../lib/upload.js";

const router = Router();

router.use(requireLguAuth);

// Dashboard
router.get("/dashboard/stats", asyncHandler(dashboardController.stats));

// Ordinances
router.get("/ordinances", asyncHandler(ordinancesController.list));
router.get("/ordinances/:id", asyncHandler(ordinancesController.getById));
router.post(
  "/ordinances",
  ...pdfUpload("ordinances").single("pdf"),
  asyncHandler(ordinancesController.create)
);
router.patch(
  "/ordinances/:id",
  ...pdfUpload("ordinances").single("pdf"),
  asyncHandler(ordinancesController.update)
);
router.delete("/ordinances/:id", asyncHandler(ordinancesController.remove));
router.post(
  "/ordinances/:id/publish",
  asyncHandler(ordinancesController.togglePublish)
);

// Resolutions
router.get("/resolutions", asyncHandler(resolutionsController.list));
router.get("/resolutions/:id", asyncHandler(resolutionsController.getById));
router.post(
  "/resolutions",
  ...pdfUpload("resolutions").single("pdf"),
  asyncHandler(resolutionsController.create)
);
router.patch(
  "/resolutions/:id",
  ...pdfUpload("resolutions").single("pdf"),
  asyncHandler(resolutionsController.update)
);
router.delete("/resolutions/:id", asyncHandler(resolutionsController.remove));
router.post(
  "/resolutions/:id/publish",
  asyncHandler(resolutionsController.togglePublish)
);

// Minutes
router.get("/minutes", asyncHandler(minutesController.list));
router.get("/minutes/:id", asyncHandler(minutesController.getById));
router.post(
  "/minutes",
  ...pdfUpload("minutes").single("pdf"),
  asyncHandler(minutesController.create)
);
router.patch(
  "/minutes/:id",
  ...pdfUpload("minutes").single("pdf"),
  asyncHandler(minutesController.update)
);
router.delete("/minutes/:id", asyncHandler(minutesController.remove));
router.post(
  "/minutes/:id/publish",
  asyncHandler(minutesController.togglePublish)
);

// Categories
router.get("/categories", asyncHandler(categoriesController.list));
router.post("/categories", asyncHandler(categoriesController.create));
router.patch("/categories/:id", asyncHandler(categoriesController.update));
router.delete("/categories/:id", asyncHandler(categoriesController.remove));

// Org chart
router.get("/sb-members", asyncHandler(sbMembersController.list));
router.post(
  "/sb-members",
  ...imageUpload("sb-members").single("image"),
  asyncHandler(sbMembersController.create)
);
router.patch(
  "/sb-members/:id",
  ...imageUpload("sb-members").single("image"),
  asyncHandler(sbMembersController.update)
);
router.delete("/sb-members/:id", asyncHandler(sbMembersController.remove));

router.get("/committees", asyncHandler(committeesController.list));
router.post("/committees", asyncHandler(committeesController.create));
router.patch("/committees/:id", asyncHandler(committeesController.update));
router.delete("/committees/:id", asyncHandler(committeesController.remove));

router.get("/cso", asyncHandler(csoController.list));
router.post("/cso", asyncHandler(csoController.create));
router.patch("/cso/:id", asyncHandler(csoController.update));
router.delete("/cso/:id", asyncHandler(csoController.remove));

// Logs
router.get("/activity-logs", asyncHandler(activityController.list));
router.get("/download-logs", asyncHandler(downloadLogsController.list));

// Account / billing
router.get("/account", asyncHandler(accountController.get));
router.get("/billing/overview", asyncHandler(accountController.billingOverview));
router.get("/billing/history", asyncHandler(accountController.billingHistory));

// Users (primary admin)
router.get(
  "/users",
  requireLguPrimaryAdmin,
  asyncHandler(usersController.list)
);
router.post(
  "/users",
  requireLguPrimaryAdmin,
  asyncHandler(usersController.create)
);
router.patch(
  "/users/:id",
  requireLguPrimaryAdmin,
  asyncHandler(usersController.update)
);
router.post(
  "/users/:id/toggle-active",
  requireLguPrimaryAdmin,
  asyncHandler(usersController.toggleActive)
);

export default router;
