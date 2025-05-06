import { Router } from "express";
import { AdminPhotoController } from "@/controllers/admin/photo.controller";
import { authenticate, authorize, handleTokenRefresh } from "@/middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.patch("/:id/reject", AdminPhotoController.rejectPhoto);

export default router;