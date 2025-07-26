import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  imageUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileId: String,
  source: String,
});

const Like = mongoose.models.Like || mongoose.model("Like", LikeSchema);
export default Like;
