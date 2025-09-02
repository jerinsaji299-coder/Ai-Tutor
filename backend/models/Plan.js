import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  teacherName: String,
  subject: String,
  grade: String,
  duration: Number,
  syllabusText: String,
  semesterPlan: Array,
  lessonAids: Array,
  assessments: Array,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Plan", PlanSchema);
