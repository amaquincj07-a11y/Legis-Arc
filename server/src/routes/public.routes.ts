import { Router } from "express";
import { publicController } from "../controllers/public.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

const place = "/:province/:municipality";

router.get("/lgus", asyncHandler(publicController.listLgus));

router.get(`${place}/contact`, asyncHandler(publicController.contact));
router.get(`${place}/categories`, asyncHandler(publicController.listCategories));
router.get(`${place}/cso`, asyncHandler(publicController.listCso));
router.get(`${place}/sb-chart`, asyncHandler(publicController.sbChart));

router.get(`${place}/ordinances`, asyncHandler(publicController.listOrdinances));
router.get(`${place}/ordinances/:id`, asyncHandler(publicController.getOrdinance));

router.get(`${place}/resolutions`, asyncHandler(publicController.listResolutions));
router.get(`${place}/resolutions/:id`, asyncHandler(publicController.getResolution));

router.get(`${place}/minutes`, asyncHandler(publicController.listMinutes));
router.get(`${place}/minutes/:id`, asyncHandler(publicController.getMinutes));

router.post("/downloads", asyncHandler(publicController.recordDownload));

export default router;
