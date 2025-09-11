import mongoose, { Schema, Document } from "mongoose";

// -------------------------
// Interfaces
// -------------------------
interface Video {
  title: string;
  description?: string;
  videoThumbnail: string; // compressed (base64 / optimized img)
  video: string;          // compressed (maybe lower bitrate or cloud link)
}

interface Channel {
  name: string;
  description: string;
  profileImage: string;   // compressed
  videos: Video[];
}

export interface IChannel extends Document {
  userEmail: string;
  userNumber: string;
  channels: Channel[];
}

// -------------------------
// Schemas
// -------------------------
const VideoSchema = new Schema<Video>(
  {
    title: { type: String, required: true },
    description: { type: String },
    videoThumbnail: { type: String, required: true },
    video: { type: String, required: true },
  },
  { _id: false }
);

const ChannelSchema = new Schema<Channel>(
  {
    name: { type: String, required: true },
    description: { type: String },
    profileImage: { type: String, required: true },
    videos: { type: [VideoSchema], default: [] },
  },
  { _id: false }
);

const ChannelModelSchema = new Schema<IChannel>(
  {
    userEmail: { type: String, required: true },
    userNumber: { type: String, required: true },
    channels: { type: [ChannelSchema], default: [] },
  },
  { timestamps: true }
);

// -------------------------
// Export
// -------------------------
const Channel =
  (mongoose.models.Channel as mongoose.Model<IChannel>) ||
  mongoose.model<IChannel>("Channel", ChannelModelSchema);

export default Channel;
