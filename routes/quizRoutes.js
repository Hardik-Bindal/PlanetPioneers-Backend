import express from "express";
import {
  createQuiz,
  createQuizWithAI,
  getQuizzes,
  getQuizById,
} from "../controllers/quizController.js";
import { protect, teacherOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 📌 Create an AI-generated quiz (Teacher only)
 * @route   POST /api/quiz/ai
 * @access  Private (teacher)
 */
router.post("/ai", protect, teacherOnly, createQuizWithAI);

/**
 * 📌 Create a manual quiz (Teacher only)
 * @route   POST /api/quiz
 * @access  Private (teacher)
 */
router.post("/", protect, teacherOnly, createQuiz);

/**
 * 📌 Get all quizzes (Students & Teachers)
 * Supports optional filters via query params: ?topic=...&difficulty=...
 * @route   GET /api/quiz
 * @access  Private
 */
router.get("/", protect, getQuizzes);

/**
 * 📌 Get single quiz by ID
 * @route   GET /api/quiz/:id
 * @access  Private
 */
router.get("/:id", protect, getQuizById);

export default router;
