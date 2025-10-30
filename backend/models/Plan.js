import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  teacherName: {
    type: String,
    default: 'Anonymous'
  },
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 52
  },
  syllabusText: {
    type: String,
    required: true
  },
  semesterPlan: [{
    week: Number,
    topics: String,
    activities: String
  }],
  lessonAids: [String],
  assessments: [String],
  saved: {
    type: Boolean,
    default: true
  },
  savedPlanId: String
}, {
  timestamps: true
});

// Index for better query performance
PlanSchema.index({ userId: 1, createdAt: -1 });
PlanSchema.index({ subject: 1, grade: 1 });

export default mongoose.model("Plan", PlanSchema);
