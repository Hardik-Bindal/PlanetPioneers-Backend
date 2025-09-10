import Quiz from "../models/Quiz.js";
import Result from "../models/Result.js";
import User from "../models/User.js";

/**
 * 📌 Student submits quiz attempt
 * @route   POST /api/results/:quizId/attempt
 * @access  Private (student)
 */
export const attemptQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "⚠️ Answers are required in an array format" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "⚠️ Quiz not found" });

    let score = 0;
    const total = quiz.questions.length;

    // ✅ Evaluate student answers
    const evaluatedAnswers = quiz.questions.map((q) => {
      const studentAnswer = answers.find((a) => a.questionId == q._id.toString());

      // Normalize correct answers → always array
      const correctArray = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map((a) => a.trim().toUpperCase())
        : [q.correctAnswer.trim().toUpperCase()];

      // Normalize selected → always array
      const selectedArray = studentAnswer?.selectedAnswer
        ? (Array.isArray(studentAnswer.selectedAnswer)
            ? studentAnswer.selectedAnswer
            : [studentAnswer.selectedAnswer]
          ).map((a) => a.trim().toUpperCase())
        : [];

      // Compare sets (order-insensitive, must match fully)
      const isCorrect =
        correctArray.length === selectedArray.length &&
        correctArray.every((ans) => selectedArray.includes(ans));

      if (isCorrect) score++;

      return {
        questionId: q._id,
        selectedAnswer: selectedArray,
        correctAnswer: correctArray,
        explanation: q.explanation,
        isCorrect,
      };
    });

    // ✅ Save or update attempt (only latest attempt per student per quiz)
    const result = await Result.findOneAndUpdate(
      { quiz: quiz._id, student: req.user._id },
      {
        quiz: quiz._id,
        student: req.user._id,
        score,
        total,
        answers: evaluatedAnswers,
        attemptedAt: new Date(),
      },
      { new: true, upsert: true } // create new if not exists, else update
    );

    // ✅ Update ecoPoints & level
    const user = await User.findById(req.user._id);

    // Recalculate ecoPoints fresh (instead of stacking from old attempts)
    const allResults = await Result.find({ student: user._id });
    user.ecoPoints = allResults.reduce((sum, r) => sum + r.score * 10, 0);

    // Level = number of quizzes passed with >=70%
    const passed = allResults.filter((r) => r.score >= Math.ceil(r.total * 0.7));
    user.level = passed.length;

    await user.save();

    res.status(200).json({
      message: "✅ Quiz attempted successfully",
      score,
      total,
      ecoPoints: user.ecoPoints,
      level: user.level,
      result,
    });
  } catch (error) {
    console.error("❌ Error submitting quiz:", error);
    res.status(500).json({ message: "❌ Error submitting quiz", error: error.message });
  }
};

/**
 * 📌 Get all results of logged-in student
 * @route   GET /api/results/my-results
 * @access  Private (student)
 */
export const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate("quiz", "title description difficulty")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching results", error: error.message });
  }
};

/**
 * 📌 Teacher can view results of a specific quiz
 * @route   GET /api/results/:quizId/results
 * @access  Private (teacher)
 */
export const getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;

    const results = await Result.find({ quiz: quizId })
      .populate("student", "name email level ecoPoints")
      .sort({ score: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching quiz results", error: error.message });
  }
};

/**
 * 📌 Global Leaderboard (Top 10 Students)
 * @route   GET /api/results/leaderboard
 * @access  Private
 */
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ role: "student" })
      .select("name email level ecoPoints")
      .sort({ ecoPoints: -1, level: -1 })
      .limit(10);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching leaderboard", error: error.message });
  }
};
