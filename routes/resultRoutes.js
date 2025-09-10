import express from "express";
import {
  attemptQuiz,
  getMyResults,
  getQuizResults,
  getLeaderboard,
} from "../controllers/resultController.js";
import { protect, studentOnly, teacherOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 📌 Attempt a Quiz (Students only)
 * @route   POST /api/results/:quizId/attempt
 * @access  Private (student)
 */
router.post("/:quizId/attempt", protect, studentOnly, attemptQuiz);

/**
 * 📌 Get logged-in student's results
 * @route   GET /api/results/my-results
 * @access  Private (student)
 */
router.get("/my-results", protect, studentOnly, getMyResults);

/**
 * 📌 Leaderboard - Top 10 Students
 * @route   GET /api/results/leaderboard
 * @access  Private
 */
router.get("/leaderboard", protect, getLeaderboard);

/**
 * 📌 Teacher views all results for a quiz
 * @route   GET /api/results/:quizId/results
 * @access  Private (teacher)
 */
router.get("/:quizId/results", protect, teacherOnly, getQuizResults);

export default router;
