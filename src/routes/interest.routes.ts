import { Router } from "express";
import { authenticate } from "@/middlewares/auth";
import { InterestController } from "@/controllers/interest.controller";
const router = Router()

router.get('/', authenticate, InterestController.getInterests);

export default router