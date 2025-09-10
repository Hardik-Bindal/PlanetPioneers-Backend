import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId, // reference to Quiz question _id
      required: true,
    },
    selectedAnswer: {
      type: [String], // ✅ allow multiple answers
      default: [],
    },
    correctAnswer: {
      type: [String], // ✅ also store correct answers for result review
      default: [],
    },
    explanation: {
      type: String, // ✅ explanation from Quiz schema
      default: "",
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",   // ✅ link to attempted quiz
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // ✅ link to student
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    answers: {
      type: [answerSchema], // ✅ structured sub-schema
      default: [],
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ Index for performance
resultSchema.index({ student: 1, quiz: 1 });  // one student’s attempt per quiz
resultSchema.index({ quiz: 1 });              // teacher viewing all results
resultSchema.index({ student: 1 });           // student viewing own results

const Result = mongoose.model("Result", resultSchema);

export default Result;
