import { Router } from "express";
import { AdminInterestController } from "@/controllers/admin/interest.controller";
import { authenticate, authorize } from "@/middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

// Create a new interest
router.post('/', AdminInterestController.createInterest);
router.put('/:id', AdminInterestController.editInterest);

export default router;