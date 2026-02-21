import express from "express";
import { getReview, getReviewStream } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/review", getReview);
router.post("/review/stream", getReviewStream);

export default router;
