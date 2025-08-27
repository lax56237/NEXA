import mongoose, { Document, Schema } from "mongoose";

interface Like {
    username: string;
    timestamp: Date;
}

interface Comment {
    username: string;
    comment: string;
    timestamp: Date;
}

interface CompressedImageData {
    data: string; // compressed base64 data
    width: number;
    height: number;
    format: string;
    originalSize: number; // original file size in bytes
    compressedSize: number; // compressed data size in bytes
}

interface TextContent {
    type: "text";
    message: string;
    keywords: string[];
    description: string;
    likes: Like[];
    comments: Comment[];
    createdAt: Date;
}

interface ImageContent {
    type: "image";
    imageData: CompressedImageData;
    keywords: string[];
    description: string;
    likes: Like[];
    comments: Comment[];
    createdAt: Date;
}

interface VideoContent {
    type: "video";
    videoData: string; // compressed base64 video data
    thumbnail: CompressedImageData;
    keywords: string[];
    description: string;
    likes: Like[];
    comments: Comment[];
    createdAt: Date;
}

type Content = TextContent | ImageContent | VideoContent;

export interface IUserProfile extends Document {
    username: string;
    userEmail: string;
    userNumber: string;
    content: Content[];
    createdAt: Date;
    updatedAt: Date;
}

const LikeSchema = new Schema<Like>(
    {
        username: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    },
    { _id: false }
);

const CommentSchema = new Schema<Comment>(
    {
        username: { type: String, required: true },
        comment: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    },
    { _id: false }
);

const CompressedImageDataSchema = new Schema<CompressedImageData>(
    {
        data: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        format: { type: String, required: true },
        originalSize: { type: Number, required: true },
        compressedSize: { type: Number, required: true }
    },
    { _id: false }
);

const ContentSchema = new Schema<Content>(
    {
        type: { type: String, enum: ["text", "image", "video"], required: true },
        message: { type: String }, 
        imageData: { type: CompressedImageDataSchema },     
        videoData: { type: String },
        thumbnail: { type: CompressedImageDataSchema },
        keywords: { type: [String], required: true },
        description: { type: String, required: true },
        likes: { type: [LikeSchema], default: [] },
        comments: { type: [CommentSchema], default: [] },
        createdAt: { type: Date, default: Date.now }
    },
    { _id: false }
);

const UserProfileSchema = new Schema<IUserProfile>(
    {
        username: { type: String, required: true },
        userEmail: { type: String, required: true },
        userNumber: { type: String, required: true },
        content: { type: [ContentSchema], required: true },
    },
    { timestamps: true }
);

const UserProfile =
    mongoose.models.UserProfile ||
    mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);

export default UserProfile;
