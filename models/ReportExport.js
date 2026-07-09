import mongoose from "mongoose";

const ReportExportSchema = new mongoose.Schema(
{
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "orgs", index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", index: true },

  type: {
    type: String,
    enum: ["leads", "analytics", "tasks", "followups"],
    required: true
  },

  filters: { type: Object, default: {} },

  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
    index: true
  },

  fileName: String,
  fileUrl: String,

  startedAt: Date,
  completedAt: Date,
  error: String
},
{ timestamps: true }
);

export default mongoose.models.report_exports ||
mongoose.model("report_exports", ReportExportSchema);
