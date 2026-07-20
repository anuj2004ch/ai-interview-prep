const mongoose = require('mongoose');

const technicalQuestionSchema = new mongoose.Schema({
    question: { type: String, required: [true, "Technical question is required"] },
    intention: { type: String, required: [true, "Intention is required"] },
    answer:    { type: String, required: [true, "Answer is required"] }
}, { _id: false })

const behavioralQuestionSchema = new mongoose.Schema({
    question: { type: String, required: [true, "Behavioral question is required"] },
    intention: { type: String, required: [true, "Intention is required"] },
    answer:    { type: String, required: [true, "Answer is required"] }
}, { _id: false })

const skillGapSchema = new mongoose.Schema({
    skill:    { type: String, required: [true, "Skill is required"] },
    severity: { type: String, enum: ["low", "medium", "high"], required: [true, "Severity is required"] }
}, { _id: false })

const preparationPlanSchema = new mongoose.Schema({
    day:   { type: Number, required: [true, "Day is required"] },
    focus: { type: String, required: [true, "Focus is required"] },
    tasks: [{ type: String, required: [true, "Task is required"] }]
},{
    _id:false
})

const checkedTaskSchema = new mongoose.Schema({
    dayIndex:  { type: Number, required: true },
    taskIndex: { type: Number, required: true }
}, { _id: false })

// ─── DSA Question Schema ───────────────────────────────────────────────────────
const dsaExampleSchema = new mongoose.Schema({
    input:       { type: String },
    output:      { type: String },
    explanation: { type: String }
}, { _id: false })

const dsaQuestionSchema = new mongoose.Schema({
    title:           { type: String, required: true },
    difficulty:      { type: String, enum: ["easy", "medium", "hard"], required: true },
    description:     { type: String, required: true },
    examples:        [dsaExampleSchema],
    constraints:     [{ type: String }],
    hints:           [{ type: String }],
    approach:        { type: String },  // model solution approach
    solution:        { type: String },  // model solution code
    timeComplexity:  { type: String },
    spaceComplexity: { type: String },
    tags:            [{ type: String }]
}, { _id: false })

const interviewReportSchema = new mongoose.Schema({
    jobDescription:      { type: String, required: [true, "Job description is required"] },
    resume:              { type: String },
    selfDescription:     { type: String },
    matchScore:          { type: Number, min: 0, max: 100 },
    technicalQuestions:  [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps:           [skillGapSchema],
    preparationPlan:     [preparationPlanSchema],
    dsaQuestions:        [dsaQuestionSchema],   // ← NEW
    user:                { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    title:               { type: String, required: [true, "Job title is required"] },
    checkedTasks:        { type: [checkedTaskSchema], default: [] },
    isPublic:            { type: Boolean, default: false }
}, { timestamps: true })

interviewReportSchema.index({ user: 1, createdAt: -1 })

const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);
module.exports = interviewReportModel;
