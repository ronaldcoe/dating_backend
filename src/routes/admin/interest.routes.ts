import { Router } from "express";
import { AdminInterestController } from "@/controllers/admin/interest.controller";
import { authenticate, authorize } from "@/middlewares/auth";
import { Role } from "@prisma/client";
import { paginationMiddleware } from "@/middlewares/pagination.middleware";

const router = Router();

const validSortBy = ["createdAt", "updatedAt", "name"];
// Create a new interest
router.get('/', paginationMiddleware({validateSortBy:validSortBy}), AdminInterestController.getAllInterests);
router.post('/', AdminInterestController.createInterest);
router.put('/:id', AdminInterestController.editInterest);

export default router;