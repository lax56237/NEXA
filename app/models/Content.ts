import mongoose, { Schema, Document } from "mongoose";

export interface IContent extends Document {
    author: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    type: "post" | "article" | "video" | "image";
    tags: string[];
    contentUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContentSchema: Schema = new Schema(
    {
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        description: { type: String },
        type: { type: String, enum: ["post", "article", "video", "image"], default: "post" },
        tags: { type: [String], default: [] },
        contentUrl: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IContent>("Content", ContentSchema);