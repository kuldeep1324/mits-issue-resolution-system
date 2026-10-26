import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IComment extends Document {
  issueId: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  isOfficialResponse: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
    },
    isOfficialResponse: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
