import mongoose, { Schema, Document } from "mongoose";

/**
 * Message data payload: flexible container for any message type.
 * - sender is the stable user identifier (userNumber).
 * - data holds the actual payload (text / image / video / file).
 * - image/video should be stored in compressed encoded form (encoded + mimeType)
 *   OR as an external URL (preferred for large files). Compression must be applied
 *   before saving (use your compressAndEncodeImage / compressAndEncodeVideo helpers).
 */

export interface IMessageData {
    type: "text" | "image" | "video" | "file";
    // text message
    text?: string;

    // preferred: small media encoded (compressed base64) stored inline
    encoded?: string; // base64 compressed payload (for small thumbnails / compressed images)
    mimeType?: string;

    // preferred for larger media: external URL (CDN / uploads)
    url?: string;

    // optional metadata
    caption?: string;
    size?: number; // bytes
    duration?: number; // seconds (for video/audio)
    compressed?: boolean; // true if encoded is compressed
    storageType?: "encoded" | "url" | "external"; // how to read payload
    thumbnailUrl?: string;
}

export interface IMessage {
    sender: string; // userNumber of sender
    data: IMessageData;
    timestamp: Date;
    // optional features
    replyTo?: string; // message _id
    reactions?: Record<string, string[]>; // reaction -> [userNumber,...]
    seenBy?: string[]; // userNumbers
}

export interface IGroup extends Document {
    groupID: string;
    groupName: string;
    groupProfilePicture?: {
        encoded?: string;
        mimeType?: string;
    } | null;
    groupDescription?: string;
    groupMemberss: Map<string, "member" | "admin">;
    groupmedia: IMessage[]; // array of message objects
}

const messageDataSchema = new Schema<IMessageData>(
    {
        type: { type: String, enum: ["text", "image", "video", "file"], required: true },
        text: { type: String, default: "" },

        encoded: { type: String, default: "" }, // compressed base64 (small payloads)
        mimeType: { type: String, default: "" },

        url: { type: String, default: "" }, // external/CDN url
        caption: { type: String, default: "" },

        size: { type: Number, default: 0 },
        duration: { type: Number, default: 0 },
        compressed: { type: Boolean, default: false },
        storageType: { type: String, enum: ["encoded", "url", "external"], default: "url" },
        thumbnailUrl: { type: String, default: "" },
    },
    { _id: false }
);

const messageSchema = new Schema<IMessage>(
    {
        sender: { type: String, required: true }, // userNumber
        data: { type: messageDataSchema, required: true },
        timestamp: { type: Date, default: Date.now },
        replyTo: { type: String, default: "" },
        reactions: { type: Schema.Types.Mixed, default: {} },
        seenBy: { type: [String], default: [] },
    },
    { _id: true } // keep _id for each message so it can be referenced
);

const groupSchema = new Schema<IGroup>(
    {
        groupID: {
            type: String,
            required: true,
            unique: true,
            default: () => new mongoose.Types.ObjectId().toHexString(),
        },
        groupName: { type: String, required: true },
        groupProfilePicture: {
            encoded: { type: String },
            mimeType: { type: String },
        },
        groupDescription: { type: String, default: "" },
        groupMemberss: {
            type: Map,
            of: { type: String, enum: ["member", "admin"] },
            default: {},
        },
        groupmedia: { type: [messageSchema], default: [] },
    },
    { timestamps: true }
);

export default mongoose.models.Group ||
    mongoose.model<IGroup>("Group", groupSchema);

