import { Router } from "express";
import { ResetPasswordController } from "@/controllers/reset-password.controller";
const router = Router();

router.post("/", ResetPasswordController.createResetToken);
router.get("/verify", ResetPasswordController.verifyResetToken);
router.post("/reset", ResetPasswordController.resetPassword);

export default router;