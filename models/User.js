import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // ✅ fast lookups
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
   // ✅ exclude by default for safety
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
      index: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    ecoPoints: {
      type: Number,
      default: 0,
    },

    // ✅ Optional future-proofing
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" }, // e.g., profile image URL
  },
  { timestamps: true }
);

// ✅ Ensure email uniqueness at DB level
userSchema.index({ email: 1 }, { unique: true });

// ✅ Virtuals (for later if needed)
userSchema.virtual("quizzesCreated", {
  ref: "Quiz",
  localField: "_id",
  foreignField: "createdBy",
});

// ✅ Transform output (remove password & __v automatically)
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
