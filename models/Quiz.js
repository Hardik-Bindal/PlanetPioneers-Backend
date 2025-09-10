import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
  },
  options: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.length >= 2; // at least 2 options required
      },
      message: "A question must have at least 2 options.",
    },
    required: true,
  },
  correctAnswer: {
    type: [String], // ✅ now supports multiple correct answers (["A", "C"])
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length >= 1; // must have at least one correct option
      },
      message: "At least one correct answer is required.",
    },
  },
  explanation: {
    type: String,
    default: "",
    trim: true,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAI: {
      type: Boolean,
      default: false,
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

quizSchema.index({ topic: 1 });
quizSchema.index({ category: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
