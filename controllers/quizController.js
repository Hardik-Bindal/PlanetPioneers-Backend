import Quiz from "../models/Quiz.js";
import { generateQuizWithAI } from "../utils/aiHelper.js";

/**
 * 🛠 Normalize input so it always matches schema
 */
const normalizeQuestions = (questions = []) => {
  return questions.map((q) => {
    if (q.questionText && Array.isArray(q.options)) {
      return q;
    } else {
      return {
        questionText: q.question || "",
        options: [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "",
      };
    }
  });
};

/**
 * 📌 Create Quiz (Manual - Teachers only)
 * @route   POST /api/quiz
 * @access  Private (teacher)
 */
export const createQuiz = async (req, res) => {
  try {
    const { title, description, topic, category, difficulty, questions } = req.body;

    if (!title || !topic || !questions?.length) {
      return res.status(400).json({ message: "⚠️ Title, topic and questions are required" });
    }

    const formattedQuestions = normalizeQuestions(questions);

    const quiz = await Quiz.create({
      title,
      description,
      topic,
      category,
      difficulty,
      questions: formattedQuestions,
      createdBy: req.user.id,
      isAI: false,
    });

    res.status(201).json({ message: "✅ Quiz created successfully", quiz });
  } catch (error) {
    res.status(500).json({ message: "❌ Error creating quiz", error: error.message });
  }
};

/**
 * 📌 Get All Quizzes (Students & Teachers)
 * Returns only quiz metadata (not questions/answers)
 * @route   GET /api/quiz
 * @access  Private
 */
export const getQuizzes = async (req, res) => {
  try {
    const { topic, category, difficulty, createdBy } = req.query;
    let filter = {};

    if (topic) filter.topic = new RegExp(topic, "i");
    if (category) filter.category = new RegExp(category, "i");
    if (difficulty) filter.difficulty = difficulty;
    if (createdBy) filter.createdBy = createdBy;

    const quizzes = await Quiz.find(filter)
      .populate("createdBy", "name email role")
      .select("title description topic difficulty category createdBy isAI createdAt");

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching quizzes", error: error.message });
  }
};

/**
 * 📌 Get Single Quiz by ID (for attempting)
 * Hides correct answers & explanations
 * @route   GET /api/quiz/:id
 * @access  Private
 */
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("createdBy", "name email")
      .lean();

    if (!quiz) return res.status(404).json({ message: "⚠️ Quiz not found" });

    // Remove sensitive info before sending to students
    quiz.questions = quiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
    }));

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: "❌ Error fetching quiz", error: error.message });
  }
};

/**
 * 📌 Create AI-Generated Quiz (Teachers only)
 * @route   POST /api/quiz/ai
 * @access  Private (teacher)
 */
export const createQuizWithAI = async (req, res) => {
  try {
    const { topic, category, difficulty, numQuestions } = req.body;

    if (!topic || !difficulty) {
      return res.status(400).json({ message: "⚠️ Topic and difficulty are required for AI quiz" });
    }

    const aiQuestions = await generateQuizWithAI(topic, difficulty, numQuestions || 5);
    const formattedQuestions = normalizeQuestions(aiQuestions);

    const quiz = await Quiz.create({
      title: `${topic} - AI Quiz`,
      description: `AI generated quiz on ${topic}`,
      topic,
      category,
      difficulty,
      questions: formattedQuestions,
      createdBy: req.user.id,
      isAI: true,
    });

    res.status(201).json({ message: "✅ AI Quiz created successfully", quiz });
  } catch (error) {
    res.status(500).json({ message: "❌ AI quiz generation failed", error: error.message });
  }
};
