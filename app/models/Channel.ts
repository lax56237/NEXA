import mongoose, { Schema, Document } from "mongoose";

export interface IVideo {
    videoID: string;
    title: string;
    description: string;
    videoData: string; // compressed base64 video data or URL
    thumbnail: {
        data: string; // compressed base64 data
        width: number;
        height: number;
        format: string;
    };
    likes: string[]; // array of userNumbers who liked the video
    views: {
        count: number;
        viewers: string[]; // array of userNames from UserDetails who viewed the video
    };
    uploadDate: Date;
    duration: number; // in seconds
    mimeType: string;
    storageType: "encoded" | "url" | "external";
}

export interface IChannel extends Document {
    channelID: string;
    channelName: string;
    channelDescription: string;
    channelProfilePicture?: {
        encoded?: string;
        mimeType?: string;
    } | null;
    owner: string; // userNumber of the channel owner
    subscribers: string[]; // array of userNumbers who subscribed
    videos: IVideo[];
    totalWatchTime: number; // in seconds
    createdAt: Date;
}

const videoSchema = new Schema<IVideo>(
    {
        videoID: {
            type: String,
            required: true,
            default: () => new mongoose.Types.ObjectId().toHexString(),
        },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        videoData: { type: String, required: true }, // compressed base64 or URL
        thumbnail: {
            data: { type: String, required: true },
            width: { type: Number, required: true },
            height: { type: Number, required: true },
            format: { type: String, required: true },
        },
        likes: [{ type: String }], // userNumbers who liked
        views: {
            count: { type: Number, default: 0 },
            viewers: [{ type: String }], // userNames who viewed
        },
        uploadDate: { type: Date, default: Date.now },
        duration: { type: Number, default: 0 },
        mimeType: { type: String, default: "video/mp4" },
        storageType: { type: String, enum: ["encoded", "url", "external"], default: "url" },
    },
    { _id: true }
);

const channelSchema = new Schema<IChannel>(
    {
        channelID: {
            type: String,
            required: true,
            unique: true,
            default: () => new mongoose.Types.ObjectId().toHexString(),
        },
        channelName: { type: String, required: true },
        channelDescription: { type: String, default: "" },
        channelProfilePicture: {
            encoded: { type: String },
            mimeType: { type: String },
        },
        owner: { type: String, required: true }, // userNumber
        subscribers: [{ type: String }], // array of userNumbers
        videos: [videoSchema],
        totalWatchTime: { type: Number, default: 0 }, // in seconds
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.models.Channel || mongoose.model<IChannel>("Channel", channelSchema);